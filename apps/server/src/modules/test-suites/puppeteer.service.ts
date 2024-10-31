import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { VanillaPuppeteer } from 'puppeteer-extra';
import { Browser, Page, LaunchOptions, ScreenshotOptions } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ConfigService } from '@nestjs/config';
import { TestCaseStatus } from './test-suites.service';

/**
 * Service responsible for managing Puppeteer browser instances and executing test commands.
 */
@Injectable()
export class PuppeteerService implements OnModuleDestroy {
  private readonly logger = new Logger(PuppeteerService.name);
  private browser: Browser | null = null;

  constructor(private configService: ConfigService) {
    puppeteer.use(StealthPlugin());
  }

  /**
   * Launches a Puppeteer browser instance with configurable options.
   * @returns The launched Browser instance.
   */
  async launchBrowser(): Promise<Browser> {
    if (this.browser) {
      this.logger.warn('Browser instance already exists. Reusing the existing browser.');
      return this.browser;
    }

    const launchOptions: Parameters<VanillaPuppeteer['launch']>[0] = {
      headless: this.getHeadlessMode(),
      defaultViewport: null,
      args: this.getBrowserArgs(),
      timeout: this.getLaunchTimeout(),
      devtools: this.getDevtools(),
    };

    try {
      this.browser = await puppeteer.launch(launchOptions);
      this.logger.log('Browser launched successfully with options:', launchOptions);
      return this.browser;
    } catch (error) {
      this.logger.error('Failed to launch browser:', error);
      throw new Error('BrowserLaunchError: Unable to launch Puppeteer browser.');
    }
  }

  /**
   * Retrieves the WebSocket debugger URL for the launched browser.
   * @returns The WebSocket debugger URL as a string.
   */
  async getDebuggerUrl(): Promise<string> {
    if (!this.browser) {
      throw new Error('BrowserNotLaunchedError: Browser has not been launched yet.');
    }
    const wsEndpoint = this.browser.wsEndpoint();
    const debuggerUrl = `http://localhost:3002/devtools/inspector.html?ws=${wsEndpoint}`;
    this.logger.debug(`Debugger URL: ${debuggerUrl}`);
    return debuggerUrl;
  }

  /**
   * Executes a specified command on the given Puppeteer page.
   * @param page - The Puppeteer Page instance.
   * @param command - The command to execute (e.g., CLICK, TYPE).
   * @param locator - The selector for the target element.
   * @param value - The value to type (if applicable).
   * @returns An object containing the status of the execution.
   */
  async executeTestCaseCommand(
    page: Page,
    command: string,
    locator: string,
    value?: string,
  ): Promise<{ status: string }> {
    try {
      switch (command.toUpperCase()) {
        case 'CLICK':
          await page.click(locator);
          this.logger.debug(`Executed CLICK on selector: ${locator}`);
          return { status: TestCaseStatus.PASSED };

        case 'TYPE':
          if (value === undefined) {
            throw new Error('TypeCommandError: No value provided for TYPE command.');
          }
          await page.type(locator, value);
          this.logger.debug(`Executed TYPE on selector: ${locator} with value: ${value}`);
          return { status: TestCaseStatus.PASSED };

        case 'SCROLL':
          await page.evaluate((loc: string) => {
            const element = document.querySelector(loc);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, locator);
          this.logger.debug(`Executed SCROLL on selector: ${locator}`);
          return { status: TestCaseStatus.PASSED };

        case 'HOVER':
          await page.hover(locator);
          this.logger.debug(`Executed HOVER on selector: ${locator}`);
          return { status: TestCaseStatus.PASSED };

        case 'CAPTURE':
          const screenshotOptions: ScreenshotOptions = {
            path: `screenshot-${Date.now()}.png`,
            fullPage: true,
          };
          await page.screenshot(screenshotOptions);
          this.logger.debug(`Captured screenshot: ${screenshotOptions.path}`);
          return { status: TestCaseStatus.PASSED };

        default:
          this.logger.warn(`Unknown command received: ${command}`);
          return { status: TestCaseStatus.FAILED };
      }
    } catch (error) {
      this.logger.error(`Error executing command ${command}:`, error);
      return { status: TestCaseStatus.FAILED };
    }
  }

  /**
   * Closes the Puppeteer browser instance gracefully.
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.logger.log('Browser closed successfully.');
      } catch (error) {
        this.logger.error('Error closing browser:', error);
      } finally {
        this.browser = null;
      }
    } else {
      this.logger.warn('No browser instance found to close.');
    }
  }

  /**
   * Retrieves the headless mode configuration.
   * @returns A boolean indicating whether to run in headless mode.
   */
  private getHeadlessMode(): boolean {
    const headless = this.configService.get<string>('PUPPETEER_HEADLESS', 'true');
    return headless.toLowerCase() === 'true';
  }

  /**
   * Retrieves the browser arguments from configuration.
   * @returns An array of browser arguments.
   */
  private getBrowserArgs(): string[] {
    const args = this.configService.get<string>('PUPPETEER_ARGS', '--no-sandbox,--disable-setuid-sandbox');
    const argsArray = args.split(',').map(arg => arg.trim());
    argsArray.push('--remote-debugging-port=3002');
    return argsArray;
  }

  /**
   * Retrieves the launch timeout from configuration.
   * @returns A number representing the launch timeout in milliseconds.
   */
  private getLaunchTimeout(): number {
    const timeout = this.configService.get<number>('PUPPETEER_LAUNCH_TIMEOUT', 500000);
    return timeout;
  }

  /**
   * Retrieves the devtools configuration.
   * @returns A boolean indicating whether to open devtools.
   */
  private getDevtools(): boolean {
    const devtools = this.configService.get<string>('PUPPETEER_DEVTOOLS', 'false');
    return devtools.toLowerCase() === 'true';
  }

  /**
   * Lifecycle hook to ensure the browser is closed when the application is shutting down.
   */
  async onModuleDestroy() {
    await this.closeBrowser();
  }
}
