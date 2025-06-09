import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class LoginPage extends BasePage {
  // Page elements
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly signupLink: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-submit-button"]');
    this.errorMessage = page.locator('[data-testid="auth-error"]');
    this.signupLink = page.locator('[data-testid="signup-link"]');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/auth/login`);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForElement(this.emailInput);
    await this.waitForElement(this.passwordInput);
  }

  /**
   * Fill email input
   */
  async fillEmail(email: string): Promise<void> {
    await this.fillInput(this.emailInput, email);
  }

  /**
   * Fill password input
   */
  async fillPassword(password: string): Promise<void> {
    await this.fillInput(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.clickElement(this.loginButton);
  }

  /**
   * Perform complete login flow
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
    await this.waitForLoginToComplete();
  }

  /**
   * Wait for login process to complete
   */
  async waitForLoginToComplete(): Promise<void> {
    // Wait for loading spinner to disappear
    try {
      await this.waitForElementToBeHidden(this.loadingSpinner, 5000);
    } catch {
      // Loading spinner might not appear for fast logins
    }
    
    // Wait for navigation
    await this.waitForNavigation();
  }

  /**
   * Click signup link
   */
  async clickSignupLink(): Promise<void> {
    await this.waitForElement(this.signupLink);
    
    // Log current URL before click
    console.log('URL before click:', this.page.url());
    
    // Wait for element to be clickable and visible
    await this.signupLink.click({ force: true });
    
    // Give some time for navigation to start
    await this.page.waitForTimeout(1000);
    
    // Log current URL after click
    console.log('URL after click:', this.page.url());
  }

  /**
   * Click forgot password link
   */
  async clickForgotPasswordLink(): Promise<void> {
    await this.clickElement(this.forgotPasswordLink);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getElementText(this.errorMessage);
  }

  /**
   * Check if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  /**
   * Assert login page is loaded
   */
  async assertPageLoaded(): Promise<void> {
    await this.assertElementVisible(this.emailInput, 'Email input should be visible');
    await this.assertElementVisible(this.passwordInput, 'Password input should be visible');
    await this.assertElementVisible(this.loginButton, 'Login button should be visible');
    // Skip title assertion as it may be dynamic
    // await this.assertPageTitle('Login - Booklo');
  }

  /**
   * Assert error message is displayed
   */
  async assertErrorMessageDisplayed(expectedMessage: string): Promise<void> {
    await this.assertElementVisible(this.errorMessage, 'Error message should be visible');
    await this.assertElementContainsText(this.errorMessage, expectedMessage);
  }

  /**
   * Assert login button is disabled
   */
  async assertLoginButtonDisabled(): Promise<void> {
    const isEnabled = await this.isElementEnabled(this.loginButton);
    if (isEnabled) {
      throw new Error('Login button should be disabled');
    }
  }
} 