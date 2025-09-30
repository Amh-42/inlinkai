# InlinkAI - Better Auth Integration

This is a complete Next.js application featuring [Better Auth](https://github.com/better-auth/better-auth) authentication integrated with a beautiful, modern InlinkAI template. Transform your LinkedIn presence with AI-powered tools and secure authentication.

## Features

### 🔐 Authentication
- ✅ Email/Password Authentication
- ✅ GitHub OAuth Integration
- ✅ Google OAuth Integration
- ✅ Session Management
- ✅ Protected Routes

### 🎨 Design & User Experience
- ✅ Modern, Professional UI Design
- ✅ Dark/Light Theme Toggle
- ✅ Responsive Mobile-First Design
- ✅ Glassmorphism Navigation
- ✅ Smooth Animations & Transitions
- ✅ Professional Typography (Manrope Font)

### 🚀 Technical Features
- ✅ Next.js 15 App Router
- ✅ TypeScript Support
- ✅ SQLite Database
- ✅ Better Auth Integration
- ✅ Client-Side Navigation
- ✅ SEO Optimized

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment Variables

Create a `.env` file in the root directory:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-key-here-please-change-in-production
BETTER_AUTH_URL=http://http://localhost:3000

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth (optional)  
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Important**: Generate a secure secret for `BETTER_AUTH_SECRET` in production!

### 3. Generate Database Schema

```bash
npm run db:migrate
```

This creates the required database tables using Better Auth's CLI.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://http://localhost:3000](http://http://localhost:3000) to see the application.

## Project Structure

```
better-auth-proj/
├── app/
│   ├── api/auth/[...all]/
│   │   └── route.ts          # Better Auth API routes
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main authentication page
├── lib/
│   ├── auth.ts               # Better Auth server configuration
│   └── auth-client.ts        # Better Auth client configuration
├── .env                      # Environment variables
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## Authentication Methods

### Email/Password

- Users can sign up with email and password
- Sign in with existing credentials
- Automatic session management

### GitHub OAuth

To enable GitHub authentication:

1. Create a GitHub OAuth App:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`

2. Add your GitHub app credentials to `.env`:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

### Google OAuth

To enable Google authentication:

1. Create a Google OAuth App:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" > "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. Add your Google app credentials to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Apply database migrations
- `npm run db:generate` - Generate migration files

## Database

This project uses MySQL with Better Auth's built-in adapter. The database configuration is in `lib/auth.ts`.

## Security Notes

- ⚠️ Change the `BETTER_AUTH_SECRET` in production
- ⚠️ Use HTTPS in production
- ⚠️ Keep your GitHub OAuth credentials secure
- ⚠️ Add proper error handling for production use

## Learn More

- [Better Auth Documentation](https://better-auth.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)

## License

This project is for demonstration purposes. Feel free to use it as a starting point for your own applications.
