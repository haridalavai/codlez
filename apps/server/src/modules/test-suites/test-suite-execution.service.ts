import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { PuppeteerService } from './puppeteer.service';
import { TestCaseStatus } from './test-suites.service';
import { Socket } from 'socket.io';
import PuppeteerMassScreenshots from './screenshooter';

@Injectable()
export class TestSuiteExecutionService {
  private readonly logger = new Logger(TestSuiteExecutionService.name);

  constructor(
    private prisma: PrismaService,
    private puppeteerService: PuppeteerService,
    private screenshooter: PuppeteerMassScreenshots,
  ) {}

  /**
   * Executes the entire test suite.
   * @param testSuiteId - The ID of the test suite to execute.
   * @param organizationId - The organization ID.
   * @param socket - The WebSocket instance for real-time communication.
   */
  async executeTestSuite(
    testSuiteId: string,
    organizationId: string,
    socket: Socket,
  ) {
    let browser;
    try {
      // Fetch the test suite along with its test cases
      const testSuite = await this.prisma.test_suites.findUnique({
        where: {
          id: testSuiteId,
          is_active: true,
          is_deleted: false,
        },
        include: {
          test_cases: {
            include: {
              next_test_case: true,
              previous_test_case: true,
            },
          },
        },
      });

      if (!testSuite) {
        throw new NotFoundException('Test suite not found');
      }

      const testCases = testSuite.test_cases;
      const headTestCase = testCases.find(
        (testCase) => testCase.id === testSuite.head_test_case,
      );

      if (!headTestCase) {
        throw new NotFoundException('Head test case not found');
      }

      // Create a test suite execution record
      const testSuiteExecution = await this.prisma.test_suite_executions.create({
        data: {
          started_at: new Date(),
          overall_status: TestCaseStatus.RUNNING,
          test_suite: { connect: { id: testSuiteId } },
        },
      });

      this.logger.log('Launching browser...');
      browser = await this.puppeteerService.launchBrowser();
      this.logger.log('Browser launched.');

      this.logger.log('Opening new page...');
      const page = await browser.newPage();
      this.logger.log('New page opened.');

      await page.setViewport({
        width: 1255,
        height: 800,
      });

      // Initialize and start the screenshooter
      await this.screenshooter.init(page, socket, {}, testSuiteId);
      await this.screenshooter.start();

      this.logger.log(`Navigating to URL: ${testSuite.url}`);
      await page.goto(testSuite.url, { waitUntil: 'networkidle2' });

      // Emit the debugger URL to the frontend
      const debuggerUrl = await this.puppeteerService.getDebuggerUrl();
      socket.emit(`debugger-url-${testSuiteId}`, { url: debuggerUrl });

      // Update test suite status to RUNNING
      await this.updateTestSuiteStatus(testSuiteId, TestCaseStatus.RUNNING);

      // Execute all test cases in the chain
      await this.executeTestCasesChain(
        headTestCase,
        page,
        socket,
        testSuiteId,
        testSuiteExecution.id,
      );

      // Finalize the execution by updating records and informing the frontend
      await this.finalizeTestSuiteExecution(
        testSuiteId,
        TestCaseStatus.PASSED,
        socket,
      );

      // Ensure all screenshooter operations are complete before closing
      await this.screenshooter.stop();

      this.logger.log('Closing browser...');
      // await browser.close();
      this.logger.log('Browser closed.');
    } catch (error) {
      this.logger.error('Error executing test suite:', error);

      // Attempt to gracefully close the browser if it's open
      if (browser) {
        try {
          this.logger.log('Attempting to close browser due to error...');
          await browser.close();
          this.logger.log('Browser closed after error.');
        } catch (closeError) {
          this.logger.error('Error closing browser:', closeError);
        }
      }

      // Emit error to the client via WebSocket
      // socket.emit('error', { message: error.message || 'An error occurred during test suite execution.' });
    }
  }

  /**
   * Executes the test cases in a sequential chain.
   * @param currentTestCase - The current test case to execute.
   * @param page - The Puppeteer page instance.
   * @param socket - The WebSocket instance for real-time communication.
   * @param testSuiteId - The ID of the test suite.
   * @param testSuiteExecutionId - The ID of the test suite execution record.
   */
  private async executeTestCasesChain(
    currentTestCase: any,
    page: any,
    socket: Socket,
    testSuiteId: string,
    testSuiteExecutionId: string,
  ) {
    while (currentTestCase) {
      this.logger.log(`Executing test case: ${currentTestCase.id}`);

      // Update test case status to RUNNING
      await this.updateTestCaseStatus(currentTestCase.id, TestCaseStatus.RUNNING);
      socket.emit(`test-case-status-${currentTestCase.id}`, {
        latest_result: TestCaseStatus.RUNNING,
        latest_run: new Date(),
      });

      // Create a test case execution record
      const testCaseExecution = await this.prisma.test_case_executions.create({
        data: {
          test_case: { connect: { id: currentTestCase.id } },
          test_suite_execution: { connect: { id: testSuiteExecutionId } },
          sequence_position: 0, // Adjust as needed
          snapshot_action: currentTestCase.command,
          executed_at: new Date(),
          snapshot_command: currentTestCase.command,
          snapshot_locator: currentTestCase.locator,
        },
      });

      // Execute the test case command
      const executionResponse = await this.puppeteerService.executeTestCaseCommand(
        page,
        currentTestCase.command,
        currentTestCase.locator,
        currentTestCase.content,
      );

      // Update test case status based on execution
      await this.updateTestCaseStatus(currentTestCase.id, executionResponse.status as TestCaseStatus);
      await this.prisma.test_case_executions.update({
        where: { id: testCaseExecution.id },
        data: { result: executionResponse.status as TestCaseStatus },
      });

      socket.emit(`test-case-status-${currentTestCase.id}`, {
        latest_result: executionResponse.status,
        latest_run: new Date(),
      });

      this.logger.log(`Test case ${currentTestCase.id} executed with status: ${executionResponse.status}`);

      // Move to the next test case
      currentTestCase = currentTestCase.next_test_case;
    }
  }

  /**
   * Finalizes the test suite execution by updating records and emitting final status.
   * @param testSuiteId - The ID of the test suite.
   * @param status - The final status of the test suite execution.
   * @param socket - The WebSocket instance for real-time communication.
   */
  private async finalizeTestSuiteExecution(
    testSuiteId: string,
    status: TestCaseStatus,
    socket: Socket,
  ) {
    try {
      const endTime = new Date();

      // Update the test suite execution record with end time and final status
      const updatedExecution = await this.prisma.test_suite_executions.updateMany({
        where: {
          test_suite_id: testSuiteId,
          overall_status: TestCaseStatus.RUNNING, // Ensure we're updating the currently running execution
        },
        data: {
          completed_at: endTime,
          overall_status: status,
        },
      });

      if (updatedExecution.count === 0) {
        this.logger.warn(`No running execution found for Test Suite ID: ${testSuiteId}`);
      } else {
        this.logger.log(`Test suite execution for ${testSuiteId} finalized with status: ${status}`);
      }

      // Update the test suite's latest status and run time
      await this.updateTestSuiteStatus(testSuiteId, status);

      // Emit the final status to the client via WebSocket
      socket.emit(`test-suite-status-${testSuiteId}`, {
        latest_result: status,
        latest_run: endTime,
      });

      this.logger.log(`Final status emitted for Test Suite ID: ${testSuiteId}`);
    } catch (error) {
      this.logger.error(`Error finalizing test suite execution for ${testSuiteId}:`, error);
    }
  }

  /**
   * Updates the status of a specific test case.
   * @param testCaseId - The ID of the test case.
   * @param status - The new status of the test case.
   */
  private async updateTestCaseStatus(testCaseId: string, status: TestCaseStatus) {
    await this.prisma.test_cases.update({
      where: { id: testCaseId },
      data: {
        latest_result: status,
        latest_run: new Date(),
      },
    });
    this.logger.log(`Test case ${testCaseId} status updated to ${status}`);
  }

  /**
   * Updates the status of the test suite.
   * @param testSuiteId - The ID of the test suite.
   * @param status - The new status of the test suite.
   */
  private async updateTestSuiteStatus(testSuiteId: string, status: TestCaseStatus) {
    await this.prisma.test_suites.update({
      where: { id: testSuiteId },
      data: {
        latest_result: status,
        latest_run: new Date(),
      },
    });
    this.logger.log(`Test suite ${testSuiteId} status updated to ${status}`);
    // Emit status update if needed
  }
}
