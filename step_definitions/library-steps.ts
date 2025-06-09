// Library state steps with automatic test data creation
Given('I have no books in my library', async function(this: ICustomWorld) {
  // For testing purposes, assume library is empty by default
  // In a real scenario, this would involve database cleanup
  await this.pageFactory!.libraryPage.goto();
  await this.pageFactory!.libraryPage.waitForPageLoad();
  const isEmpty = await this.pageFactory!.libraryPage.isLibraryEmpty();
  if (!isEmpty) {
    console.log('Warning: Library is not empty. Some books may be visible.');
  }
});

Given('I have books in my library', async function(this: ICustomWorld) {
  // Navigate to library first
  await this.pageFactory!.libraryPage.goto();
  await this.pageFactory!.libraryPage.waitForPageLoad();
  
  // Check if books exist, if not create them
  const hasBooks = await this.pageFactory!.libraryPage.getBooksCount() > 0;
  if (!hasBooks) {
    console.log('No books found, creating test books...');
    await this.createTestBook('Test Book 1', 'Test Author 1');
    await this.createTestBook('Test Book 2', 'Test Author 2');
    // Refresh the page to see new books
    await this.pageFactory!.libraryPage.goto();
    await this.pageFactory!.libraryPage.waitForPageLoad();
  }
});

Given('I have a book in my library', async function(this: ICustomWorld) {
  await this.pageFactory!.libraryPage.goto();
  await this.pageFactory!.libraryPage.waitForPageLoad();
  
  const hasBooks = await this.pageFactory!.libraryPage.getBooksCount() > 0;
  if (!hasBooks) {
    console.log('No books found, creating test book...');
    await this.createTestBook('Test Book', 'Test Author');
    // Refresh the page to see new book
    await this.pageFactory!.libraryPage.goto();
    await this.pageFactory!.libraryPage.waitForPageLoad();
  }
});

Given('I have a book titled {string} in my library', async function(this: ICustomWorld, bookTitle: string) {
  await this.pageFactory!.libraryPage.goto();
  await this.pageFactory!.libraryPage.waitForPageLoad();
  
  const hasBook = await this.pageFactory!.libraryPage.hasBook(bookTitle);
  if (!hasBook) {
    console.log(`Book "${bookTitle}" not found, creating it...`);
    await this.createTestBook(bookTitle, 'Test Author');
    // Refresh the page to see new book
    await this.pageFactory!.libraryPage.goto();
    await this.pageFactory!.libraryPage.waitForPageLoad();
  }
  this.setTestData('currentBookTitle', bookTitle);
});

When('I fill in the book details', async function(this: ICustomWorld) {
  // Fill in test book details in the add book form
  const titleInput = this.page!.locator('input[name="title"], input[placeholder*="title"], input[placeholder*="tytuł"]').first();
  await titleInput.fill('New Test Book');

  const authorInput = this.page!.locator('input[name="author"], input[placeholder*="author"], input[placeholder*="autor"]').first();
  await authorInput.fill('New Test Author');

  // Store test data for later verification
  this.setTestData('newBookTitle', 'New Test Book');
  this.setTestData('newBookAuthor', 'New Test Author');
});

When('I save the book', async function(this: ICustomWorld) {
  // Look for wizard "Next" buttons first, then final save button
  const nextButton = this.page!.locator('button:has-text("Dalej"), button:has-text("Next")').first();
  const isNextButtonVisible = await nextButton.isVisible();
  
  if (isNextButtonVisible) {
    // Navigate through wizard steps
    await nextButton.click();
    await this.page!.waitForTimeout(1000);
    
    // Check if there's another next button (step 2)
    const nextButton2 = this.page!.locator('button:has-text("Dalej"), button:has-text("Next")').first();
    const isNextButton2Visible = await nextButton2.isVisible();
    
    if (isNextButton2Visible) {
      await nextButton2.click();
      await this.page!.waitForTimeout(1000);
    }
  }
  
  // Finally click the save/submit button
  const saveButton = this.page!.locator(
    'button:has-text("Dodaj Książkę"), button:has-text("Save"), button:has-text("Zapisz"), button[type="submit"]'
  ).first();
  
  await saveButton.click();
  await this.page!.waitForTimeout(3000); // Wait for book to be saved
});

When('I click the remove button', async function(this: ICustomWorld) {
  // Look for remove/delete button in book details or context menu
  const removeButton = this.page!.locator(
    'button:has-text("Usuń"), button:has-text("Remove"), button:has-text("Delete"), [data-testid="remove-book"], [data-testid="delete-book"]'
  ).first();
  
  await removeButton.click();
  await this.page!.waitForTimeout(500);
});

When('I confirm the removal', async function(this: ICustomWorld) {
  // Look for confirmation dialog
  const confirmButton = this.page!.locator(
    'button:has-text("Tak"), button:has-text("Yes"), button:has-text("Potwierdź"), button:has-text("Confirm"), button:has-text("Usuń")'
  ).first();
  
  await confirmButton.click();
  await this.page!.waitForTimeout(2000); // Wait for removal to complete
}); 