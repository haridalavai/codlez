import { Controller, Get } from '@nestjs/common';
import { BrowserService } from './browser.service';

@Controller('browser')
export class BrowserController {
  constructor(private browserService: BrowserService) {}

  @Get()
  async getBrowser() {
    return this.browserService.getBrowser();
  }
}
