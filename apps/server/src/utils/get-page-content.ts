import { Page } from 'puppeteer';
import { sanitizeHTML } from './sanitize-html';

export const getSnapshot = async (page: Page) => {
  return {
    dom: sanitizeHTML(await page.content()),
  };
};
