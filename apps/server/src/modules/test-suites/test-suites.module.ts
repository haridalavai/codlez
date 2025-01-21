import { Module } from '@nestjs/common';
import { TestSuitesController } from './test-suites.controller';
import { TestSuitesService } from './test-suites.service';
import { PrismaService } from 'src/shared/prisma.service';
import { TestSuiteGateway } from './test-suite.gateway';
import { PuppeteerService } from './puppeteer.service';
import { TestCasesService } from './test-cases.service';
import { TestSuiteExecutionService } from './test-suite-execution.service';
import { DomService } from './dom.service';
import PuppeteerMassScreenshots from './screenshooter';

@Module({
  imports: [],
  controllers: [TestSuitesController],
  providers: [
    TestSuitesService,
    TestCasesService,
    TestSuiteExecutionService,
    PrismaService,
    TestSuiteGateway,
    PuppeteerService,
    PuppeteerMassScreenshots,
    DomService,
  ],
})
export class TestSuitesModule {}
