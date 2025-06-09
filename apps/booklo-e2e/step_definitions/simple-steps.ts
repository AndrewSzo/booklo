import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

When('I visit the home page', async function(this: ICustomWorld) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  await this.page!.goto(baseUrl);
  await this.page!.waitForLoadState('networkidle');
});

Then('I should see the home page content', async function(this: ICustomWorld) {
  const homePageElement = this.page!.locator('[data-testid="home-page"]');
  await expect(homePageElement).toBeVisible({ timeout: 10000 });
}); 