import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TestSuitesService } from './test-suites.service';
import { CreateTestSuiteDto } from './dtos/create-test-suite.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/authentication/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CurrentUser as CurrentUserType } from 'src/types';
import { CreateTestCaseDto } from './dtos/create-test-case.dto';

@Controller('test-suites')
export class TestSuitesController {
  constructor(private testSuiteService: TestSuitesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTestSuite(
    @Body() createTestSuiteDto: CreateTestSuiteDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.testSuiteService.createTestSuite(
      createTestSuiteDto,
      currentUser,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTestSuites(@CurrentUser() currentUser: any) {
    console.log(currentUser);
    return this.testSuiteService.getTestSuitesByOrgId(
      currentUser.org_id || currentUser.user_id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTestSuite(@Param('id') testSuiteId: string) {
    return this.testSuiteService.getTestSuiteById(testSuiteId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTestSuite(@Param('id') testSuiteId: string) {
    return this.testSuiteService.deleteTestSuite(testSuiteId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/test-case')
  async createTestCase(
    @Param('id') testSuiteId: string,
    @Body() createTestCaseDto: CreateTestCaseDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.testSuiteService.createTestCase(
      testSuiteId,
      createTestCaseDto,
      currentUser,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/test-case/reorder')
  async reorderTestCases(@Param('id') testSuiteId: string, @Body() body: any) {
    console.log(body);
    return this.testSuiteService.reorderTestCases(
      testSuiteId,
      body.testCaseIds,
    );
  }
}
