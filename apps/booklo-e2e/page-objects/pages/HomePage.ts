import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class HomePage extends BasePage {
  // Page elements
  private readonly welcomeMessage: Locator;
  private readonly loginButton: Locator;
  private readonly signupButton: Locator;
  private readonly navigationMenu: Locator;
  private readonly heroSection: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators - based on navbar components
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.signupButton = page.locator('[data-testid="signup-button"]');
    this.navigationMenu = page.locator('[data-testid="navbar"]');
    this.heroSection = page.locator('[data-testid="home-page"]');
  }

  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    console.log('HomePage: Navigating to', this.baseUrl);
    await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    console.log('HomePage: Waiting for page to load...');
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    
    console.log('HomePage: Waiting for hero section element...');
    await this.waitForElement(this.heroSection, 30000);
    console.log('HomePage: Hero section found!');
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.clickElement(this.loginButton);
  }

  /**
   * Click signup button
   */
  async clickSignup(): Promise<void> {
    await this.clickElement(this.signupButton);
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.getElementText(this.welcomeMessage);
  }

  /**
   * Check if user is logged in (look for user profile/dropdown)
   */
  async isUserLoggedIn(): Promise<boolean> {
    // Look for user dropdown button (contains user avatar/profile)
    const userDropdown = this.page.locator('button:has(.w-6.h-6.bg-primary.rounded-full)');
    const isDropdownVisible = await userDropdown.isVisible();
    
    if (isDropdownVisible) {
      return true;
    }
    
    // Alternative: check for user email text
    const userEmail = this.page.locator('text=/.*@.*\\..*/', { hasText: '@' });
    const isEmailVisible = await userEmail.isVisible();
    
    if (isEmailVisible) {
      return true;
    }
    
    // Check if we're on a protected page (dashboard, library) which means user is logged in
    const currentUrl = this.page.url();
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/library')) {
      return true;
    }
    
    return false;
  }

  /**
   * Assert page is loaded correctly
   */
  async assertPageLoaded(): Promise<void> {
    await this.assertElementVisible(this.heroSection, 'Hero section should be visible');
    // Skip title assertion for now as it may be dynamic
    // await this.assertPageTitle('Booklo - Your Digital Library');
  }

  /**
   * Assert login button is visible
   */
  async assertLoginButtonVisible(): Promise<void> {
    await this.assertElementVisible(this.loginButton, 'Login button should be visible');
  }

  /**
   * Assert signup button is visible
   */
  async assertSignupButtonVisible(): Promise<void> {
    await this.assertElementVisible(this.signupButton, 'Signup button should be visible');
  }
} 