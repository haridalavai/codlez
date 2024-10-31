import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTestCaseDto {

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  next_step_id: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  previous_step_id: string;
}
