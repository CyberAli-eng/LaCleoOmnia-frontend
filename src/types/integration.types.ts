export interface Integration {
  id: string;
  name: string;
  type: string;
  provider: string;
  enabled: boolean;
  connectedAt?: string;
  credentials?: Record<string, any>;
  [key: string]: any;
}

export interface ShopifyCredentials {
  shopUrl: string;
  accessToken: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface IntegrationCatalog {
  id: string;
  name: string;
  provider: string;
  description?: string;
  logoUrl?: string;
  supported: boolean;
  [key: string]: any;
}

export interface ConnectedSummary {
  total: number;
  active: number;
  inactive: number;
  integrations: Integration[];
}
