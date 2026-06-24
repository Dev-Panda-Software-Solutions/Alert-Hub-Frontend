# ProjectTracker - Client Project Progress Website

A modern, production-quality SaaS-style frontend application for managing client projects and tracking progress. Built with React + Vite + Tailwind CSS.

## 🎯 Overview

ProjectTracker is a comprehensive project management UI where:
- **Admins** can create projects, manage clients, track progress, and post updates
- **Clients** can view assigned projects, track progress, and receive updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn installed
- Modern web browser with JavaScript enabled

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5174`

## 📋 Demo Accounts

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Access:** Full admin dashboard with all management features

### Client Account
- **Email:** `john@example.com`
- **Password:** `client123`
- **Access:** Client dashboard viewing assigned projects only

*Note: Demo accounts are pre-configured for testing. In production, replace with real authentication.*

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                          # Reusable UI components
│   │   ├── ProgressBar.tsx          # Progress visualization
│   │   ├── StatusBadge.tsx          # Status indicators
│   │   ├── ProjectCard.tsx          # Project card component
│   │   ├── TaskList.tsx             # Task management UI
│   │   ├── MilestoneTimeline.tsx    # Milestone visualization
│   │   ├── UpdateFeed.tsx           # Updates and notes feed
│   │   ├── LoadingSpinner.tsx       # Loading state
│   │   ├── Header.tsx               # Top navigation bar
│   │   └── index.ts                 # Component exports
│   ├── layouts/
│   │   ├── AdminLayout.tsx          # Admin page wrapper
│   │   ├── ClientLayout.tsx         # Client page wrapper
│   │   ├── AdminSidebar.tsx         # Admin navigation sidebar
│   │   └── index.ts                 # Layout exports
│   └── ProtectedRoute.tsx           # Route protection component
├── pages/
│   ├── LandingPage.tsx              # Public home page
│   ├── LoginPage.tsx                # Authentication page
│   ├── AdminDashboard.tsx           # Admin overview
│   ├── AdminProjectsPage.tsx        # Admin project list
│   ├── AdminClientsPage.tsx         # Admin client management
│   ├── AdminSettingsPage.tsx        # Admin settings (stub)
│   ├── ClientDashboard.tsx          # Client project view
│   └── ProjectDetailsPage.tsx       # Project detail view
├── context/
│   ├── AuthContext.tsx              # Authentication state
│   └── ThemeContext.tsx             # Dark/light mode state
├── services/
│   ├── projectService.ts            # Project API calls
│   └── clientService.ts             # Client API calls
├── data/
│   └── dummy.ts                     # Mock data for development
├── hooks/                           # Custom React hooks (future)
├── App.tsx                          # Main app component & routing
├── main.tsx                         # App entry point
├── index.css                        # Tailwind imports & base styles
└── globals.css                      # Custom CSS utilities
```

## 🎨 Key Features

### 1. **Authentication & Role-Based Access**
- Login with email/password
- Two user roles: Admin and Client
- Protected routes based on user role
- Session persistence using localStorage

### 2. **Admin Dashboard**
- Overview statistics (projects, budget, progress)
- Project creation and management
- Client organization management
- Progress tracking and updates
- Project filtering by status

### 3. **Client Dashboard**
- View assigned projects only
- Track project progress
- View tasks and milestones
- Read updates and notes
- Project statistics

### 4. **Project Management**
- Detailed project views with tabs:
  - **Overview:** Key metrics and status
  - **Tasks:** Checklist with priority levels
  - **Milestones:** Timeline view of key milestones
  - **Updates:** Activity feed and notes
- Real-time progress indicators
- Budget tracking
- Team member assignments

### 5. **UI Components**
- **ProgressBar:** Visual progress with percentage
- **StatusBadge:** Status indicators with color coding
- **ProjectCard:** Reusable project summary cards
- **TaskList:** Interactive task checklist
- **MilestoneTimeline:** Visual milestone tracker
- **UpdateFeed:** Activity feed with filtering
- **LoadingSpinner:** Async operation feedback

### 6. **Dark/Light Mode**
- System preference detection
- Manual toggle in header
- Persistent theme selection
- Smooth transitions

### 7. **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly controls
- Accessible navigation

## 🔧 Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite 7** | Fast build tool & dev server |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Utility-first styling |
| **React Router v7** | Client-side routing |
| **Axios** | API calls (ready for integration) |

## 🚀 Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page

### Authenticated Routes
- `/dashboard` - Smart redirect to role-appropriate dashboard
- `/client` - Client dashboard
- `/projects/:projectId` - Project details
- `/admin` - Admin dashboard
- `/admin/projects` - All projects list
- `/admin/clients` - Client management
- `/admin/settings` - Settings (stub)

## 🎨 Styling

### Custom CSS Classes
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` - Buttons
- `.card` - Card containers
- `.input` - Form inputs
- `.badge`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-info` - Status badges
- `.line-clamp-2` - Text truncation

### Color Scheme
- **Primary:** Sky blue (`rgb(2, 132, 199)`)
- **Success:** Green (`rgb(34, 197, 94)`)
- **Warning:** Yellow (`rgb(234, 179, 8)`)
- **Error:** Red (`rgb(239, 68, 68)`)
- **Info:** Blue (`rgb(59, 130, 246)`)

## 📝 Dummy Data

Mock data is provided in `src/data/dummy.ts`:
- 3 sample users (1 admin, 2 clients)
- 3 sample client organizations
- 5 sample projects
- Tasks, milestones, and updates for each project

## 🔐 Security Notes

This is a **frontend-only** implementation. For production:

1. **Authentication:** Replace localStorage with secure HTTP-only cookies
2. **API Integration:** Replace dummy data with real API calls
3. **Authorization:** Implement server-side authorization checks
4. **Data Validation:** Add form validation and sanitization
5. **HTTPS:** Always use HTTPS in production
6. **Environment Variables:** Store API endpoints in `.env` files

## 🚀 Production Deployment

```bash
# Build for production
npm run build

# The dist/ folder is ready to deploy
# Can be hosted on:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Traditional web servers (Apache, Nginx, etc.)
```

---

**Version:** 1.0.0  
**Status:** Production-Ready Frontend ✓

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# Alert-Hub-Frontend
