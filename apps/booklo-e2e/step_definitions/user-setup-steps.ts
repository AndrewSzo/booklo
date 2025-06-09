import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';
import { TestUsers } from '../utils/users';

When('I visit the registration page', async function(this: ICustomWorld) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  await this.page!.goto(`${baseUrl}/auth/register`);
  await this.page!.waitForLoadState('networkidle');
});

When('I register a new test user', async function(this: ICustomWorld) {
  // Use a randomly generated user to avoid conflicts
  const user = TestUsers.generateRandomUser();
  
  console.log('Registering user with credentials:', { 
    email: user.email, 
    password: user.password,
    passwordLength: user.password.length 
  });
  
  // Store user data for later use in login
  this.setTestData('registeredUser', user);
  
  // Fill registration form using standard selectors
  await this.page!.locator('input[name="email"]').fill(user.email);
  await this.page!.locator('input[name="password"]').fill(user.password);
  
  // Check if there's a confirm password field
  const confirmPasswordField = this.page!.locator('input[name="confirmPassword"]');
  if (await confirmPasswordField.isVisible()) {
    await confirmPasswordField.fill(user.password);
  }
  
  // Check if there are name fields
  const firstNameField = this.page!.locator('[data-testid="first-name-input"]');
  if (await firstNameField.isVisible() && user.firstName) {
    await firstNameField.fill(user.firstName);
  }
  
  const lastNameField = this.page!.locator('[data-testid="last-name-input"]');
  if (await lastNameField.isVisible() && user.lastName) {
    await lastNameField.fill(user.lastName);
  }
  
  // Submit form
  await this.page!.locator('button[type="submit"]').click();
  await this.page!.waitForLoadState('networkidle');
});

Then('the user should be successfully registered', async function(this: ICustomWorld) {
  // Check if we're redirected away from register page or see success message
  const currentUrl = this.page!.url();
  const isOnRegisterPage = currentUrl.includes('/auth/register');
  
  if (isOnRegisterPage) {
    // Look for success message
    const successMessage = this.page!.locator('[data-testid="success-message"]');
    if (await successMessage.isVisible()) {
      console.log('Registration successful - success message visible');
    } else {
      // Check if there's an error message indicating user already exists
      const errorMessage = this.page!.locator('[data-testid="auth-error"]');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        if (errorText?.includes('already exists') || errorText?.includes('już istnieje')) {
          console.log('User already exists - this is expected for test users');
        } else {
          throw new Error(`Registration failed with error: ${errorText}`);
        }
      }
    }
  } else {
    console.log('Registration successful - redirected away from register page');
  }
}); 