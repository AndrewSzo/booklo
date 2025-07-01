# 📚 Booklo

A modern web application for managing and organizing your reading journey. Booklo helps readers keep track of their reading lists, manage their current reads, and maintain a collection of finished books with personal notes and ratings.

## Table of Contents
- [Project Description](#project-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

Booklo solves the common problem of losing track of reading lists. It provides a simple and intuitive tool to manage reading plans and reflections without unnecessary features or a cluttered interface. The application helps users remember what they've already read, what they plan to read, and which books they're currently reading.

## Features

### Core Functionality
- Add books to three main categories:
  - "Want to Read"
  - "Reading Now"
  - "Finished Reading"
- View and filter book lists by status
- Rate books using a 5-star system
- Add personal notes and reviews
- Edit and delete book entries
- Search books by title or author

### User Interface
- **Left Sidebar**
  - Home dashboard
  - Library section with reading categories
  - Feed of recently added books
  - Shortlist/Pinned items
  - Search and preferences
  - User profile management

- **Main Area**
  - Book filtering tabs (Reading, Next, Finished)
  - Search functionality
  - Book list display with status and ratings

- **Right Sidebar**
  - Book details and metadata
  - Personal notes section
  - Related links and resources

## Tech Stack

### Frontend
- **Next.js 14** - Fast, efficient pages and applications
- **React 19** - Interactive components
- **TypeScript 5** - Static typing and IDE support
- **Tailwind 4** - Application styling
- **Shadcn/ui** - Accessible React components

### Backend
- **Supabase**
  - PostgreSQL database
  - Backend-as-a-Service
  - Built-in authentication
  - Multi-language SDKs

### AI Integration
- **Openrouter.ai**
  - Access to multiple AI models
  - Cost-effective API solutions
  - Financial limits on API keys

### CI/CD and Hosting
- **GitHub Actions** - CI/CD pipelines
- **DigitalOcean** - Docker-based hosting

## Getting Started Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Scope

### MVP Features
- Basic book management (add, edit, delete)
- Book categorization and filtering
- Rating system
- Notes and reviews
- Local storage or Supabase backend

### Out of Scope for MVP
- Cross-device synchronization
- External data imports
- Book cover scanning
- Book recommendations
- Social features
- Mobile app
- Chapter-level notes
- AI-powered idea linking

## Project Status

This project is currently in development (version 0.1.0). The MVP is being developed with a focus on core functionality and user experience.

### Success Criteria
- Users adding 10+ books in first week
- 60%+ of finished books having ratings/reviews
- 3+ user sessions per week

## License

This project is private and proprietary. All rights reserved.

fds