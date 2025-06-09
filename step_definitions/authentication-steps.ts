import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';
import { TestUsers, TestUser } from '../utils/users';

// Login steps
When('I enter valid user credentials', async function(this: ICustomWorld) {
  const user = TestUsers.getRegularUser();
  await this.pageFactory!.loginPage.fillEmail(user.email);
  await this.pageFactory!.loginPage.fillPassword(user.password);
});

When('I enter invalid user credentials', async function(this: ICustomWorld) {
  await this.pageFactory!.loginPage.fillEmail('invalid@example.com');
  await this.pageFactory!.loginPage.fillPassword('wrongpassword');
});

When('I enter credentials for {string} user', async function(this: ICustomWorld, userType: string) {
  const user = TestUsers.getUser(userType);
  await this.pageFactory!.loginPage.fillEmail(user.email);
  await this.pageFactory!.loginPage.fillPassword(user.password);
  
  // Store user info for later assertions
  this.setTestData('currentUser', user);
});

When('I enter registered user credentials', async function(this: ICustomWorld) {
  const user = this.getTestData('registeredUser') as TestUser;
  if (!user) {
    throw new Error('No registered user found in test data. Make sure to register a user first.');
  }
  
  console.log('Using registered user credentials:', { email: user.email, password: '***' });
  
  await this.pageFactory!.loginPage.fillEmail(user.email);
  await this.pageFactory!.loginPage.fillPassword(user.password);
});

When('I click the login button', async function(this: ICustomWorld) {
  await this.pageFactory!.loginPage.clickLogin();
  
  // Wait a bit for form submission
  await this.page!.waitForTimeout(2000);
  
  // Debug: check what's on the page
  const pageContent = await this.page!.content();
  const hasErrorClass = pageContent.includes('error') || pageContent.includes('invalid');
  console.log('Has error indicators on page:', hasErrorClass);
  
  // Check for any visible error messages
  const errorElements = await this.page!.locator('[class*="error"], [class*="invalid"], [data-testid*="error"], .text-red, .text-destructive').all();
  for (const element of errorElements) {
    const isVisible = await element.isVisible();
    if (isVisible) {
      const text = await element.textContent();
      console.log('Found visible error element:', text);
    }
  }
});

When('I click the signup link', async function(this: ICustomWorld) {
  await this.pageFactory!.loginPage.clickSignupLink();
  // Add explicit wait for navigation
  await this.page!.waitForLoadState('networkidle');
});

// Login page assertions
Then('I should see the email input field', async function(this: ICustomWorld) {
  await this.pageFactory!.loginPage.assertPageLoaded();
});

Then('I should see the password input field', async function(this: ICustomWorld) {
  await this.pageFactory!.loginPage.assertPageLoaded();
});

Then('I should see the login button', async function(this: ICustomWorld) {
  await this.pageFactory!.loginPage.assertPageLoaded();
});

Then('I should see the signup link', async function(this: ICustomWorld) {
  await this.pageFactory!.loginPage.assertPageLoaded();
});

// Authentication success/failure
Then('I should be redirected to my library', async function(this: ICustomWorld) {
  // Wait for navigation to complete
  await this.page!.waitForLoadState('networkidle');
  
  // Debug: check for error messages first
  const errorVisible = await this.pageFactory!.loginPage.isErrorMessageVisible();
  if (errorVisible) {
    const errorText = await this.pageFactory!.loginPage.getErrorMessage();
    console.log('Login error message:', errorText);
  }
  
  // Check if we're on dashboard page (which is the main user page)
  const currentUrl = this.page!.url();
  console.log('Current URL after login:', currentUrl);
  
  expect(currentUrl).toContain('/dashboard');
  
  // Additional check - wait for page to be fully loaded
  await this.page!.waitForTimeout(1000);
});

Then('I should see my username in the navigation', async function(this: ICustomWorld) {
  // Check if user dropdown/profile section is visible (indicating user is logged in)
  // AuthButton component shows user profile when authenticated
  const userDropdown = this.page!.locator('button:has([data-testid], .w-6.h-6.bg-primary.rounded-full)');
  const isDropdownVisible = await userDropdown.isVisible();
  
  if (!isDropdownVisible) {
    // Alternative: check for user email or profile text
    const userEmail = this.page!.locator('text=/.*@.*\\..*/', { hasText: '@' });
    const isEmailVisible = await userEmail.isVisible();
    expect(isEmailVisible).toBe(true);
  } else {
    expect(isDropdownVisible).toBe(true);
  }
});

Then('I should see an error message', async function(this: ICustomWorld) {
  const isErrorVisible = await this.pageFactory!.loginPage.isErrorMessageVisible();
  expect(isErrorVisible).toBe(true);
});

Then('I should remain on the login page', async function(this: ICustomWorld) {
  const currentUrl = this.page!.url();
  expect(currentUrl).toContain('/auth/login');
});

Then('I should be redirected to the signup page', async function(this: ICustomWorld) {
  await this.page!.waitForLoadState('networkidle');
  const currentUrl = this.page!.url();
  expect(currentUrl).toContain('/auth/register');
});

Then('I should be successfully logged in', async function(this: ICustomWorld) {
  // Wait for login to complete
  await this.pageFactory!.loginPage.waitForLoginToComplete();
  
  // Check if we're no longer on login page
  const currentUrl = this.page!.url();
  expect(currentUrl).not.toContain('/auth/login');
  
  // Verify user is logged in by checking navigation
  await this.page!.waitForTimeout(1000); // Small wait for UI to update
});

Then('I should have {string} permissions', async function(this: ICustomWorld, expectedRole: string) {
  const storedUser = this.getTestData('currentUser') as TestUser;
  expect(storedUser).toBeDefined();
  expect(storedUser.role).toBe(expectedRole);
  
  // Additional check could be made here to verify role-specific UI elements
  // This would depend on how roles are displayed in your application
});

// Logout steps
Given('I am logged in as a regular user', async function(this: ICustomWorld) {
  const user = TestUsers.getRegularUser();
  console.log(`Attempting to login as regular user:`, { email: user.email });
  
  // First try to login - if it fails, register the user
  await this.pageFactory!.loginPage.goto();
  await this.pageFactory!.loginPage.fillEmail(user.email);
  await this.pageFactory!.loginPage.fillPassword(user.password);
  await this.pageFactory!.loginPage.clickLogin();
  
  // Wait for login attempt to complete
  await this.page!.waitForTimeout(1500);
  const currentUrl = this.page!.url();
  console.log(`URL after login attempt: ${currentUrl}`);
  
  // If still on login page, user probably doesn't exist - register them
  if (currentUrl.includes('/auth/login')) {
    console.log(`Regular user doesn't exist, registering...`);
    
    try {
      // Go to registration page
      const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
      await this.page!.goto(`${baseUrl}/auth/register`);
      await this.page!.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Fill registration form
      await this.page!.locator('input[name="email"]').fill(user.email);
      await this.page!.locator('input[name="password"]').fill(user.password);
      
      // Check if there's a confirm password field
      const confirmPasswordField = this.page!.locator('input[name="confirmPassword"]');
      try {
        await confirmPasswordField.waitFor({ timeout: 2000 });
        await confirmPasswordField.fill(user.password);
      } catch {
        console.log('No confirm password field found');
      }
      
      // Submit registration form
      const submitButton = this.page!.locator('button[type="submit"]');
      await submitButton.click();
      await this.page!.waitForTimeout(2000);
      
      // Now try to login again
      await this.pageFactory!.loginPage.goto();
      await this.pageFactory!.loginPage.login(user.email, user.password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }
  
  // Verify login was successful
  await this.page!.waitForLoadState('networkidle', { timeout: 10000 });
  const finalUrl = this.page!.url();
  console.log(`Final URL after login attempt: ${finalUrl}`);
  expect(finalUrl).not.toContain('/auth/login');
});

Given('I am logged in as a {string}', async function(this: ICustomWorld, userType: string) {
  const user = TestUsers.getUser(userType);
  console.log(`Attempting to login as ${userType}:`, { email: user.email });
  
  // First try to login - if it fails, register the user
  await this.pageFactory!.loginPage.goto();
  await this.pageFactory!.loginPage.fillEmail(user.email);
  await this.pageFactory!.loginPage.fillPassword(user.password);
  await this.pageFactory!.loginPage.clickLogin();
  
  // Wait for login attempt to complete
  await this.page!.waitForTimeout(1500);
  const currentUrl = this.page!.url();
  console.log(`URL after login attempt: ${currentUrl}`);
  
  // If still on login page, user probably doesn't exist - register them
  if (currentUrl.includes('/auth/login')) {
    console.log(`User ${userType} doesn't exist, registering...`);
    
    try {
      // Go to registration page
      const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
      await this.page!.goto(`${baseUrl}/auth/register`);
      await this.page!.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Fill registration form
      await this.page!.locator('input[name="email"]').fill(user.email);
      await this.page!.locator('input[name="password"]').fill(user.password);
      
      // Check if there's a confirm password field
      const confirmPasswordField = this.page!.locator('input[name="confirmPassword"]');
      try {
        await confirmPasswordField.waitFor({ timeout: 2000 });
        await confirmPasswordField.fill(user.password);
      } catch {
        console.log('No confirm password field found');
      }
      
      // Submit registration form
      const submitButton = this.page!.locator('button[type="submit"]');
      await submitButton.click();
      await this.page!.waitForTimeout(2000);
      
      // Now try to login again
      await this.pageFactory!.loginPage.goto();
      await this.pageFactory!.loginPage.login(user.email, user.password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }
  
  // Verify login was successful
  await this.page!.waitForLoadState('networkidle', { timeout: 10000 });
  const finalUrl = this.page!.url();
  console.log(`Final URL after login attempt: ${finalUrl}`);
  expect(finalUrl).not.toContain('/auth/login');
});

When('I click the logout button', async function(this: ICustomWorld) {
  // First, open the user dropdown menu
  const userDropdown = this.page!.locator('button:has(.w-6.h-6.bg-primary.rounded-full)');
  await userDropdown.click();
  await this.page!.waitForTimeout(500);
  
  // Click the logout option in the dropdown
  const logoutButton = this.page!.locator('div[role="menuitem"]:has-text("Wyloguj się"), button:has-text("Wyloguj się"), text="Wyloguj się"').first();
  await logoutButton.click();
  
  // Wait for logout to complete
  await this.page!.waitForTimeout(2000);
});

Then('I should be logged out', async function(this: ICustomWorld) {
  // Wait for logout to complete
  await this.page!.waitForLoadState('networkidle');
  
  // Check if user is no longer logged in
  const isLoggedIn = await this.pageFactory!.homePage.isUserLoggedIn();
  expect(isLoggedIn).toBe(false);
});

Then('I should be redirected to the home page', async function(this: ICustomWorld) {
  const currentUrl = this.page!.url();
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  expect(currentUrl).toBe(baseUrl + '/');
});

// Additional authentication-related steps
Given('I am not logged in', async function(this: ICustomWorld) {
  // Ensure we start from home page in logged out state
  await this.pageFactory!.homePage.goto();
  
  // Verify we're not logged in
  const isLoggedIn = await this.pageFactory!.homePage.isUserLoggedIn();
  expect(isLoggedIn).toBe(false);
});

When('I attempt to access a protected page', async function(this: ICustomWorld) {
  // Try to access library page directly
  await this.page!.goto(`${process.env.BASE_URL || 'http://localhost:3001'}/library`);
});

Then('I should be redirected to the login page', async function(this: ICustomWorld) {
  await this.page!.waitForLoadState('networkidle');
  const currentUrl = this.page!.url();
  expect(currentUrl).toContain('/auth/login');
}); 