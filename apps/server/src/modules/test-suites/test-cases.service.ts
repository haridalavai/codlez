import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { CreateTestCaseDto } from './dtos/create-test-case.dto';
import { CurrentUser } from 'src/types';
import { getLocator } from 'src/utils/get-locator';
import { getSnapshot } from 'src/utils/get-page-content';
import { PuppeteerService } from './puppeteer.service';
import { DomService } from './dom.service';

@Injectable()
export class TestCasesService {
  constructor(
    private prisma: PrismaService,
    private puppeteerService: PuppeteerService,
    private domService: DomService,
  ) {}

  async createTestCase(
    testSuiteId: string,
    createTestCaseDto: CreateTestCaseDto,
    currentUser: CurrentUser,
  ) {
    const { action, next_step_id, previous_step_id } = createTestCaseDto;

    const testSuite = await this.prisma.test_suites.findUnique({
      where: { id: testSuiteId },
    });

    if (!testSuite) {
      throw new NotFoundException('Test suite not found');
    }

    const newTestCase = await this.prisma.test_cases.create({
      data: {
        action,
        test_suites: {
          connect: { id: testSuiteId },
        },
        created_by: currentUser.user_id,
      },
      include: {
        next_test_case: true,
        previous_test_case: true,
      },
    });

    // Connect to Previous Test Case
    if (previous_step_id) {
      await this.connectPreviousTestCase(previous_step_id, newTestCase.id);
    }

    // Connect to Next Test Case
    if (next_step_id) {
      await this.connectNextTestCase(next_step_id, newTestCase.id);
    }

    // If first test case, connect it to the test suite
    if (!previous_step_id) {
      await this.prisma.test_suites.update({
        where: { id: testSuiteId },
        data: { head_test_case: newTestCase.id },
      });
    }

    return newTestCase;
  }

  private async connectPreviousTestCase(
    previousTestCaseId: string,
    newTestCaseId: string,
  ) {
    const previousTestCase = await this.prisma.test_cases.findUnique({
      where: { id: previousTestCaseId },
    });

    if (!previousTestCase) {
      throw new NotFoundException('Previous test case not found');
    }

    await this.prisma.test_cases.update({
      where: { id: previousTestCaseId },
      data: {
        next_test_case: { connect: { id: newTestCaseId } },
      },
    });

    await this.prisma.test_cases.update({
      where: { id: newTestCaseId },
      data: {
        previous_test_case: { connect: { id: previousTestCaseId } },
      },
    });
  }

  private async connectNextTestCase(
    nextTestCaseId: string,
    newTestCaseId: string,
  ) {
    const nextTestCase = await this.prisma.test_cases.findUnique({
      where: { id: nextTestCaseId },
    });

    if (!nextTestCase) {
      throw new NotFoundException('Next test case not found');
    }

    await this.prisma.test_cases.update({
      where: { id: nextTestCaseId },
      data: {
        previous_test_case: { connect: { id: newTestCaseId } },
      },
    });

    await this.prisma.test_cases.update({
      where: { id: newTestCaseId },
      data: {
        next_test_case: { connect: { id: nextTestCaseId } },
      },
    });
  }

  async reorderTestCases(testSuiteId: string, testCaseIds: string[]) {
    const testSuite = await this.prisma.test_suites.findUnique({
      where: { id: testSuiteId },
      include: { test_cases: true },
    });

    if (!testSuite) {
      throw new NotFoundException('Test suite not found');
    }

    if (testSuite.test_cases.length !== testCaseIds.length) {
      throw new NotFoundException('Test case not found');
    }

    const testCasesMap = testSuite.test_cases.reduce(
      (acc, testCase) => {
        acc[testCase.id] = testCase;
        return acc;
      },
      {} as Record<string, any>,
    );

    for (let i = 0; i < testCaseIds.length; i++) {
      const testCaseId = testCaseIds[i];
      const testCase = testCasesMap[testCaseId];

      if (i === 0) {
        await this.prisma.test_suites.update({
          where: { id: testSuiteId },
          data: { head_test_case: testCase.id },
        });
      }

      if (i > 0) {
        await this.prisma.test_cases.update({
          where: { id: testCase.id },
          data: { previous_test_case: { connect: { id: testCaseIds[i - 1] } } },
        });
      }

      if (i < testCaseIds.length - 1) {
        await this.prisma.test_cases.update({
          where: { id: testCase.id },
          data: { next_test_case: { connect: { id: testCaseIds[i + 1] } } },
        });
      }
    }

    // Disconnect last test case's next_test_case
    await this.prisma.test_cases.update({
      where: { id: testCaseIds[testCaseIds.length - 1] },
      data: { next_test_case: { disconnect: true } },
    });

    // Disconnect first test case's previous_test_case
    await this.prisma.test_cases.update({
      where: { id: testCaseIds[0] },
      data: { previous_test_case: { disconnect: true } },
    });

    return this.prisma.test_cases.findMany({
      where: { test_suite_id: testSuiteId },
      include: { next_test_case: true, previous_test_case: true },
    });
  }

  // Additional Test Case related methods can be added here
}
