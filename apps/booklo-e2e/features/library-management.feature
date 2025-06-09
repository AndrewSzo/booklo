Feature: Library Management
  As a logged-in user
  I want to manage my personal library
  So that I can organize and track my books

  Background:
    Given the application is running
    And I am logged in as a 'regularUser'
    And viewport is set to 'desktop' resolution

  Scenario: Add a new book to library
    Given I am on my library page
    When I click the add book button
    And I fill in the book details
    And I save the book
    Then the book should be added to my library
    And I should see the book in my library list

  Scenario: Search for books in library
    Given I have books in my library
    When I search for a specific book
    Then I should see only matching books
    And the search results should be highlighted


  Scenario Outline: View book details
    Given I have the book from the previous scenario in my library
    When I click on the book
    Then I should see the book details page
    And I should see the book's "<field>" information

    Examples:
      | field       |
      | author      |
      | description |

  Scenario: Remove book from library
    Given I have a book in my library
    When I select the book
    And I click the remove button
    And I confirm the removal
    Then the book should be removed from my library
    And I should see a confirmation message
