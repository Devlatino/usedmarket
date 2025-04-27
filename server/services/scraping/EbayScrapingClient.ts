
import { Filter, InsertResult } from "@shared/schema";
import { Page } from 'playwright';
import { BasePlaywrightScrapingClient } from './BasePlaywrightScrapingClient';

/**
 * eBay scraping client powered by Playwright
 */
export class EbayScrapingClient extends BasePlaywrightScrapingClient {
  constructor() {
    super('ebay');
  }

  protected buildSearchUrl(query: string, filters?: Filter): string {
    let url = `https://www.ebay.it/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0`;
    if (filters?.price) {
      if (filters.price.min !== undefined) url += `&_udlo=${filters.price.min}`;
      if (filters.price.max !== undefined) url += `&_udhi=${filters.price.max}`;
    }
    return url;
  }

  protected async parseListings(page: Page): Promise<Omit<InsertResult, 'searchId' | 'seen'>[]> {
    const items = await page.$$eval('li.s-item', nodes =>
      nodes.slice(0, 20).map(li => {
        const title = (li.querySelector('.s-item__title') as HTMLElement)?.innerText || '';
        const price = (li.querySelector('.s-item__price') as HTMLElement)?.innerText || '';
        const location = (li.querySelector('.s-item__location') as HTMLElement)?.innerText || '';
        const img = (li.querySelector('img.s-item__image-img') as HTMLImageElement)?.src || '';
        const link = (li.querySelector('a.s-item__link') as HTMLAnchorElement)?.href || '';
        return { title, price, condition: undefined, location, imageUrl: img, listingUrl: link, marketplace: 'ebay', postedAt: new Date() };
      })
    );
    return items;
  }
}
