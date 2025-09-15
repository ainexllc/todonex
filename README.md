# NextTaskPro - AI-Powered Task Management Platform

An intelligent task management platform that adapts to your workflow. Create, organize, and complete tasks with AI assistance, featuring natural language processing and adaptive interface that learns from your habits.

## 🚀 Features

- **AI-Powered Task Creation**: Natural language processing for intelligent task generation
- **Adaptive Dashboard**: Interface morphs based on your task management patterns
- **Smart Prioritization**: AI-suggested priority levels and due dates
- **Real-time Sync**: Live updates between family members with Firebase
- **Mobile-First Design**: Optimized for mobile with clean, modern UI
- **Batch Operations**: Create multiple tasks from complex project descriptions
- **Usage Analytics**: Cost-effective AI integration with intelligent caching

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript  
- **Styling**: Tailwind CSS with custom glass morphism theme
- **Backend**: Firebase (Auth, Firestore real-time database)
- **State Management**: Zustand for UI state, Firestore as single source of truth
- **Testing**: Playwright for E2E testing
- **Deployment**: Vercel with automatic GitHub integration

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ainexllc/nexttask.git
   cd nexttask
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

Run the test suite with Playwright:

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```

2. **Set environment variables in Vercel dashboard**
   - Add all Firebase configuration variables
   - Enable automatic deployments from GitHub

3. **Deploy**
   ```bash
   npm run vercel:deploy
   ```

### Firebase Deployment

Deploy Firebase rules and indexes:

```bash
npm run firebase:deploy:rules
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── features/          # Feature-specific components
│   ├── layout/           # Layout components
│   ├── providers/        # React providers
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                # Utility libraries
├── store/              # Zustand stores
└── types/              # TypeScript type definitions
```

## 🎯 Adaptive Behavior

NextTaskPro automatically adapts its interface based on your task management patterns:

- **New User**: Onboarding experience with getting started guides
- **Active User**: Task-focused layout with priority management
- **Power User**: Advanced features with productivity insights and analytics
- **AI Integration**: Smart suggestions based on your task completion patterns

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Copy configuration to `.env.local`
4. Deploy security rules: `npm run firebase:deploy:rules`

### PWA Configuration

The app is configured as a PWA with:
- Service worker for offline functionality
- Web app manifest for installation
- Mobile-optimized interface
- Push notification support (future feature)

## 📱 Mobile Features

- **44px touch targets** for accessibility
- **Swipe gestures** for navigation
- **Offline functionality** with smart sync
- **Install prompt** for native app experience
- **Dark/Light theme** with system preference detection

## 🔒 Security

- Firebase security rules for data protection
- Client-side data validation
- Secure environment variable handling
- Content Security Policy headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Development Notes

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.