# TenantHub Frontend

TenantHub Frontend is a Vite + React application for managing workspaces, users, tasks, billing, profiles, file uploads, and notifications.

## Features

- Login and registration
- Email verification flow
- Forgot password and reset password flow
- Protected routes
- Admin-only routes
- Dashboard with task analytics
- Task list with filtering, pagination, status, priority, assignee, due date, description, and attachments
- Task create and edit screens
- File upload, open, and delete controls
- Workspace user management
- Invite user action
- Billing page with Stripe Checkout subscription flow
- Subscription plan cards with current plan state
- Plan update and cancel-renewal actions
- Profile page with password change and push notification registration
- Firebase foreground notification support
- Responsive Tailwind UI

## Tech Stack

- React
- Vite
- React Router
- Tailwind CSS
- Firebase Messaging
- Fetch API

## Folder Structure

```text
src/
  api/
    apiClient.js
    auth.js
    billing.js
    tasks.js
    workspace.js

  components/
    AdminRoute.jsx
    Navbar.jsx
    PasswordInput.jsx
    PlanBadge.jsx
    ProtectedRoute.jsx
    TaskForm.jsx
    UpgradePrompt.jsx

  context/
    AuthContext.jsx

  pages/
    Billing.jsx
    Dashboard.jsx
    ForgotPassword.jsx
    InviteSetPassword.jsx
    Login.jsx
    Profile.jsx
    Register.jsx
    TaskEdit.jsx
    Tasks.jsx
    Users.jsx
    VerifyEmail.jsx

  services/
    pushNotifications.js
```

## Main Workflows

### Authentication

- Register creates a workspace admin account
- Email OTP verification is required before login
- Login stores access and refresh tokens
- Protected routes redirect unauthenticated users
- Admin-only routes protect billing and user management

### Task Management

- Create tasks with title, description, status, priority, due date, and assignee
- Edit task details
- Upload task attachments
- Open protected uploaded files
- Delete uploaded files
- Remove tasks
- Filter tasks by status, priority, assignee, and overdue state

### Billing

- Loads subscription plans from the backend
- Starts Stripe Checkout for new subscriptions
- Completes checkout after Stripe redirects back with `session_id`
- Updates existing subscriptions
- Cancels renewal and shows cancellation state
- Displays plan features and current plan badge

### Notifications

- Registers the browser/device FCM token
- Push checkbox reflects browser notification permission
- Foreground Firebase messages show browser notifications when permission is granted

## Environment Variables

Create `.env`:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

For Render/static hosting, set:

```text
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

Keep `.env` private. Commit `.env.example`.

## Local Setup

Install dependencies:

```powershell
npm install
```

Run development server:

```powershell
npm run dev
```

Build production assets:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

## Deployment

The frontend can be deployed as a Render Static Site.

Recommended Render settings:

```text
Root Directory: TenantHub-frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Required Render env var:

```text
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

Render can auto-deploy the static site from GitHub, so a separate frontend GitHub Actions workflow is optional.

## Notes

- `node_modules/`, `dist/`, and local `.env` files are ignored by Git.
- The frontend expects the backend API to use the `/api/v1` prefix.
- Stripe Checkout completion is handled on the Billing page when the URL contains `checkout=success&session_id=...`.
