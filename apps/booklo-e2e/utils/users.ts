export interface TestUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  isActive: boolean;
}

export interface TestUserCredentials {
  email: string;
  password: string;
}

export class TestUsers {
  private static readonly users: Record<string, TestUser> = {
    regularUser: {
      email: process.env.TEST_USER_EMAIL || 'test@test.com',
      password: process.env.TEST_USER_PASSWORD || 'Test12!@',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true
    },
    adminUser: {
      email: process.env.ADMIN_USER_EMAIL || 'admin@booklo.com',
      password: process.env.ADMIN_USER_PASSWORD || 'AdminUser123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    },
    inactiveUser: {
      email: 'inactive.user@booklo.com',
      password: 'InactiveUser123!',
      firstName: 'Inactive',
      lastName: 'User',
      role: 'user',
      isActive: false
    },
    libraryUser: {
      email: 'library.user@booklo.com',
      password: 'LibraryUser123!',
      firstName: 'Library',
      lastName: 'User',
      role: 'user',
      isActive: true
    }
  };

  /**
   * Get user by role
   */
  static getUser(userType: string): TestUser {
    const user = this.users[userType];
    if (!user) {
      throw new Error(`User type '${userType}' not found. Available types: ${Object.keys(this.users).join(', ')}`);
    }
    return user;
  }

  /**
   * Get user credentials
   */
  static getCredentials(userType: string): TestUserCredentials {
    const user = this.getUser(userType);
    return {
      email: user.email,
      password: user.password
    };
  }

  /**
   * Get regular user
   */
  static getRegularUser(): TestUser {
    return this.getUser('regularUser');
  }

  /**
   * Get admin user
   */
  static getAdminUser(): TestUser {
    return this.getUser('adminUser');
  }

  /**
   * Get inactive user
   */
  static getInactiveUser(): TestUser {
    return this.getUser('inactiveUser');
  }

  /**
   * Get library user (user with books in library)
   */
  static getLibraryUser(): TestUser {
    return this.getUser('libraryUser');
  }

  /**
   * Get all available user types
   */
  static getAvailableUserTypes(): string[] {
    return Object.keys(this.users);
  }

  /**
   * Check if user type exists
   */
  static hasUserType(userType: string): boolean {
    return userType in this.users;
  }

  /**
   * Generate random user data
   */
  static generateRandomUser(role: 'user' | 'admin' = 'user'): TestUser {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000);
    
    return {
      email: `test.user.${timestamp}.${randomId}@booklo.com`,
      password: `TestPassword123!${randomId}`,
      firstName: `TestUser${randomId}`,
      lastName: 'Generated',
      role,
      isActive: true
    };
  }

  /**
   * Validate user credentials format
   */
  static validateCredentials(credentials: TestUserCredentials): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    
    return emailRegex.test(credentials.email) && passwordRegex.test(credentials.password);
  }

  /**
   * Get user by email
   */
  static getUserByEmail(email: string): TestUser | undefined {
    return Object.values(this.users).find(user => user.email === email);
  }
} 