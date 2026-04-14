/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppData, GitHubConfig } from '../types';

const API_BASE = 'https://api.github.com';

export class GitHubService {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${API_BASE}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `token ${this.config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 404 && options.method !== 'PUT') {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'GitHub API error');
    }

    return response.json();
  }

  async getFile(path: string) {
    const data = await this.request(path);
    if (!data) return null;

    // GitHub returns content as base64
    const content = atob(data.content);
    // Handle UTF-8 correctly
    const decoded = decodeURIComponent(escape(content));
    return {
      content: JSON.parse(decoded),
      sha: data.sha,
    };
  }

  async updateFile(path: string, content: any, sha?: string) {
    const jsonString = JSON.stringify(content, null, 2);
    // Handle UTF-8 correctly for base64
    const encoded = btoa(unescape(encodeURIComponent(jsonString)));
    
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify({
        message: `StockFlow: update ${path}`,
        content: encoded,
        sha,
      }),
    });
  }

  async loadAllData(): Promise<AppData> {
    const defaultData: AppData = {
      supplies: [],
      products: [],
      purchases: [],
      sales: [],
      meta: {
        storeName: 'Minha Loja',
        lastSync: null,
      },
    };

    try {
      const [supplies, products, purchases, sales, meta] = await Promise.all([
        this.getFile('data/supplies.json'),
        this.getFile('data/products.json'),
        this.getFile('data/purchases.json'),
        this.getFile('data/sales.json'),
        this.getFile('data/meta.json'),
      ]);

      return {
        supplies: supplies?.content || [],
        products: products?.content || [],
        purchases: purchases?.content || [],
        sales: sales?.content || [],
        meta: meta?.content || defaultData.meta,
      };
    } catch (error) {
      console.error('Error loading data from GitHub:', error);
      throw error;
    }
  }

  async saveAllData(data: AppData) {
    const timestamp = new Date().toISOString();
    const dataWithSync = {
      ...data,
      meta: {
        ...data.meta,
        lastSync: timestamp,
      },
    };

    try {
      // We need SHAs to update existing files
      const [suppliesFile, productsFile, purchasesFile, salesFile, metaFile] = await Promise.all([
        this.getFile('data/supplies.json'),
        this.getFile('data/products.json'),
        this.getFile('data/purchases.json'),
        this.getFile('data/sales.json'),
        this.getFile('data/meta.json'),
      ]);

      await Promise.all([
        this.updateFile('data/supplies.json', dataWithSync.supplies, suppliesFile?.sha),
        this.updateFile('data/products.json', dataWithSync.products, productsFile?.sha),
        this.updateFile('data/purchases.json', dataWithSync.purchases, purchasesFile?.sha),
        this.updateFile('data/sales.json', dataWithSync.sales, salesFile?.sha),
        this.updateFile('data/meta.json', dataWithSync.meta, metaFile?.sha),
      ]);

      return dataWithSync;
    } catch (error) {
      console.error('Error saving data to GitHub:', error);
      throw error;
    }
  }
}
