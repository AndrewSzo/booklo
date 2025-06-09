import { Page } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { LibraryPage } from './pages/LibraryPage';

export class PageFactory {
  private page: Page;
  private _homePage?: HomePage;
  private _loginPage?: LoginPage;
  private _libraryPage?: LibraryPage;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get HomePage instance (lazy initialization)
   */
  get homePage(): HomePage {
    if (!this._homePage) {
      this._homePage = new HomePage(this.page);
    }
    return this._homePage;
  }

  /**
   * Get LoginPage instance (lazy initialization)
   */
  get loginPage(): LoginPage {
    if (!this._loginPage) {
      this._loginPage = new LoginPage(this.page);
    }
    return this._loginPage;
  }

  /**
   * Get LibraryPage instance (lazy initialization)
   */
  get libraryPage(): LibraryPage {
    if (!this._libraryPage) {
      this._libraryPage = new LibraryPage(this.page);
    }
    return this._libraryPage;
  }

  /**
   * Reset all page instances (useful for test cleanup)
   */
  reset(): void {
    this._homePage = undefined;
    this._loginPage = undefined;
    this._libraryPage = undefined;
  }

  /**
   * Get page instance by name
   */
  getPage(pageName: string): HomePage | LoginPage | LibraryPage {
    switch (pageName.toLowerCase()) {
      case 'home':
      case 'homepage':
        return this.homePage;
      case 'login':
      case 'loginpage':
        return this.loginPage;
      case 'library':
      case 'librarypage':
        return this.libraryPage;
      default:
        throw new Error(`Unknown page: ${pageName}`);
    }
  }
} 