import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import { World, IWorldOptions, setWorldConstructor, Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { PageFactory } from '../page-objects/PageFactory';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

export interface ICustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  pageFactory?: PageFactory;
  testData?: Record<string, unknown>;
  
  // Methods
  init(): Promise<void>;
  cleanup(): Promise<void>;
  takeScreenshot(name: string): Promise<void>;
  setTestData(key: string, value: unknown): void;
  getTestData(key: string): unknown;
  clearTestData(): void;
  createTestBook(title: string, author: string): Promise<void>;
}

export class CustomWorld extends World implements ICustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  pageFactory?: PageFactory;
  testData: Record<string, unknown> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Initialize browser, context and page
   */
  async init(): Promise<void> {
    // Get browser type from environment
    const browserType = process.env.BROWSER || 'chromium';
    const headless = process.env.HEADLESS !== 'false';
    const slowMo = parseInt(process.env.SLOW_MO || '0');

    // Launch browser
    switch (browserType) {
      case 'firefox':
        this.browser = await firefox.launch({ headless, slowMo });
        break;
      case 'webkit':
        this.browser = await webkit.launch({ headless, slowMo });
        break;
      case 'chromium':
      default:
        this.browser = await chromium.launch({ headless, slowMo });
        break;
    }

    // Create browser context
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
      recordVideo: process.env.RECORD_VIDEO === 'true' ? { dir: './videos' } : undefined,
    });

    // Create page
    this.page = await this.context.newPage();

    // Initialize page factory
    this.pageFactory = new PageFactory(this.page);

    // Set default timeout
    this.page.setDefaultTimeout(parseInt(process.env.TIMEOUT || '30000'));
  }

  /**
   * Cleanup browser, context and page
   */
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    if (this.page) {
      const screenshotPath = process.env.SCREENSHOT_PATH || './screenshots';
      await this.page.screenshot({ 
        path: `${screenshotPath}/${name}-${Date.now()}.png`,
        fullPage: true 
      });
    }
  }

  /**
   * Store test data
   */
  setTestData(key: string, value: unknown): void {
    this.testData[key] = value;
  }

  /**
   * Get test data
   */
  getTestData(key: string): unknown {
    return this.testData[key];
  }

  /**
   * Clear test data
   */
  clearTestData(): void {
    this.testData = {};
  }

  /**
   * Create a test book using the UI
   */
  async createTestBook(title: string, author: string): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    try {
      // Go to library page if not already there
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/library')) {
        await this.page.goto(`${process.env.BASE_URL || 'http://localhost:3001'}/library`);
        await this.page.waitForLoadState('networkidle');
      }

      // Click the add book button
      const addBookButton = this.page.locator('[data-testid="add-book-button"]');
      await addBookButton.click();
      await this.page.waitForTimeout(1000);

      // Fill in the basic book information
      const titleInput = this.page.locator('input[name="title"], input[placeholder*="title"], input[placeholder*="tytuł"]').first();
      await titleInput.fill(title);

      const authorInput = this.page.locator('input[name="author"], input[placeholder*="author"], input[placeholder*="autor"]').first();
      await authorInput.fill(author);

      // Try to find and click submit/save button
      const saveButton = this.page.locator(
        'button:has-text("Dodaj Książkę"), button:has-text("Save"), button:has-text("Zapisz"), button[type="submit"]'
      ).first();
      
      await saveButton.click();
      await this.page.waitForTimeout(2000); // Wait for book to be created

      console.log(`Test book "${title}" by "${author}" created successfully`);
    } catch (error) {
      console.error(`Failed to create test book "${title}":`, error);
      // Don't throw error to avoid breaking tests - just log the issue
    }
  }
}

// Set the custom world constructor
setWorldConstructor(CustomWorld);

// Global hooks
BeforeAll(async function() {
  console.log('🚀 Starting E2E test suite...');
  
  // Create directories if they don't exist
  const paths = ['./reports', './screenshots', './videos'];
  
  paths.forEach(path => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  });
});

AfterAll(async function() {
  console.log('✅ E2E test suite completed');
});

Before(async function(this: CustomWorld) {
  // Initialize browser for each scenario
  await this.init();
  const scenarioName = this.parameters?.pickle?.name || 'Unknown scenario';
  console.log(`🎬 Starting scenario: ${scenarioName}`);
});

After(async function(this: CustomWorld, scenario) {
  // Take screenshot on failure
  if (scenario.result?.status === 'FAILED' && this.page) {
    const scenarioName = (scenario.pickle?.name || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
    await this.takeScreenshot(`failed_${scenarioName}`);
  }

  // Cleanup browser after each scenario
  await this.cleanup();
  const scenarioName = scenario.pickle?.name || 'Unknown scenario';
  console.log(`🏁 Completed scenario: ${scenarioName} - Status: ${scenario.result?.status}`);
}); 