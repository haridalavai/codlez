import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class BrowserService {
  async getBrowser() {
    const browser = await puppeteer.connect({
      browserWSEndpoint: `ws://localhost:3000/?token=xxx`,
    });
    const page = await browser.newPage();
    await page.goto('https://example.com/');
    // await browser.close();
    return 'Browser opened';
  }
}
