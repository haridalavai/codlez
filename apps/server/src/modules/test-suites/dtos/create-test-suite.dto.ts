import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateTestSuiteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl({
    require_protocol: true,
    require_host: true,
    require_tld: true,
  })
  url: string;
}
