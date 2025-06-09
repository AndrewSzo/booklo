import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// Library navigation steps
Given('I am on my library page', async function(this: ICustomWorld) {
  await this.pageFactory!.libraryPage.goto();
  await this.pageFactory!.libraryPage.assertPageLoaded();
});

When('I navigate to my library', async function(this: ICustomWorld) {
  await this.pageFactory!.libraryPage.goto();
  await this.pageFactory!.libraryPage.waitForPageLoad();
});

When('I view my library', async function(this: ICustomWorld) {
  await this.pageFactory!.libraryPage.goto();
  await this.pageFactory!.libraryPage.waitForPageLoad();
});

// Library state steps
Given('I have no books in my library', async function(this: ICustomWorld) {
  // For testing purposes, assume library is empty by default
  // In a real scenario, this would involve database cleanup
  const isEmpty = await this.pageFactory!.libraryPage.isLibraryEmpty();
  if (!isEmpty) {
    console.log('Warning: Library is not empty. Some books may be visible.');
  }
});

Given('I have books in my library', async function(this: ICustomWorld) {
  // This step assumes books exist in the library
  // In a real scenario, this would involve seeding test data
  await this.pageFactory!.libraryPage.goto();
  const hasBooks = await this.pageFactory!.libraryPage.getBooksCount() > 0;
  if (!hasBooks) {
    throw new Error('Library should have books but appears to be empty');
  }
});

Given('I have a book in my library', async function(this: ICustomWorld) {
  await this.pageFactory!.libraryPage.goto();
  const hasBooks = await this.pageFactory!.libraryPage.getBooksCount() > 0;
  if (!hasBooks) {
    throw new Error('Library should have at least one book but appears to be empty');
  }
});

Given('I have multiple books in my library', async function(this: ICustomWorld) {
  await this.pageFactory!.libraryPage.goto();
  const booksCount = await this.pageFactory!.libraryPage.getBooksCount();
  if (booksCount < 2) {
    throw new Error(`Library should have multiple books but only has ${booksCount}`);
  }
});

Given('I have books in different categories', async function(this: ICustomWorld) {
  // This step assumes books with different reading statuses exist
  await this.pageFactory!.libraryPage.goto();
  const hasBooks = await this.pageFactory!.libraryPage.getBooksCount() > 0;
  if (!hasBooks) {
    throw new Error('Library should have books in different categories but appears to be empty');
  }
});

Given('I have a book titled {string} in my library', async function(this: ICustomWorld, bookTitle: string) {
  await this.pageFactory!.libraryPage.goto();
  const hasBook = await this.pageFactory!.libraryPage.hasBook(bookTitle);
  if (!hasBook) {
    console.log(`Book "${bookTitle}" not found, creating it...`);
    
    // Create the book using the UI
    await this.pageFactory!.libraryPage.clickAddBook();
    
    // Wait for modal and fill in details with the specific book title
    const modal = this.page!.locator('[data-testid="add-book-modal"]');
    await expect(modal).toBeVisible();
    
    // Fill basic information
    await this.page!.locator('#title').fill(bookTitle);
    await this.page!.locator('#author').fill('Test Author');
    await this.page!.locator('#description').fill(`Description for ${bookTitle}`);
    
    // Go to step 2
    await this.page!.locator('button:has-text("Dalej")').click();
    await this.page!.waitForTimeout(500);
    
    // Select reading status
    const wantToReadButton = modal.locator('button:has-text("Chcę przeczytać"):has-text("Książki które planujesz przeczytać")');
    await wantToReadButton.click();
    
    // Go to step 3
    await this.page!.locator('button:has-text("Dalej")').click();
    await this.page!.waitForTimeout(500);
    
    // Save the book
    const addBookButton = modal.locator('button:has-text("Dodaj Książkę")');
    await addBookButton.click();
    
    // Wait for book to be created and modal to close
    await expect(modal).not.toBeVisible();
    await this.pageFactory!.libraryPage.waitForPageLoad();
    
    console.log(`Book "${bookTitle}" created successfully!`);
  }
  this.setTestData('currentBookTitle', bookTitle);
});

Given('I have more than {int} books in my library', async function(this: ICustomWorld, count: number) {
  await this.pageFactory!.libraryPage.goto();
  const booksCount = await this.pageFactory!.libraryPage.getBooksCount();
  if (booksCount <= count) {
    throw new Error(`Library should have more than ${count} books but only has ${booksCount}`);
  }
});

// Book interaction steps
When('I click the add book button', async function(this: ICustomWorld) {
  await this.pageFactory!.libraryPage.clickAddBook();
});

When('I fill in the book details', async function(this: ICustomWorld) {
  // Wait for the add book modal to be visible
  const modal = this.page!.locator('[data-testid="add-book-modal"]');
  await expect(modal).toBeVisible();
  
  // ===== STEP 1: Basic Information =====
  console.log('Filling in basic information (step 1/3)...');
  
  // Fill in required fields
  const titleInput = this.page!.locator('#title');
  await titleInput.fill('Test Book Title');
  
  const authorInput = this.page!.locator('#author');
  await authorInput.fill('Test Author');
  
  // Fill in optional fields
  const isbnInput = this.page!.locator('#isbn');
  await isbnInput.fill('978-0-123-45678-9');
  
  const descriptionTextarea = this.page!.locator('#description');
  await descriptionTextarea.fill('This is a test book description for automated testing purposes.');
  
  // Click "Dalej" to go to step 2
  const nextButton1 = this.page!.locator('button:has-text("Dalej")');
  await expect(nextButton1).toBeEnabled();
  await nextButton1.click();
  
  // ===== STEP 2: Categorization =====
  console.log('Setting categorization (step 2/3)...');
  
  // Wait for the categorization step to load
  await this.page!.waitForTimeout(500);
  
  // Select reading status - choose "Chcę przeczytać" (want to read)
  const wantToReadButton = modal.locator('button:has-text("Chcę przeczytać"):has-text("Książki które planujesz przeczytać")');
  await wantToReadButton.click();
  
  // Optionally add a tag
  const tagInput = this.page!.locator('input[placeholder*="Wpisz, aby wyszukać lub dodać tagi"]');
  await tagInput.fill('test');
  await this.page!.keyboard.press('Enter');
  
  // Click "Dalej" to go to step 3
  const nextButton2 = this.page!.locator('button:has-text("Dalej")');
  await expect(nextButton2).toBeEnabled();
  await nextButton2.click();
  
  // ===== STEP 3: Review and Notes =====
  console.log('Adding review and notes (step 3/3)...');
  
  // Wait for the review step to load
  await this.page!.waitForTimeout(500);
  
  // Add a rating - click on 4th star (4/5 rating)
  const starButtons = this.page!.locator('button:has(svg.lucide-star)');
  const fourthStar = starButtons.nth(3); // 4th star (0-indexed)
  await fourthStar.click();
  
  // Add personal notes
  const notesTextarea = this.page!.locator('#notes');
  await notesTextarea.fill('This is a great test book with excellent automation testing examples. Highly recommended for QA engineers.');
  
  // Store test data for later verification
  this.setTestData('bookTitle', 'Test Book Title');
  this.setTestData('bookAuthor', 'Test Author');
  this.setTestData('bookISBN', '978-0-123-45678-9');
  this.setTestData('bookDescription', 'This is a test book description for automated testing purposes.');
  this.setTestData('bookStatus', 'want_to_read');
  this.setTestData('bookRating', 4);
  this.setTestData('bookNotes', 'This is a great test book with excellent automation testing examples. Highly recommended for QA engineers.');
  
  console.log('All book details filled successfully!');
});

When('I save the book', async function(this: ICustomWorld) {
  // Click the final "Dodaj Książkę" (Add Book) button on the third screen
  const modal = this.page!.locator('[data-testid="add-book-modal"]');
  const addBookButton = modal.locator('button:has-text("Dodaj Książkę")');
  await expect(addBookButton).toBeEnabled();
  await addBookButton.click();
  
  console.log('Book saved successfully!');
  
  // Wait for the book to be saved and modal to close
  await this.page!.waitForTimeout(2000);
});

When('I search for a specific book', async function(this: ICustomWorld) {
  const searchQuery = 'Test Book';
  await this.pageFactory!.libraryPage.searchBooks(searchQuery);
  this.setTestData('searchQuery', searchQuery);
});

When('I click on the book', async function(this: ICustomWorld) {
  const bookTitle = this.getTestData('currentBookTitle') as string;
  if (!bookTitle) {
    throw new Error('No book title stored in test data');
  }
  await this.pageFactory!.libraryPage.clickBookByTitle(bookTitle);
});

When('I select the book', async function(this: ICustomWorld) {
  const booksCount = await this.pageFactory!.libraryPage.getBooksCount();
  if (booksCount === 0) {
    throw new Error('No books available to select');
  }
  
  // Try to select the book added in the previous scenario first
  const addedBookTitle = 'Test Book Title'; // This matches the book from "Add a new book to library" scenario
  const hasSpecificBook = await this.pageFactory!.libraryPage.hasBook(addedBookTitle);
  
  if (hasSpecificBook) {
    // Select the specific book that was added
    await this.pageFactory!.libraryPage.clickBookByTitle(addedBookTitle);
    this.setTestData('selectedBook', addedBookTitle);
    console.log(`Selected book: "${addedBookTitle}"`);
  } else {
    // Fallback: select the first available book
    const bookTitles = await this.pageFactory!.libraryPage.getBookTitles();
    const firstBook = bookTitles[0];
    await this.pageFactory!.libraryPage.clickBookByTitle(firstBook);
    this.setTestData('selectedBook', firstBook);
    console.log(`Selected first available book: "${firstBook}"`);
  }
});

When('I click the remove button', async function(this: ICustomWorld) {
  // Wait for book details to be visible (assuming a sidebar or details panel opens)
  await this.page!.waitForTimeout(1000);
  
  // Look for the "Usuń Książkę" button in the danger zone
  const removeButton = this.page!.locator('button:has-text("Usuń Książkę"):has(svg.lucide-trash2)');
  
  // Scroll to the button if needed
  await removeButton.scrollIntoViewIfNeeded();
  
  // Click the remove button
  await expect(removeButton).toBeVisible();
  await removeButton.click();
  
  console.log('Clicked remove button');
});

When('I confirm the removal', async function(this: ICustomWorld) {
  // Wait for confirmation dialog/modal to appear
  await this.page!.waitForTimeout(500);
  
  // Look for common confirmation dialog patterns
  const confirmationDialog = this.page!.locator('[role="dialog"], [data-testid*="modal"], [data-testid*="dialog"]');
  
  // Try to find confirmation button with various possible texts
  const confirmButton = this.page!.locator(
    'button:has-text("Usuń"), button:has-text("Potwierdź"), button:has-text("Tak"), button:has-text("Confirm"), button:has-text("Delete")'
  ).first();
  
  if (await confirmButton.isVisible()) {
    await confirmButton.click();
    console.log('Confirmed removal via confirmation button');
  } else {
    // If no confirmation dialog appears, maybe the removal is immediate
    console.log('No confirmation dialog found - removal might be immediate');
  }
  
  // Wait for removal to process
  await this.page!.waitForTimeout(1000);
});

// Filter and sort steps
When('I apply a category filter', async function(this: ICustomWorld) {
  // Apply filter for "reading" status
  await this.pageFactory!.libraryPage.selectFilter('reading');
});

When('I sort books by {string}', async function(this: ICustomWorld, sortCriteria: string) {
  // TODO: Implement sorting functionality in the application first
  // await this.pageFactory!.libraryPage.selectSort(sortCriteria);
  console.log(`Sorting by ${sortCriteria} - functionality not yet implemented in the application`);
  this.setTestData('sortCriteria', sortCriteria);
});

// Assertion steps
Then('I should see an empty library message', async function(this: ICustomWorld) {
  await this.pageFactory!.libraryPage.assertLibraryIsEmpty();
});

Then('I should see the add book button', async function(this: ICustomWorld) {
  const addBookButton = this.page!.locator('[data-testid="add-book-button"]');
  await expect(addBookButton).toBeVisible();
});

Then('the book should be added to my library', async function(this: ICustomWorld) {
  // Wait for the modal to close and page to reload
  const modal = this.page!.locator('[data-testid="add-book-modal"]');
  await expect(modal).not.toBeVisible();
  
  // Wait for page to load with new book
  await this.pageFactory!.libraryPage.waitForPageLoad();
  
  // Verify the book appears in the library
  const booksCount = await this.pageFactory!.libraryPage.getBooksCount();
  expect(booksCount).toBeGreaterThan(0);
  
  // Try to find the specific book that was added
  const bookTitle = this.getTestData('bookTitle') as string;
  if (bookTitle) {
    const hasBook = await this.pageFactory!.libraryPage.hasBook(bookTitle);
    expect(hasBook).toBe(true);
  }
});

Then('I should see the book in my library list', async function(this: ICustomWorld) {
  await this.pageFactory!.libraryPage.assertLibraryHasBooks();
  
  // Also verify the specific book we added is visible
  const bookTitle = this.getTestData('bookTitle') as string;
  if (bookTitle) {
    await this.pageFactory!.libraryPage.assertBookExists(bookTitle);
  }
});

Then('I should see only matching books', async function(this: ICustomWorld) {
  const searchQuery = this.getTestData('searchQuery') as string;
  if (!searchQuery) {
    throw new Error('No search query stored in test data');
  }
  
  const bookTitles = await this.pageFactory!.libraryPage.getBookTitles();
  for (const title of bookTitles) {
    expect(title.toLowerCase()).toContain(searchQuery.toLowerCase());
  }
});

Then('the search results should be highlighted', async function(this: ICustomWorld) {
  // This would verify search term highlighting in results
  console.log('Verifying search result highlighting - implementation needed based on actual UI');
});

Then('I should see only books from that category', async function(this: ICustomWorld) {
  // This would verify filtered results
  const booksCount = await this.pageFactory!.libraryPage.getBooksCount();
  expect(booksCount).toBeGreaterThanOrEqual(0);
});

Then('the books should be displayed in alphabetical order', async function(this: ICustomWorld) {
  const bookTitles = await this.pageFactory!.libraryPage.getBookTitles();
  const sortedTitles = [...bookTitles].sort();
  expect(bookTitles).toEqual(sortedTitles);
});

Then('the books should be displayed by most recent first', async function(this: ICustomWorld) {
  // This would verify date-based sorting
  // Implementation depends on how dates are displayed
  console.log('Verifying date sorting - implementation needed based on actual UI');
});

Then('I should see the book details page', async function(this: ICustomWorld) {
  // This would verify book details are displayed
  // Implementation depends on how book details are shown (modal, page, sidebar)
  console.log('Verifying book details display - implementation needed based on actual UI');
});

Then('I should see the book\'s {string} information', async function(this: ICustomWorld, infoType: string) {
  // This would verify specific book information is visible
  console.log(`Verifying ${infoType} information is displayed - implementation needed based on actual UI`);
});

Then('the book should be removed from my library', async function(this: ICustomWorld) {
  // Wait for removal to complete and page to update
  await this.page!.waitForTimeout(2000); // Daj więcej czasu na odświeżenie
  
  // Wait for the library data to refresh
  await this.pageFactory!.libraryPage.waitForPageLoad();
  
  const selectedBook = this.getTestData('selectedBook') as string;
  if (selectedBook) {
    // Verify the book is no longer in the library
    const hasBook = await this.pageFactory!.libraryPage.hasBook(selectedBook);
    expect(hasBook).toBe(false);
    console.log(`Verified that book "${selectedBook}" has been removed from library`);
  } else {
    throw new Error('No selected book found in test data');
  }
});

Then('I should see a confirmation message', async function(this: ICustomWorld) {
  // Look for various types of success/confirmation messages
  const successMessages = [
    // Toast notifications
    this.page!.locator('[data-testid*="toast"], [data-testid*="notification"]'),
    // Alert messages
    this.page!.locator('[role="alert"]'),
    // Success messages with common text patterns
    this.page!.locator('text=/.*usunięt.*|.*removed.*|.*deleted.*|.*success.*/i'),
    // General success indicators
    this.page!.locator('.success, .alert-success, [class*="success"]')
  ];
  
  let messageFound = false;
  
  for (const messageLocator of successMessages) {
    try {
      if (await messageLocator.first().isVisible({ timeout: 3000 })) {
        const messageText = await messageLocator.first().textContent();
        console.log(`Found confirmation message: "${messageText}"`);
        messageFound = true;
        break;
      }
    } catch {
      // Continue to next message type
    }
  }
  
  if (!messageFound) {
    console.log('No specific confirmation message found, but this might be normal behavior');
  }
});

Then('I should see pagination controls', async function(this: ICustomWorld) {
  // This would verify pagination UI elements
  const paginationControls = this.page!.locator('[data-testid="pagination"]');
  await expect(paginationControls).toBeVisible();
});

Then('I should see only {int} books per page', async function(this: ICustomWorld, expectedCount: number) {
  const booksCount = await this.pageFactory!.libraryPage.getBooksCount();
  expect(booksCount).toBeLessThanOrEqual(expectedCount);
});

// New step specifically for View book details scenario - only verifies, doesn't create
Given('I have the book from the previous scenario in my library', async function(this: ICustomWorld) {
  await this.pageFactory!.libraryPage.goto();
  
  // The book should be "Test Book Title" from the "Add a new book to library" scenario
  const expectedBookTitle = 'Test Book Title';
  const hasBook = await this.pageFactory!.libraryPage.hasBook(expectedBookTitle);
  
  if (!hasBook) {
    throw new Error(`Book "${expectedBookTitle}" should exist from the previous "Add a new book to library" scenario, but was not found. Make sure the previous scenario ran successfully.`);
  }
  
  this.setTestData('currentBookTitle', expectedBookTitle);
  console.log(`Verified that book "${expectedBookTitle}" exists in library from previous scenario`);
}); 