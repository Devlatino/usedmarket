
import { chromium, Browser, Page } from 'playwright';
import { Filter, Marketplace, InsertResult } from "@shared/schema";
import { BaseScrapingClient } from './BaseScrapingClient';

/**
 * Base class for Playwright‑driven scraping clients.
 * Opens a headless Chromium instance, navigates to a search URL
 * (constructed by subclasses) and delega per‑page parsing to subclass.
 */
export abstract class BasePlaywrightScrapingClient extends BaseScrapingClient {
  private static browser: Browser | null = null;

  protected async getBrowser(): Promise<Browser> {
    if (!BasePlaywrightScrapingClient.browser) {
      BasePlaywrightScrapingClient.browser = await chromium.launch({ headless: true });
    }
    return BasePlaywrightScrapingClient.browser;
  }

  /** Construct full search URL specific to the marketplace */
  protected abstract buildSearchUrl(query: string, filters?: Filter): string;

  /** Extract listing blocks from the page and convert them to results */
  protected abstract parseListings(page: Page, filters?: Filter): Promise<Omit<InsertResult, 'searchId' | 'seen'>[]>;

  async search(query: string, filters?: Filter): Promise<Omit<InsertResult, 'searchId' | 'seen'>[]> {
    const browser = await this.getBrowser();
    const context = await browser.newContext({ userAgent: this.randomUserAgent() });
    const page = await context.newPage();

    const url = this.buildSearchUrl(query, filters);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    const results = await this.parseListings(page, filters);
    await context.close();
    return results;
  }

  protected randomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }
}
