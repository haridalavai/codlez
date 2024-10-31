import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExecuteTestSuiteDto {
  @IsString()
  @IsNotEmpty()
  testSuiteId: string;

  @IsString()
  @IsNotEmpty()
  organizationId: string;
}
