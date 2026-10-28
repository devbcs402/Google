# Email Vault Manager

A full-stack MERN (MongoDB Atlas, Express.js, React, Node.js) web application for securely organizing and managing personal email addresses and their associated purposes, storage locations, important links, notes, and PDF backups.

> **Privacy & Security Philosophy**: Email Vault Manager is a private digital organization dashboard. **It does NOT store or request passwords for your email accounts.** It helps you keep track of which inboxes you own, what each inbox is used for (e.g., college drive, shopping receipts, freelance clients), and where important documents or folders are located.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6
- **Backend**: Node.js, Express.js, Mongoose, PDFKit (`pdfkit`), JWT (`jsonwebtoken`), bcryptjs, Helmet, Rate Limiting
- **Database**: MongoDB Atlas using Mongoose (`mongoose.connect(process.env.MONGODB_URI)`)
- **State & Alerts**: React Context API (`AuthContext`, `ToastContext`), Axios interceptors

---

## Project Structure

```text
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── components/         # Reusable UI components (AppLayout, AccountCard, ConfirmDialog, etc.)
│   │   ├── context/            # Global state (AuthContext, ToastContext)
│   │   ├── lib/                # API client configuration with Axios interceptors & backup downloader
│   │   ├── pages/              # Application views:
│   │   │   ├── LandingPage.jsx       # Public landing page
│   │   │   ├── AuthPage.jsx          # Register and Login forms
│   │   │   ├── DashboardPage.jsx     # Overview with statistics, favorites, category counters, and "Backup Now"
│   │   │   ├── AccountsPage.jsx      # Accounts list with grid/table view, search & filters
│   │   │   ├── AccountFormPage.jsx   # Add & Edit email account form
│   │   │   ├── AccountDetailPage.jsx # Full account details view with copy actions
│   │   │   ├── BackupPage.jsx        # Dedicated Vault Backup page with security notices & PDF download
│   │   │   ├── ProfilePage.jsx       # Profile details & update settings
│   │   │   └── NotFoundPage.jsx      # Accessible 404 page
│   │   ├── App.jsx             # Router and protected route definitions
│   │   ├── main.jsx            # Entry point
│   │   └── styles.css          # Design system & responsive layout styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                     # Backend Express.js API
│   ├── src/
│   │   ├── config/             # Environment & MongoDB connection (`db.js`, `env.js`)
│   │   ├── controllers/        # Route controllers (`authController.js`, `accountController.js`)
│   │   ├── middleware/         # Auth verification (`auth.js`) & error handling (`errors.js`)
│   │   ├── models/             # Mongoose schemas (`User.js`, `EmailAccount.js`)
│   │   ├── routes/             # REST API routes (`authRoutes.js`, `accountRoutes.js`)
│   │   ├── utils/              # Validators (`validation.js`) & PDF generation (`pdfBackup.js`)
│   │   ├── app.js              # Express app setup with middleware & security headers
│   │   └── server.js           # Server bootstrap & DB connection
│   ├── test/                   # Automated unit and integration tests
│   ├── .env.example            # Environment variables template
│   ├── .gitignore              # Ignores `.env` and `node_modules`
│   └── package.json
├── .gitignore                  # Git ignore rules
├── package.json                # Root scripts to orchestrate client & server
└── README.md
```

---

## Features

1. **User Authentication**
   - Register with name, email, and password (hashed with bcrypt 12 rounds)
   - Login with JWT token issuance (stored securely in browser `localStorage`)
   - Protected routes in both Express and React Router
   - Profile management to view and update account details

2. **Email Account Management**
   - **Add Account**: Label, email address, provider (Gmail, Outlook, Yahoo, Other), category, purpose, storage details, important links, notes, and favorite toggle
   - **Edit Account**: Update any metadata or links
   - **Delete Account**: With accessible confirmation modal
   - **Search & Filters**: Search across email address, label, purpose, and category; filter by category; filter by favorites; switch between Card Grid and Table views
   - **Copy Email**: One-click copy email button with instant visual feedback and toast notification
   - **Favorites**: Toggle favorite status on cards, rows, or detail views

3. **Secure PDF Vault Backup**
   - **On-Demand Generation**: Generates an A4 PDF backup with professional typography, headers, and category grouping
   - **Sidebar & Dashboard Integration**: Direct access via the "Backup" navigation item and "Backup Now" dashboard button
   - **Strict Privacy**: Only includes records belonging to the authenticated user. Never saves PDFs to disk (streamed directly in memory)
   - **Full Detail Export**: Includes email address, label, provider, category, purpose, storage details, links, private notes, favorites, and timestamps
   - **Safety First**: Confirmation modal with sensitive data warning prior to download

4. **Database Schema**
   - **User**: `name`, `email` (unique), `passwordHash`, `createdAt`, `updatedAt`
   - **EmailAccount**: `userId` (indexed to owner), `emailAddress` (unique per user), `label`, `provider`, `category`, `purpose`, `storageDetails`, `importantLinks` (array of `{ title, url }`), `notes`, `isFavorite`, `createdAt`, `updatedAt`

5. **Dashboard**
   - Total saved email accounts counter
   - Favorites counter and dedicated Favorite Accounts section
   - Category count breakdown cards
   - Recently added email accounts
   - One-click "Backup Now" trigger with modal confirmation

---

## Security Implementation

- **No Hardcoded Credentials**: Database connection strings and JWT secrets are kept exclusively in `server/.env` and excluded via `.gitignore`.
- **User Isolation**: All queries (`find`, `findOne`, `findOneAndUpdate`, `findOneAndDelete`) enforce `{ userId: req.user.id }` so one logged-in user can never see or mutate another user's accounts or download another user's backup.
- **In-Memory PDF Streaming**: PDF backups are generated using `pdfkit` and piped directly to the HTTP response stream. No temporary or persistent PDF files are stored on the server.
- **Unique Per User**: Email addresses are unique per user workspace without blocking different users from registering accounts with the same external email address.
- **Input Validation**: Strict input sanitization and boundary checks on all endpoints. Unrecognized fields are rejected.
- **Zero Email Passwords**: The vault is strictly for account metadata, purpose, and links. Passwords are never collected or stored.
- **Security Headers & Rate Limiting**: Uses Helmet, CORS origin controls, and rate limiting on authentication routes.

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js (v18.18 or later)
- MongoDB Atlas cluster (or local MongoDB)

### 2. Configure Environment Variables
Copy `server/.env.example` to `server/.env`:
```sh
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_chars
CLIENT_URL=http://localhost:5173
```

> **Important MongoDB Atlas Tip**: In your MongoDB Atlas dashboard, navigate to **Network Access** -> **IP Access List** and ensure your current IP address (or `0.0.0.0/0` for development access from anywhere) is allowed, otherwise MongoDB Atlas will block incoming connections.

### 3. Install Dependencies
From the project root:
```sh
npm --prefix server install
npm --prefix client install
```

### 4. Run the Application
In separate terminal windows from the root directory:

**Terminal 1 (Backend API):**
```sh
npm run server
```
*API will listen on `http://localhost:5000`.*

**Terminal 2 (Frontend React App):**
```sh
npm run dev
```
*Vite dev server will start at `http://localhost:5173`.*

---

## REST API Reference

All `/api/emails` endpoints require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Sign in with email and password |
| `GET` | `/api/auth/me` | Retrieve current authenticated user profile |
| `PATCH` | `/api/auth/me` | Update current user name or email |
| `GET` | `/api/emails` | List all accounts (supports `?search=`, `?category=`, `?favorite=`) |
| `GET` | `/api/emails/:id` | Get details for a single email account |
| `POST` | `/api/emails` | Create a new email account |
| `PUT` | `/api/emails/:id` | Update an existing email account |
| `PATCH` | `/api/emails/:id/favorite` | Toggle or set `isFavorite` status |
| `DELETE` | `/api/emails/:id` | Delete an email account |
| `GET` | `/api/emails/backup/pdf` | Stream authenticated user's accounts as downloadable PDF |
| `GET` | `/api/health` | Health check endpoint |

---

## Testing & Verification

Run the test suite and verify frontend production build:
```sh
npm run test:server    # Executes node test runner on backend endpoints, validations, and PDF generator
npm run build          # Builds production bundle in client/dist
```
