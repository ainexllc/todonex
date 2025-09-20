# NextTaskPro - Project Instructions

## ⚠️ CRITICAL: Git Commit Rules
**IMPORTANT**: NEVER commit changes unless explicitly asked by the user
- ❌ **DO NOT** automatically commit after making changes
- ❌ **DO NOT** push to repository without explicit permission
- ✅ **ONLY** commit when user says "commit", "save changes", or similar explicit request
- ✅ **ASK** before committing if unclear whether user wants changes saved

## 🔥 CRITICAL: Firebase Auto-Deployment Requirements
**MANDATORY**: Claude MUST automatically push and deploy Firebase components on my behalf:

### Required Actions for ALL Firebase Operations:
- ✅ **ALWAYS** run `firebase deploy --only firestore:rules,firestore:indexes --project nexttaskpro` 
- ✅ **IMMEDIATELY** create missing indexes when Firestore query errors occur
- ✅ **AUTOMATICALLY** deploy security rules when modified
- ✅ **VERIFY** deployment completion before proceeding with other tasks

### Specific Commands for NextTaskPro:
```bash
# Deploy everything Firebase-related
firebase deploy --only firestore:rules,firestore:indexes --project nexttaskpro

# Deploy indexes only (most common need)
firebase deploy --only firestore:indexes --project nexttaskpro

# Check current indexes status
firebase firestore:indexes --project nexttaskpro

# Deploy security rules only
firebase deploy --only firestore:rules --project nexttaskpro
```

### Firebase Project Configuration
- **Project ID**: `nexttaskpro`
- **Environment**: Production Firebase project
- **Index File**: `/firestore.indexes.json`
- **Rules File**: `/firestore.rules`
- **Authentication**: Already configured via Firebase CLI

## 💰 AI Integration - Cost-Effective Configuration
### Model Usage Strategy (STRICT COST OPTIMIZATION):
- **Primary Model**: Claude Haiku (95% usage) - $0.25/$1.25 per M tokens
- **Secondary Model**: Claude Sonnet 3.5 (5% usage) - $3/$15 per M tokens
- **Target Cost**: <$0.001 per request average
- **Daily Limit**: 100 requests/day
- **Caching**: Aggressive 70-80% cache hit rate

### Cost Monitoring:
- Track all AI requests in usage dashboard
- Monitor costs in real-time
- Alert when approaching daily limits
- Monthly projection target: <$5/month

## 🏗️ Development Environment
### Required Services Running:
- **Dev Server**: `npm run dev` (ALWAYS port 3000, run in background)
- **Firebase Project**: Connected to `nexttaskpro`
- **Playwright**: Uses port 3000 for E2E testing

### Development Server Rules:
- **ALWAYS** use port 3000 (default Next.js port)
- **ALWAYS** run `npm run dev` in the background
- **NEVER** start servers on other ports (3001, 3002, etc.)
- **RESTART**: Always use `npm run dev` on port 3000

### Key Files and Locations:
- **Firebase Config**: `/src/lib/firebase.ts`
- **AI Service**: `/src/lib/ai/anthropic-client.ts`
- **API Routes**: `/src/app/api/ai/*`
- **Task Management**: `/src/app/tasks/page.tsx`
- **Environment**: `/.env.local`

## 🧪 Testing Requirements
### Playwright Test Coverage:
- AI task creation (single and batch)
- API endpoint functionality
- Error handling and rate limiting
- Cost tracking and usage limits
- Firebase integration

### Test Commands:
```bash
# Run all tests
npx playwright test

# Run specific AI tests
npx playwright test tests/ai-task-creation.spec.ts

# Run with UI
npx playwright test --ui
```

## 🔒 Security and Data Handling
### Firestore Rules:
- User-based access control
- Family-scoped data isolation
- Validate data types and required fields
- Prevent unauthorized access

### Data Validation:
- **NEVER** pass undefined values to Firestore
- **ALWAYS** validate optional fields before adding
- **CONDITIONAL** field assignment for dates and categories
- **STRICT** type checking for all operations

## 📊 Features Overview
### Core Functionality:
1. **Task Management**: Create, edit, complete, delete tasks
2. **AI Integration**: Natural language task creation
3. **Family Sharing**: Multi-user task assignment
4. **Priority System**: High, medium, low priorities
5. **Due Dates**: Optional deadline tracking
6. **Analytics**: Task completion metrics

### AI-Enhanced Features:
1. **Smart Task Creation**: Convert natural language to structured tasks
2. **Batch Processing**: Break down complex projects into subtasks
3. **Priority Detection**: AI-suggested priority levels
4. **Due Date Estimation**: Smart deadline suggestions
5. **Usage Analytics**: Cost and performance tracking

## 🚀 Deployment Pipeline
### Vercel Integration:
- **Auto-deploy**: On main branch pushes
- **Build Command**: `npm run build`
- **Static Export**: Configured for Vercel hosting
- **Environment**: Production variables configured

### Pre-deployment Checklist:
1. ✅ Firebase rules and indexes deployed
2. ✅ `npm run build` passes locally
3. ✅ TypeScript compilation successful
4. ✅ Playwright tests passing
5. ✅ AI functionality tested
6. ✅ Cost limits verified

---
**Last Updated**: August 2025
**Project Status**: Active Development with AI Integration