// src/modules/browser/screenshooter.ts
import { Injectable } from '@nestjs/common';
import { CDPSession, Page } from 'puppeteer';
import { Socket } from 'socket.io';
import { join } from 'path';

interface RunOptions {
  beforeWritingImageFile?: () => Promise<void>;
  afterWritingImageFile?: (filename: string) => Promise<void>;
  beforeAck?: () => Promise<void>;
  afterAck?: () => Promise<void>;
}

interface StartOptions {
  format?: 'jpeg' | 'png';
  quality?: number;
  everyNthFrame?: number;
}

interface ScreencastFrame {
  data: string;
  sessionId: number;
}

@Injectable()
class PuppeteerMassScreenshots {
  private socket: Socket | undefined;
  private page: Page | undefined;
  private client: CDPSession | undefined;
  private canScreenshot: boolean = true;
  private pendingFrames: number = 0;
  private stopScreencastPromise: Promise<void> | null = null;
  private resolveStopScreencast!: () => void;

  async init(
    page: Page,
    socket: Socket,
    options: Partial<RunOptions> = {},
    testSuiteId: string,
  ): Promise<void> {
    try {
      const runOptions: RunOptions = {
        beforeWritingImageFile: async () => {},
        afterWritingImageFile: async () => {},
        beforeAck: async () => {},
        afterAck: async () => {},
        ...options,
      };

      this.socket = socket;
      this.page = page;
      this.client = await this.page.target().createCDPSession();
      this.canScreenshot = true;

      this.client.on(
        'Page.screencastFrame',
        async (frameObject: ScreencastFrame) => {
          if (!this.canScreenshot) return;
          
          this.pendingFrames++;
          try {
            await runOptions.beforeWritingImageFile();
            const filename = await this.writeImageFilename(
              frameObject.data,
              testSuiteId,
            );
            await runOptions.afterWritingImageFile(filename);
            await runOptions.beforeAck();
            
            await this.client!.send('Page.screencastFrameAck', {
              sessionId: frameObject.sessionId,
            });
            
            await runOptions.afterAck();
          } catch (e) {
            this.canScreenshot = false;
          } finally {
            this.pendingFrames--;
            this.checkIfStopped();
          }
        },
      );
    } catch (error) {
      console.error('Screenshooter initialization error:', error);
    }
  }

  private async writeImageFilename(
    data: string,
    testSuiteId: string,
  ): Promise<string> {
    try {
      const fullHeight = await this.page!.evaluate(() => {
        return Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight,
        );
      });

      this.socket!.emit(`image-${testSuiteId}`, { 
        img: data, 
        fullHeight,
        timestamp: Date.now()
      });

      return join(__dirname, `screenshot-${Date.now()}.jpeg`);
    } catch (error) {
      console.error('Error writing image filename:', error);
      return 'screenshot-error.jpeg';
    }
  }

  async start(options: StartOptions = {}): Promise<void> {
    const startOptions: StartOptions = {
      format: 'jpeg',
      quality: 10,
      everyNthFrame: 1,
      ...options,
    };
    
    try {
      await this.client?.send('Page.startScreencast', startOptions);
    } catch (err) {
      console.error('Error starting screencast:', err);
    }
  }

  async stop(): Promise<void> {
    if (this.stopScreencastPromise) {
      return this.stopScreencastPromise;
    }

    this.stopScreencastPromise = new Promise<void>((resolve) => {
      this.resolveStopScreencast = resolve;
    });

    try {
      await this.client?.send('Page.stopScreencast');
    } catch (err) {
      console.error('Error stopping screencast:', err);
      this.resolveStopScreencast();
    }

    if (this.pendingFrames === 0) {
      this.resolveStopScreencast();
    }

    return this.stopScreencastPromise;
  }

  private checkIfStopped() {
    if (this.stopScreencastPromise && this.pendingFrames === 0) {
      this.resolveStopScreencast();
    }
  }
}

export default PuppeteerMassScreenshots;