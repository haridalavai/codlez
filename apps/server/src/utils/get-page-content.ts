import { Page } from 'puppeteer';
import { sanitizeHtml } from './sanitize-html';

export const getSnapshot = async (page: Page) => {
  return {
    dom: sanitizeHtml(await page.content()),
  };
};
