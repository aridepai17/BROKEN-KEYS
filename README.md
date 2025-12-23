# Broken Keys

> A modern typing test application designed to improve your speed and accuracy with numbers and special characters.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

## 🎯 Project Overview

Broken Keys is a specialized typing test application that focuses on the most challenging characters for programmers and data entry professionals: numbers and special characters. Unlike traditional typing tests that emphasize letters, Broken Keys helps you master the characters that often slow down developers and power users.

## Preview

![Preview](https://raw.githubusercontent.com/aridepai17/BROKEN-KEYS/master/pic/pic.png)

### Key Features

-   **🎮 Multiple Test Modes**: Choose between word-based or time-based challenges
-   **⚡ Real-time Performance Metrics**: Live WPM and accuracy tracking
-   **🏆 Leaderboard System**: Compete with other users and track your progress
-   **🔐 User Authentication**: Secure login with Google or email/password
-   **🌙 Dark Mode Support**: Eye-friendly interface for extended practice sessions
-   **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
-   **🎨 Modern UI**: Built with Radix UI components and Tailwind CSS

## 🛠️ Tech Stack

### Frontend

-   **Framework**: React 19.2.0 with TypeScript
-   **Build Tool**: Vite 7.2.4
-   **Styling**: Tailwind CSS 3.4.17 with CSS animations
-   **UI Components**: Radix UI primitives with shadcn/ui
-   **Icons**: Lucide React
-   **State Management**: React Query (TanStack Query)
-   **Routing**: React Router DOM 7.10.1
-   **Forms**: React Hook Form with Zod validation
-   **Theme**: next-themes for dark/light mode switching

### Backend & Database

-   **Backend**: Supabase (PostgreSQL)
-   **Authentication**: Supabase Auth (Google OAuth + Email/Password)
-   **Real-time**: Supabase real-time subscriptions
-   **Database**: PostgreSQL with Row Level Security (RLS)

### Development Tools

-   **Linting**: ESLint with TypeScript and React plugins
-   **Code Quality**: Prettier integration
-   **Type Checking**: TypeScript 5.9.3
-   **Package Manager**: npm

## 🚀 Installation

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   Git

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/broken-keys.git
cd broken-keys

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Setup

1. **Create a Supabase Project**

    - Go to [supabase.com](https://supabase.com)
    - Create a new project
    - Get your project URL and anon key

2. **Configure Environment Variables**

    Update `.env` with your Supabase credentials:

    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3. **Database Setup**

    Run the provided SQL migrations in your Supabase SQL editor:

    ```sql
    -- Create users table
    CREATE TABLE users (
      id UUID REFERENCES auth.users(id) PRIMARY KEY,
      username TEXT UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create typing_results table
    CREATE TABLE typing_results (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id),
      wpm INTEGER NOT NULL,
      accuracy DECIMAL(5,2) NOT NULL,
      correct_chars INTEGER NOT NULL,
      incorrect_chars INTEGER NOT NULL,
      total_chars INTEGER NOT NULL,
      time_elapsed INTEGER NOT NULL,
      mode TEXT NOT NULL,
      limit_value INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE typing_results ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "Users can insert own results" ON typing_results FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can view own results" ON typing_results FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "All users can view leaderboard" ON typing_results FOR SELECT USING (true);
    ```

## 🛠️ Development Setup

### Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:5173
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
```

### Project Structure

```
broken-keys/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Header.tsx     # Application header
│   │   ├── TypingTest.tsx # Main typing test component
│   │   └── ...
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party integrations
│   │   └── supabase/
│   ├── lib/              # Utility functions
│   │   └── generateCharacters.ts
│   ├── pages/            # Page components
│   │   ├── Index.tsx     # Main typing test page
│   │   ├── Leaderboard.tsx
│   │   ├── Auth.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── supabase/             # Database migrations
├── tailwind.config.cjs   # Tailwind CSS configuration
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## 📚 API Documentation

### Authentication Endpoints

The application uses Supabase Auth for user management:

#### Sign In with Google

```typescript
const { signInWithGoogle } = useAuth();
await signInWithGoogle();
```

#### Sign In with Email

```typescript
const { signInWithEmail } = useAuth();
const { error } = await signInWithEmail(email, password);
```

#### Sign Up

```typescript
const { signUpWithEmail } = useAuth();
const { error } = await signUpWithEmail(email, password);
```

#### Sign Out

```typescript
const { signOut } = useAuth();
await signOut();
```

### Typing Test Data Structure

#### Test Results Interface

```typescript
interface TestResults {
	wpm: number; // Words per minute
	rawWpm: number; // Raw WPM (including errors)
	accuracy: number; // Accuracy percentage (0-100)
	correctChars: number; // Number of correctly typed characters
	incorrectChars: number; // Number of incorrectly typed characters
	totalChars: number; // Total characters typed
	timeElapsed: number; // Time elapsed in seconds
	mode: TestMode; // 'words' or 'time'
	limitValue: number; // Word limit or time limit
}
```

#### Character Generation

```typescript
// Generate random characters for typing test
generateCharacters(count: number): string

// Generate characters for time-based tests
generateCharactersForTime(estimatedChars: number): string
```

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Typing Results Table

```sql
CREATE TABLE typing_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  wpm INTEGER NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  correct_chars INTEGER NOT NULL,
  incorrect_chars INTEGER NOT NULL,
  total_chars INTEGER NOT NULL,
  time_elapsed INTEGER NOT NULL,
  mode TEXT NOT NULL,
  limit_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**

    ```bash
    npm i -g vercel
    ```

2. **Deploy**

    ```bash
    vercel --prod
    ```

3. **Environment Variables**
    - Add your Supabase URL and anon key to Vercel environment variables
    - Ensure all secrets are properly configured

### Deploy to Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Add the same variables as in your `.env` file

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the Repository**

    ```bash
    git clone https://github.com/yourusername/broken-keys.git
    ```

2. **Create a Feature Branch**

    ```bash
    git checkout -b feature/your-feature-name
    ```

3. **Make Your Changes**

    - Follow the existing code style
    - Add tests for new features
    - Update documentation as needed

4. **Run Tests and Linting**

    ```bash
    npm run lint
    npm run build
    ```

5. **Commit Your Changes**

    ```bash
    git commit -m "feat: add your feature description"
    ```

6. **Push and Create a Pull Request**
    ```bash
    git push origin feature/your-feature-name
    ```

### Code Style Guidelines

-   **TypeScript**: Use strict mode and proper typing
-   **Components**: Follow functional component patterns with hooks
-   **Styling**: Use Tailwind CSS classes and shadcn/ui components
-   **File Naming**: Use PascalCase for components, camelCase for utilities
-   **Imports**: Group imports: React → third-party → local modules

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug in existing feature
docs: update documentation
style: format code, add missing semicolons, etc.
refactor: refactor code without changing behavior
test: add or update tests
chore: update build process, dependency management, etc.
```

## 🏗️ Architecture Overview

### Component Architecture

The application follows a modular component architecture:

```
App
├── AuthProvider
├── QueryClientProvider
├── Router
│   ├── Index (Main typing test)
│   │   ├── Header
│   │   ├── ModeSelector
│   │   ├── TypingTest
│   │   └── Results
│   ├── Leaderboard
│   ├── Auth
│   └── NotFound
└── UI Components (shadcn/ui)
```

### State Management

-   **Global State**: React Query for server state
-   **Authentication**: AuthContext with Supabase
-   **Local State**: React hooks for component state
-   **Form State**: React Hook Form with Zod validation

### Data Flow

1. **User Authentication** → AuthContext → Supabase Auth
2. **Typing Test** → Local State → Results → Supabase Database
3. **Leaderboard** → React Query → Supabase → UI Display

### Security Features

-   **Row Level Security**: Users can only access their own data
-   **Input Validation**: Zod schemas for all form inputs
-   **XSS Protection**: React's built-in XSS protection
-   **CSRF Protection**: Supabase handles CSRF tokens
-   **Environment Variables**: Sensitive data stored securely

### Performance Optimizations

-   **Code Splitting**: React Router lazy loading
-   **Image Optimization**: Vite's asset optimization
-   **Bundle Analysis**: Built-in Vite bundle analyzer
-   **Caching**: React Query intelligent caching
-   **Tree Shaking**: Automatic dead code elimination

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   [Radix UI](https://www.radix-ui.com/) for accessible component primitives
-   [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS framework
-   [Supabase](https://supabase.com/) for the backend and authentication platform
-   [Vite](https://vitejs.dev/) for the fast build tool
-   [shadcn/ui](https://ui.shadcn.com/) for beautiful component designs

---

**Built with ❤️ for developers who want to master their keyboard skills**
