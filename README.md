# Folder Manager - Frontend

A React-based file management application with Google Drive-style navigation, built with Ant Design and Tailwind CSS.

## Features

- **Authentication**: Login, Signup with JWT-based authentication
- **Folder Navigation**: Click-to-navigate folder structure (like Google Drive)
- **Folder Management**: Create, rename, and delete folders
- **Image Upload**: Upload images to folders with drag-and-drop support
- **Breadcrumb Navigation**: Easy navigation with clickable breadcrumbs
- **Protected Routes**: Secure dashboard with automatic session restoration
- **Optimistic Updates**: Instant UI feedback before server confirmation

## Tech Stack

- **React 19** - UI Framework
- **Ant Design 6** - UI Component Library
- **Tailwind CSS 3** - Utility-first CSS
- **Axios** - HTTP Client with interceptors
- **React Router 6** - Client-side routing

## Project Structure

```
src/
├── components/
│   ├── Breadcrumb.jsx      # Navigation breadcrumb
│   ├── CreateFolderModal.jsx # Modal for creating folders
│   ├── FolderView.jsx      # Main folder navigation component
│   ├── ProtectedRoute.jsx  # Auth-protected route wrapper
│   └── UploadModal.jsx     # Image upload modal
├── context/
│   └── AuthContext.jsx     # Authentication state management
├── pages/
│   ├── Dashboard.jsx       # Main dashboard page
│   ├── Login.jsx           # Login page
│   └── Signup.jsx          # Registration page
├── services/
│   └── apiService.js       # API client with auth interceptors
├── App.js                  # Main app with routing
└── index.js                # Entry point
```

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`

Builds the app for production to the `build` folder

### `npm test`

Launches the test runner

## API Integration

The frontend communicates with the backend through:

- **Auth API**: `/api/auth/*` - Login, register, refresh token, logout
- **Folder API**: `/api/folders/*` - CRUD operations for folders
- **Image API**: `/api/images/*` - Upload and manage images

## Authentication Flow

1. User logs in → receives access token (in memory) + refresh token (HttpOnly cookie)
2. Access token attached to all API requests via Axios interceptor
3. On 401 (token expired) → automatic refresh using cookie
4. On page reload → session restored via refresh token API
