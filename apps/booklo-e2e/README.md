# Booklo Web E2E Tests

End-to-end tests for the Booklo web application using Playwright and Cucumber with Page Object Model pattern.

## 🏗️ Architecture

This project follows a structured approach to E2E testing:

- **Playwright**: Browser automation framework
- **Cucumber**: BDD framework with Gherkin syntax
- **Page Object Model**: Organized page interactions
- **TypeScript**: Type-safe test implementation

## 📁 Project Structure

```
apps/booklo-e2e/
├── features/                     # Gherkin feature files
│   ├── authentication.feature   # User authentication scenarios
│   └── library-management.feature # Library management scenarios
├── step_definitions/            # Step implementations
│   ├── common-steps.ts          # Shared step definitions
│   └── authentication-steps.ts # Authentication-specific steps
├── page-objects/               # Page Object Model
│   ├── base/
│   │   └── BasePage.ts         # Base page class
│   ├── pages/                  # Page implementations
│   │   ├── HomePage.ts
│   │   ├── LoginPage.ts
│   │   └── LibraryPage.ts
│   └── PageFactory.ts          # Page factory pattern
├── support/                    # Test configuration
│   └── world.ts               # Cucumber World + Playwright setup
├── utils/                     # Utilities
│   └── users.ts              # Test user management
├── reports/                  # Test reports
├── screenshots/              # Test screenshots
└── videos/                   # Test recordings
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running Booklo application (localhost:3001)

### Installation

1. Navigate to the e2e directory:
```bash
cd apps/booklo-e2e
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run install-browsers
```

4. Set up environment variables:
```bash
cp env.local.sample .env.local
# Edit .env.local with your configuration
```

## 🧪 Running Tests

### From root directory:
```bash
# Run all tests
npm run test:e2e

# Run tests in headless mode
npm run test:e2e:headless

# Run tests with browser visible
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in watch mode (re-runs on file changes)
npm run test:e2e:watch

# Run tests in watch mode with browser visible
npm run test:e2e:watch:headed

# Setup e2e environment
npm run test:e2e:setup
```

### From e2e directory (cd apps/booklo-e2e):

```bash
# Run all tests
npm test

# Run tests in headless mode
npm run test:headless

# Run tests with browser visible
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests in watch mode with browser visible
npm run test:watch:headed
```

### Browser-Specific Tests

```bash
# Run tests in Chrome
npm run test:chrome

# Run tests in Firefox
npm run test:firefox

# Run tests in Safari (WebKit)
npm run test:webkit
```

### Advanced Options

```bash
# Run tests in parallel
npm run test:parallel

# Run specific scenarios by tags
npm run test:tag "@authentication"

# Dry run (validate scenarios without execution)
npm run test:dry-run
```

### Watch Mode

The watch mode automatically re-runs tests when files change. It monitors:
- `features/` - Feature files (.feature)
- `step_definitions/` - Step definition files (.ts)
- `page-objects/` - Page object files (.ts)
- `support/` - Support files (.ts)
- `utils/` - Utility files (.ts)

```bash
# Watch mode in headless browser (default)
npm run test:watch

# Watch mode with visible browser
npm run test:watch:headed
```

Watch mode configuration can be customized in `nodemon.json`.

## 🏷️ Test Tags

Use tags to organize and run specific test scenarios:

```gherkin
@authentication @smoke
Scenario: Successful login
  # Test steps...

@library @regression
Scenario: Add book to library
  # Test steps...
```

Run tagged tests:
```bash
npm run test:tag "@smoke"
npm run test:tag "@authentication and @smoke"
npm run test:tag "not @slow"
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` file with:

```env
# Application URLs
BASE_URL=http://localhost:3001
API_URL=http://localhost:3001/api

# Browser Configuration
HEADLESS=true
SLOW_MO=0
TIMEOUT=30000
BROWSER=chromium

# Test Data
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
ADMIN_USER_EMAIL=admin@example.com
ADMIN_USER_PASSWORD=adminpassword123
```

### Cucumber Configuration

Modify `cucumber.js` to customize:
- Test execution settings
- Report formats
- Parallel execution
- Retry logic

## 📊 Reports

Test reports are generated in multiple formats:

- **Console**: Real-time test output
- **JSON**: `reports/cucumber-report.json`
- **HTML**: `reports/cucumber-report.html`
- **Screenshots**: `screenshots/` (on failures)
- **Videos**: `videos/` (if enabled)

## 🎯 Writing Tests

### 1. Create Feature Files

Write scenarios in Gherkin syntax:

```gherkin
Feature: User Authentication
  As a user
  I want to log in
  So that I can access my account

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should be logged in
```

### 2. Implement Step Definitions

Create step implementations:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { ICustomWorld } from '../support/world';

Given('I am on the login page', async function(this: ICustomWorld) {
  await this.pageFactory!.loginPage.goto();
});
```

### 3. Create Page Objects

Implement page interactions:

```typescript
export class LoginPage extends BasePage {
  private readonly emailInput = this.page.locator('[data-testid="email"]');
  
  async fillEmail(email: string): Promise<void> {
    await this.fillInput(this.emailInput, email);
  }
}
```

## 🛠️ Best Practices

### Test Data Management
- Use `TestUsers` class for user management
- Store test data in World context
- Clean up test data after scenarios

### Page Objects
- Extend `BasePage` for common functionality
- Use data-testid attributes for reliable selectors
- Implement assertion methods in page objects

### Error Handling
- Screenshots are automatically taken on failures
- Use meaningful error messages
- Implement retry logic for flaky elements

### Performance
- Use `waitForLoadState('networkidle')` for navigation
- Implement proper waits instead of fixed timeouts
- Run tests in parallel when possible

## 🐛 Debugging

### Debug Mode
```bash
npm run test:debug
```

### Manual Debugging
```typescript
When('I pause for debugging', async function(this: ICustomWorld) {
  await this.page!.pause(); // Opens Playwright inspector
});
```

### Screenshots
```typescript
When('I take a screenshot', async function(this: ICustomWorld) {
  await this.takeScreenshot('debug-screenshot');
});
```

## 🔄 CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: apps/booklo-e2e/reports/
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Gherkin Syntax Reference](https://cucumber.io/docs/gherkin/)

## 🤝 Contributing

1. Follow the existing code structure
2. Add appropriate test tags
3. Update documentation for new features
4. Ensure tests pass in all browsers
5. Add meaningful assertions and error messages 