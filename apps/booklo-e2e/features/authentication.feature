Feature: User Authentication
  As a user of the Booklo application
  I want to be able to log in and log out
  So that I can access my personal library

  Background:
    Given the application is running
    And I am on the home page
    And viewport is set to 'desktop' resolution

  Scenario: Successful login with valid credentials
    Given I navigate to the login page
    When I enter valid user credentials
    And I click the login button
    Then I should be redirected to my library
    And I should see my username in the navigation

  Scenario: Failed login with invalid credentials
    Given I navigate to the login page
    When I enter invalid user credentials
    And I click the login button
    Then I should see an error message
    And I should remain on the login page

  Scenario: Login page elements are visible
    Given I navigate to the login page
    Then I should see the email input field
    And I should see the password input field
    And I should see the login button
    And I should see the signup link

  Scenario: Navigation to signup from login page
    Given I navigate to the login page
    When I click the signup link
    Then I should be redirected to the signup page

  Scenario: Logout functionality
    Given I am logged in as a regular user
    When I click the logout button
    Then I should be logged out
    And I should be redirected to the home page 