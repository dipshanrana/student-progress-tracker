# Student Progress Tracker

A comprehensive web application for tracking student performance, homework completion, and test scores. Built for modern educators and administrators.

## Tech Stack
- **Framework:** Next.js 16 (React 19) App Router
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma 7 with `@prisma/adapter-pg`
- **Authentication:** Auth.js (NextAuth) v5 with Credentials
- **Styling:** Tailwind CSS v4, Lucide React
- **Charts:** Recharts

## Features
- **Role-Based Access:** ADMIN (Full access) and VIEWER (Read-only access).
- **Dashboard:** At-a-glance analytics, overall completion rates, and top performers.
- **Student Management:** Comprehensive student profiles, test histories, and teacher remarks.
- **Homework Tracking:** Easily create assignments and mark completion status for entire classes.
- **Test Management:** Enter marks out of a configurable total; automatic percentage calculation.
- **Reporting:** Filterable leaderboards and performance distributions.

## Local Development Setup

### 1. Prerequisites
- Node.js 18+ installed
- A free account on [Neon.tech](https://neon.tech/)

### 2. Database Configuration
1. Create a new project in Neon.
2. Copy your PostgreSQL connection string.
3. In the project root, create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your Neon connection string and a generated `AUTH_SECRET`:
   ```env
   # Example: postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
   DATABASE_URL="your-neon-url-here"
   AUTH_SECRET="your-generated-secret"
   ```

### 3. Install & Initialize
1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate Prisma Client:
   ```bash
   npm run postinstall
   ```
3. Push schema to Neon:
   ```bash
   npx prisma db push
   ```
4. Seed the database with sample data and users:
   ```bash
   npm run seed
   ```
   *(Note: The seed script uses `tsx` and uses Prisma 7's new adapter syntax)*

### 4. Run the Application
Start the development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

**Default Login Credentials:**
- **Admin:** `admin@school.com` / `admin123`
- **Viewer:** `viewer@school.com` / `viewer123`

## Deployment (Vercel)

This project is optimized for deployment on Vercel's Hobby tier.

1. Push your code to a GitHub repository.
2. Log into [Vercel](https://vercel.com/) and create a new project from your repository.
3. Configure the **Environment Variables** in Vercel:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `AUTH_SECRET`: A secure random string (you can generate one with `openssl rand -base64 32`).
4. **Build Command:** Vercel automatically detects Next.js. `npm run postinstall` will ensure the Prisma Client is generated before building.
5. Deploy!

### Prisma 7 Note
This project uses **Prisma 7** which no longer bundles native database drivers. It uses `@prisma/adapter-pg` along with `pg` to communicate with Neon, meaning it's fully compatible with Edge/Serverless environments and does not require complex binary targets on Vercel.

## Troubleshooting
- **Prisma Generator Error:** If you see an error about `prisma.config.ts`, ensure you have generated the client using `npx prisma generate` which relies on the `prisma.config.ts` file for Prisma 7 environments.
