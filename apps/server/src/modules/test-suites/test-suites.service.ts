import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { CreateTestSuiteDto } from './dtos/create-test-suite.dto';
import { CurrentUser } from 'src/types';
import { TestCasesService } from './test-cases.service';
import { TestSuiteExecutionService } from './test-suite-execution.service';
import { CreateTestCaseDto } from './dtos/create-test-case.dto';
import clerkClient from 'src/shared/clerk-client.service';

export enum TestCaseStatus{
  NOT_RUN = 'NOT_RUN',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}

@Injectable()
export class TestSuitesService {
  constructor(
    private prisma: PrismaService,
    private testCasesService: TestCasesService,
    private testSuiteExecutionService: TestSuiteExecutionService,
  ) {}

  async getTestSuitesByOrgId(orgId: string) {
    const testSuites = await this.prisma.test_suites.findMany({
      where: {
        organization_id: orgId,
        is_active: true,
        is_deleted: false,
      },
      include: { test_cases: true },
    });
    return testSuites;
  }

  async getTestSuiteById(testSuiteId: string) {
    const testSuite = await this.prisma.test_suites.findUnique({
      where: {
        id: testSuiteId,
        is_active: true,
        is_deleted: false,
      },
      include: {
        test_cases: {
          include: { next_test_case: true, previous_test_case: true },
        },
      },
    });

    if (!testSuite) {
      throw new NotFoundException('Test suite not found');
    }

    const created_by_user = await clerkClient.users.getUser(testSuite.created_by);

    return {
      ...testSuite,
      created_by_user: {
        full_name: created_by_user.fullName,
        profile_image: created_by_user.imageUrl,
        email: created_by_user.emailAddresses[0].emailAddress,
      },
    };
  }

  async createTestSuite(createTestSuiteDto: CreateTestSuiteDto, currentUser: CurrentUser) {
    const { name, description, url } = createTestSuiteDto;
    const testSuite = await this.prisma.test_suites.create({
      data: {
        name,
        description,
        url,
        organization_id: currentUser.org_id || currentUser.user_id,
        created_by: currentUser.user_id,
      },
    });
    return testSuite;
  }

  async deleteTestSuite(testSuiteId: string) {
    const testSuite = await this.prisma.test_suites.findUnique({
      where: {
        id: testSuiteId,
        is_active: true,
        is_deleted: false,
      },
    });

    if (!testSuite) {
      throw new NotFoundException('Test suite not found');
    }

    await this.prisma.test_suites.update({
      where: { id: testSuiteId },
      data: { is_deleted: true, is_active: false },
    });

    return { message: 'Test suite deleted successfully' };
  }

  async createTestCase(
    testSuiteId: string,
    createTestCaseDto: CreateTestCaseDto,
    currentUser: CurrentUser,
  ) {
    return this.testCasesService.createTestCase(testSuiteId, createTestCaseDto, currentUser);
  }

  async reorderTestCases(testSuiteId: string, testCaseIds: string[]) {
    return this.testCasesService.reorderTestCases(testSuiteId, testCaseIds);
  }

  async executeTestSuite(testSuiteId: string, organizationId: string, socket: any) {
    return this.testSuiteExecutionService.executeTestSuite(testSuiteId, organizationId, socket);
  }

  // Additional Test Suite related methods can be added here
}
