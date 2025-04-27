
import { Filter, InsertResult } from "@shared/schema";
import { Page } from 'playwright';
import { BasePlaywrightScrapingClient } from './BasePlaywrightScrapingClient';

/**
 * Subito.it scraping client (Playwright)
 */
export class SubitoScrapingClient extends BasePlaywrightScrapingClient {
  constructor() {
    super('subito');
  }

  protected buildSearchUrl(query: string, filters?: Filter): string {
    let url = `https://www.subito.it/annunci-italia/vendita/usato/?q=${encodeURIComponent(query)}`;
    if (filters?.price) {
      if (filters.price.min !== undefined) url += `&priceMin=${filters.price.min}`;
      if (filters.price.max !== undefined) url += `&priceMax=${filters.price.max}`;
    }
    return url;
  }

  protected async parseListings(page: Page): Promise<Omit<InsertResult, 'searchId' | 'seen'>[]> {
    await page.waitForSelector('div.items__item', { timeout: 15000 });
    const items = await page.$$eval('div.items__item', nodes =>
      nodes.slice(0, 20).map(div => {
        const title = (div.querySelector('h2') as HTMLElement)?.innerText || '';
        const price = (div.querySelector('.price') as HTMLElement)?.innerText || '';
        const location = (div.querySelector('.location') as HTMLElement)?.innerText || '';
        const img = (div.querySelector('img') as HTMLImageElement)?.src || '';
        const link = (div.querySelector('a') as HTMLAnchorElement)?.href || '';
        return { title, price, condition: undefined, location, imageUrl: img, listingUrl: link, marketplace: 'subito', postedAt: new Date() };
      })
    );
    return items;
  }
}
