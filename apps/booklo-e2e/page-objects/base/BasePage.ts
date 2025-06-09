import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  }

  /**
   * Navigate to the page
   */
  abstract goto(): Promise<void>;

  /**
   * Wait for the page to be loaded
   */
  abstract waitForPageLoad(): Promise<void>;

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementToBeHidden(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click element with retry logic
   */
  async clickElement(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click();
  }

  /**
   * Fill input field
   */
  async fillInput(locator: Locator, text: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Get element text
   */
  async getElementText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return await locator.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isElementEnabled(locator: Locator): Promise<boolean> {
    try {
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(timeout: number = 10000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    const screenshotPath = process.env.SCREENSHOT_PATH || './screenshots';
    await this.page.screenshot({ 
      path: `${screenshotPath}/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for text to be present
   */
  async waitForText(text: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      (searchText) => document.body.textContent?.includes(searchText),
      text,
      { timeout }
    );
  }

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Assert element is visible
   */
  async assertElementVisible(locator: Locator, errorMessage?: string): Promise<void> {
    await expect(locator, errorMessage).toBeVisible();
  }

  /**
   * Assert element contains text
   */
  async assertElementContainsText(locator: Locator, text: string, errorMessage?: string): Promise<void> {
    await expect(locator, errorMessage).toContainText(text);
  }

  /**
   * Assert page title
   */
  async assertPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Assert current URL
   */
  async assertCurrentUrl(expectedUrl: string): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }
} 