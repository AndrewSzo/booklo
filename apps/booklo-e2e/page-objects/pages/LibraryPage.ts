import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class LibraryPage extends BasePage {
  // Page elements
  private readonly pageTitle: Locator;
  private readonly searchInput: Locator;
  private readonly addBookButton: Locator;
  private readonly booksList: Locator;
  private readonly bookCards: Locator;
  private readonly emptyLibraryMessage: Locator;
  private readonly filterDropdown: Locator;
  private readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators - based on library components
    this.pageTitle = page.locator('[data-testid="library-title-section"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.addBookButton = page.locator('[data-testid="add-book-button"]');
    this.booksList = page.locator('[data-testid="library-books-grid"]');
    this.bookCards = page.locator('[data-testid^="book-card"]'); // Matches book-card-0, book-card-1, etc.
    this.emptyLibraryMessage = page.locator('[data-testid="books-empty-state"]');
    this.filterDropdown = page.locator('[data-testid="filter-tabs"]');
    this.loadingSpinner = page.locator('[data-testid="books-loading-grid"]');
  }

  /**
   * Navigate to library page
   */
  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/library`);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForElement(this.pageTitle);
    
    // Wait for loading to complete
    try {
      await this.waitForElementToBeHidden(this.loadingSpinner, 5000);
    } catch {
      // Loading spinner might not appear if data loads quickly
    }
  }

  /**
   * Search for books
   */
  async searchBooks(query: string): Promise<void> {
    await this.fillInput(this.searchInput, query);
    await this.page.keyboard.press('Enter');
    await this.waitForSearchResults();
  }

  /**
   * Wait for search results to load
   */
  async waitForSearchResults(): Promise<void> {
    // Wait a moment for search to process
    await this.page.waitForTimeout(1000);
    try {
      await this.waitForElementToBeHidden(this.loadingSpinner, 5000);
    } catch {
      // Loading spinner might not appear
    }
  }

  /**
   * Click add book button
   */
  async clickAddBook(): Promise<void> {
    await this.clickElement(this.addBookButton);
  }

  /**
   * Get number of books in library
   */
  async getBooksCount(): Promise<number> {
    try {
      await this.waitForElement(this.bookCards, 3000);
      return await this.bookCards.count();
    } catch {
      return 0;
    }
  }

  /**
   * Get book titles from visible cards
   */
  async getBookTitles(): Promise<string[]> {
    const count = await this.getBooksCount();
    const titles: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const bookCard = this.page.locator(`[data-testid="book-card-${i}"]`);
      const titleElement = bookCard.locator('[data-testid="book-title"]');
      const title = await this.getElementText(titleElement);
      titles.push(title);
    }
    
    return titles;
  }

  /**
   * Click on a specific book by title
   */
  async clickBookByTitle(title: string): Promise<void> {
    const bookCard = this.page.locator(`[data-testid^="book-card"]:has([data-testid="book-title"]:has-text("${title}"))`);
    await this.clickElement(bookCard);
  }

  /**
   * Select filter option
   */
  async selectFilter(filterValue: string): Promise<void> {
    const filterTab = this.page.locator(`[data-testid="filter-tab-${filterValue}"]`);
    await this.clickElement(filterTab);
  }

  /**
   * Check if library is empty
   */
  async isLibraryEmpty(): Promise<boolean> {
    return await this.isElementVisible(this.emptyLibraryMessage);
  }

  /**
   * Check if specific book exists in library
   */
  async hasBook(title: string): Promise<boolean> {
    const bookCard = this.page.locator(`[data-testid^="book-card"]:has([data-testid="book-title"]:has-text("${title}"))`);
    return await this.isElementVisible(bookCard);
  }

  /**
   * Assert library page is loaded
   */
  async assertPageLoaded(): Promise<void> {
    await this.assertElementVisible(this.pageTitle, 'Library title should be visible');
    await this.assertElementVisible(this.addBookButton, 'Add book button should be visible');
    await this.assertPageTitle('Booklo - Book Management App');
  }

  /**
   * Assert library has books
   */
  async assertLibraryHasBooks(): Promise<void> {
    const booksCount = await this.getBooksCount();
    if (booksCount === 0) {
      throw new Error('Library should contain books but appears to be empty');
    }
  }

  /**
   * Assert library is empty
   */
  async assertLibraryIsEmpty(): Promise<void> {
    await this.assertElementVisible(this.emptyLibraryMessage, 'Empty library message should be visible');
    const booksCount = await this.getBooksCount();
    if (booksCount > 0) {
      throw new Error(`Library should be empty but contains ${booksCount} books`);
    }
  }

  /**
   * Assert specific book exists in library
   */
  async assertBookExists(title: string): Promise<void> {
    const hasBook = await this.hasBook(title);
    if (!hasBook) {
      throw new Error(`Book "${title}" should exist in library but was not found`);
    }
  }

  /**
   * Assert search results contain expected number of books
   */
  async assertSearchResultsCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getBooksCount();
    if (actualCount !== expectedCount) {
      throw new Error(`Expected ${expectedCount} search results but found ${actualCount}`);
    }
  }
} 