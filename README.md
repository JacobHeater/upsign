# Upsign

A modern, full-stack event management platform built with Next.js, Express, and Prisma.

## 🚀 Features

- **Event Management**: Create and manage events with detailed information
- **Attendee Management**: Track and manage event attendees
- **Real-time Communication**: Socket.io-powered chat and notifications
- **Event Segments**: Organize events into manageable segments
- **User Authentication**: JWT-based authentication system
- **Responsive Design**: Mobile-first design with custom design system
- **Glass Morphism UI**: Modern, elegant user interface

## 🏗️ Architecture

This is a monorepo with three main packages:

- **`/app`**: Next.js frontend application
- **`/api`**: Express.js backend API with Prisma ORM
- **`/common`**: Shared TypeScript types and utilities

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Custom Design System** - Reusable UI components
- **Socket.io Client** - Real-time communication

### Backend

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd upsign
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   Create `.env` files in both `/api` and `/app` directories:

   **API (.env)**

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
   JWT_SECRET="your-secure-jwt-secret"
   PORT=3002
   ```

   **App (.env.local)**

   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3002"
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
   ```

4. **Set up the database**

   Using Docker Compose:

   ```bash
   docker-compose up -d postgres
   ```

   Or using local PostgreSQL, create a database named `database_name`.

5. **Run database migrations**
   ```bash
   cd api
   npx prisma migrate dev
   npx prisma db seed
   ```

### Development

Start all services:

```bash
# Start everything with Docker
docker-compose up

# Or run locally
npm run dev:api  # Terminal 1: Start API server
npm run dev      # Terminal 2: Start frontend
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3002
- **Database**: localhost:5432

### Available Scripts

```bash
# Development
npm run dev          # Start frontend dev server
npm run dev:api      # Start API dev server

# Building
npm run build        # Build all packages

# Testing
npm run test         # Run tests across all packages

# Database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
npm run db:reset     # Reset database
```

## 📁 Project Structure

```
upsign/
├── api/                    # Backend API
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── socket.ts      # Socket.io configuration
│   │   ├── routes/        # API routes
│   │   ├── repositories/  # Data access layer
│   │   ├── middleware/    # Express middleware
│   │   └── scripts/       # Database scripts
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── Dockerfile
├── app/                    # Frontend application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/               # Utilities and API client
│   └── Dockerfile
├── common/                 # Shared code
│   └── src/
│       └── schema/        # TypeScript types
└── docker-compose.yml      # Docker configuration
```

## 🔧 Configuration

### Environment Variables

#### API

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3002)

#### Frontend

- `NEXT_PUBLIC_API_URL`: API base URL
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key for location features

## 🧪 Testing

```bash
npm run test
```

Tests are configured for both frontend and backend packages.

## 🚀 Deployment

### Using Docker

```bash
docker-compose -f docker-compose.yml up -d
```

### Manual Deployment

1. Build the applications:

   ```bash
   npm run build
   ```

2. Start the API:

   ```bash
   cd api && npm start
   ```

3. Start the frontend:
   ```bash
   cd app && npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by event management platforms
- Uses open-source libraries and frameworks
