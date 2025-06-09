import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// Common Given steps
Given('the application is running', async function(this: ICustomWorld) {
  // This step is handled by the browser initialization in world.ts
  expect(this.page).toBeDefined();
  expect(this.pageFactory).toBeDefined();
});

Given('I am on the home page', async function(this: ICustomWorld) {
  await this.pageFactory!.homePage.goto();
  await this.pageFactory!.homePage.assertPageLoaded();
});

Given('I navigate to the login page', async function(this: ICustomWorld) {
  await this.pageFactory!.loginPage.goto();
  await this.pageFactory!.loginPage.assertPageLoaded();
});

// Common When steps
When('I wait for {int} seconds', async function(this: ICustomWorld, seconds: number) {
  await this.page!.waitForTimeout(seconds * 1000);
});

When('I take a screenshot named {string}', async function(this: ICustomWorld, screenshotName: string) {
  await this.takeScreenshot(screenshotName);
});

When('I reload the page', async function(this: ICustomWorld) {
  await this.page!.reload();
  await this.page!.waitForLoadState('networkidle');
});

When('I go back in browser history', async function(this: ICustomWorld) {
  await this.page!.goBack();
  await this.page!.waitForLoadState('networkidle');
});

// Common Then steps
Then('I should see the page title {string}', async function(this: ICustomWorld, expectedTitle: string) {
  await expect(this.page!).toHaveTitle(expectedTitle);
});

Then('the current URL should contain {string}', async function(this: ICustomWorld, urlPart: string) {
  const currentUrl = this.page!.url();
  expect(currentUrl).toContain(urlPart);
});

Then('the current URL should be {string}', async function(this: ICustomWorld, expectedUrl: string) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  const fullExpectedUrl = expectedUrl.startsWith('http') ? expectedUrl : `${baseUrl}${expectedUrl}`;
  await expect(this.page!).toHaveURL(fullExpectedUrl);
});

Then('the page should be fully loaded', async function(this: ICustomWorld) {
  await this.page!.waitForLoadState('networkidle');
  await this.page!.waitForLoadState('domcontentloaded');
});

// Data storage steps for test scenarios
Given('I store {string} as {string}', function(this: ICustomWorld, value: string, key: string) {
  this.setTestData(key, value);
});

Then('I should have stored {string} as {string}', function(this: ICustomWorld, expectedValue: string, key: string) {
  const storedValue = this.getTestData(key);
  expect(storedValue).toBe(expectedValue);
});

// Debug steps
When('I pause for debugging', async function(this: ICustomWorld) {
  if (process.env.DEBUG === 'true') {
    await this.page!.pause();
  }
});

When('I log the current URL', async function(this: ICustomWorld) {
  const currentUrl = this.page!.url();
  console.log(`Current URL: ${currentUrl}`);
});

When('I log the page title', async function(this: ICustomWorld) {
  const title = await this.page!.title();
  console.log(`Page title: ${title}`);
}); 

Given(
  'viewport is set to {string} resolution',
  async function(this: ICustomWorld, deviceType: 'desktop' | 'tablet' | 'mobile') {
    const viewports = {
      desktop: {width: 1920, height: 1080},
      tablet: {width: 768, height: 1024},
      mobile: {width: 375, height: 667},
    } as const;

    await this.page!.setViewportSize(viewports[deviceType]);
  }
);