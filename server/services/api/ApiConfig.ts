// Configuration for API clients
export interface ApiCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  appId?: string;
  username?: string;
  password?: string;
  baseUrl?: string;
}

export class ApiConfig {
  // Store API configurations
  private static config: Record<string, ApiCredentials> = {
    ebay: {
      apiKey: process.env.EBAY_API_KEY,
      appId: process.env.EBAY_APP_ID,
      baseUrl: 'https://api.ebay.com/buy/browse/v1'
    },
    amazon: {
      apiKey: process.env.AMAZON_API_KEY,
      apiSecret: process.env.AMAZON_API_SECRET,
      baseUrl: 'https://api.amazon.com'
    },
    facebook: {
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
      baseUrl: 'https://graph.facebook.com'
    },
    etsy: {
      apiKey: process.env.ETSY_API_KEY,
      apiSecret: process.env.ETSY_API_SECRET,
      baseUrl: 'https://openapi.etsy.com/v3'
    },
    subito: {
      baseUrl: 'https://api.subito.it/v1'
    },
    kijiji: {
      baseUrl: 'https://api.kijiji.it'
    }
    // Add other marketplaces as needed
  };
  
  /**
   * Get credentials for the specified marketplace
   * @param marketplace Marketplace identifier
   * @returns ApiCredentials for the marketplace
   */
  static getCredentials(marketplace: string): ApiCredentials {
    return this.config[marketplace] || {};
  }
  
  /**
   * Check if required credentials are available for a marketplace
   * @param marketplace Marketplace identifier
   * @param requiredKeys Array of required credential keys
   * @returns Boolean indicating if all required credentials are available
   */
  static hasRequiredCredentials(marketplace: string, requiredKeys: string[]): boolean {
    const credentials = this.getCredentials(marketplace);
    return requiredKeys.every(key => 
      credentials[key as keyof ApiCredentials] !== undefined && 
      credentials[key as keyof ApiCredentials] !== ''
    );
  }
}