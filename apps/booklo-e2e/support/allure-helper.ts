import * as allure from 'allure-js-commons';
import { ICustomWorld } from './world';
import * as fs from 'fs';
import * as path from 'path';

export class AllureHelper {
  /**
   * Add description to current test
   */
  static async addDescription(description: string): Promise<void> {
    await allure.description(description);
  }

  /**
   * Add severity to current test
   */
  static async addSeverity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): Promise<void> {
    await allure.severity(severity);
  }

  /**
   * Add feature to current test
   */
  static async addFeature(feature: string): Promise<void> {
    await allure.feature(feature);
  }

  /**
   * Add story to current test
   */
  static async addStory(story: string): Promise<void> {
    await allure.story(story);
  }

  /**
   * Add tag to current test
   */
  static async addTag(tag: string): Promise<void> {
    await allure.tag(tag);
  }

  /**
   * Add owner to current test
   */
  static async addOwner(owner: string): Promise<void> {
    await allure.owner(owner);
  }

  /**
   * Add issue link to current test
   */
  static async addIssue(name: string, url: string): Promise<void> {
    await allure.issue(name, url);
  }

  /**
   * Add TMS link to current test
   */
  static async addTmsLink(name: string, url: string): Promise<void> {
    await allure.tms(name, url);
  }

  /**
   * Add link to current test
   */
  static async addLink(name: string, url: string, type?: string): Promise<void> {
    await allure.link(name, url, type);
  }

  /**
   * Add step to current test
   */
  static async addStep(name: string, status: 'passed' | 'failed' | 'broken' | 'skipped' = 'passed'): Promise<void> {
    await allure.step(name, async () => {
      // Step implementation here if needed
    });
  }

  /**
   * Add attachment to current test
   */
  static async addAttachment(name: string, content: string | Buffer, type: string = 'text/plain'): Promise<void> {
    await allure.attachment(name, content, type);
  }

  /**
   * Add screenshot to current test
   */
  static async addScreenshot(world: ICustomWorld, name: string = 'Screenshot'): Promise<void> {
    if (world.page) {
      try {
        const screenshot = await world.page.screenshot({ fullPage: true });
        allure.attachment(name, screenshot, 'image/png');
      } catch (error) {
        console.error('Failed to take screenshot for Allure:', error);
      }
    }
  }

  /**
   * Add page source to current test
   */
  static async addPageSource(world: ICustomWorld, name: string = 'Page Source'): Promise<void> {
    if (world.page) {
      try {
        const content = await world.page.content();
        allure.attachment(name, content, 'text/html');
      } catch (error) {
        console.error('Failed to get page source for Allure:', error);
      }
    }
  }

  /**
   * Add browser logs to current test
   */
  static async addBrowserLogs(world: ICustomWorld, name: string = 'Browser Logs'): Promise<void> {
    if (world.page) {
      try {
        // Collect console logs (this would need to be implemented with page.on('console') listener)
        const logs = 'Browser logs would be collected here'; // Placeholder
        allure.attachment(name, logs, 'text/plain');
      } catch (error) {
        console.error('Failed to get browser logs for Allure:', error);
      }
    }
  }

  /**
   * Add test environment info
   */
  static addEnvironmentInfo(): void {
    const environmentInfo = {
      'Node.js': process.version,
      'OS': process.platform,
      'Browser': process.env.BROWSER || 'chromium',
      'Headless': process.env.HEADLESS || 'true',
      'Base URL': process.env.BASE_URL || 'http://localhost:3000',
      'Slow Motion': process.env.SLOW_MO || '0',
      'Timeout': process.env.TIMEOUT || '30000'
    };

    // Create environment.properties file
    const envContent = Object.entries(environmentInfo)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const envPath = path.join('reports', 'allure-results', 'environment.properties');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(envPath), { recursive: true });
    fs.writeFileSync(envPath, envContent);
  }

  /**
   * Add test categories
   */
  static addCategories(): void {
    const categories = [
      {
        name: 'Ignored tests',
        matchedStatuses: ['skipped']
      },
      {
        name: 'Infrastructure problems',
        matchedStatuses: ['broken', 'failed'],
        messageRegex: '.*TimeoutError.*|.*ConnectionError.*|.*NetworkError.*'
      },
      {
        name: 'Outdated tests',
        matchedStatuses: ['broken'],
        traceRegex: '.*ElementNotFoundError.*|.*SelectorError.*'
      },
      {
        name: 'Product defects',
        matchedStatuses: ['failed']
      }
    ];

    const categoriesPath = path.join('reports', 'allure-results', 'categories.json');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(categoriesPath), { recursive: true });
    fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
  }

  /**
   * Mark test as flaky
   */
  static async markAsFlaky(): Promise<void> {
    await allure.tag('flaky');
  }

  /**
   * Mark test as muted
   */
  static async markAsMuted(): Promise<void> {
    await allure.tag('muted');
  }

  /**
   * Add epic to current test
   */
  static async addEpic(epic: string): Promise<void> {
    await allure.epic(epic);
  }

  /**
   * Add parameter to current test
   */
  static async addParameter(name: string, value: string): Promise<void> {
    await allure.parameter(name, value);
  }
}

export default AllureHelper; 