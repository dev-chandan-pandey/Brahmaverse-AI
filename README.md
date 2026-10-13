# Brahmaverse AI — CRM Lead Management System

A full-stack Customer Relationship Management (CRM) application for managing enquiries, connecting counselors with potential leads, and tracking claimed enquiries.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Frontend and Backend Integration](#frontend-and-backend-integration)
- [Production Deployment](#production-deployment)
- [Testing](#testing)

## Overview

Brahmaverse AI CRM is a full-stack web application consisting of two main components:

- **Frontend:** A responsive user interface for counselors to authenticate, view enquiries, create leads, and claim public leads.
- **Backend:** A REST API that handles authentication, enquiry management, lead claiming, and database operations.

The application uses JWT-based authentication to protect authorized operations and MongoDB to store application data.

## Features

- Counselor registration and login.
- JWT-based authentication.
- Protected dashboard routes.
- Create new enquiries through the frontend.
- View available public enquiries.
- View enquiries associated with the authenticated counselor.
- Claim available leads.
- Search and view lead information in the dashboard.
- Dashboard statistics and lead-management interface.
- Frontend and backend separation for independent deployment.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- Axios
- Sonner for notifications
- Lucide React for icons

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Zod for validation

## Project Structure

```text
Brahmaverse-AI/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── crm-lead-management-api/
│   ├── src/
│   │   ├── routes/
│   │   └── app.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

*The environment example files should be created if they do not already exist. The structure above is representative; actual files may vary.*

## Prerequisites

Install the following before running the project:

- Node.js and npm.
- Git.
- A MongoDB database, locally or through MongoDB Atlas.
- A GitHub account for repository hosting.
- Render and Vercel accounts for deployment, if deploying to those platforms.

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/dev-chandan-pandey/Brahmaverse-AI
cd Brahmaverse-AI
```

### 2. Configure the backend

```bash
cd crm-lead-management-api
npm install
```

Create a `.env` file in the backend directory and configure the database connection, JWT secret, and frontend origin according to the environment variable names used in the backend code.

Start the backend using the available development script in `package.json`. For example, if a `dev` script exists:

```bash
npm run dev
```

The local API is expected to run at:

```text
http://localhost:5000
```

### 3. Configure the frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory with the following variable:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:5173
```

### 4. Build the frontend

From the frontend directory, run:

```bash
npm run build
```

Vite generates the production assets in the `dist/` directory.

The backend does not necessarily require a build step because it runs directly on Node.js. Use the scripts defined in its `package.json`.

## Environment Variables

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, including `/api/v1` |

Example for local development:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Backend

Configure the environment variables expected by the backend implementation.

Typical settings include:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string, if this is the configured key |
| `JWT_SECRET` | Secret used to sign and verify JWTs, if this is the configured key |
| `CLIENT_ORIGIN` | Allowed frontend origin for CORS |
| `PORT` | Port used by the Express server, if configurable |
| `NODE_ENV` | Runtime environment |

**Important:** Confirm the exact variable names in the backend source code and existing `.env` file before configuring production. Never commit `.env` files, database credentials, or JWT secrets to GitHub.

## API Documentation

The API base path is:

```text
/api/v1
```

### Available endpoints

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/v1/health` | Check API health | Public |
| POST | `/api/v1/auth/register` | Register a counselor | Public |
| POST | `/api/v1/auth/login` | Authenticate a counselor | Public |
| GET | `/api/v1/auth/me` | Retrieve the authenticated counselor | Required |
| POST | `/api/v1/enquiries` | Create an enquiry | Public |
| GET | `/api/v1/enquiries/public` | Retrieve public enquiries | Required |
| GET | `/api/v1/enquiries/mine` | Retrieve the counselor's enquiries | Required |
| PATCH | `/api/v1/enquiries/:id/claim` | Claim an enquiry | Required |

Protected endpoints require a valid access token, normally sent through the HTTP `Authorization` header:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

### Example: Create an enquiry

**Request**

```http
POST /api/v1/enquiries
Content-Type: application/json
```

```json
{
  "name": "Sample Student",
  "email": "student@example.com",
  "phone": "9876543210",
  "courseInterest": "Computer Science",
  "message": "Interested in course details"
}
```

The request body is illustrative; the backend's validation rules determine which fields are required and accepted.

### Example: Counselor login

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "counselor@example.com",
  "password": "your-password"
}
```

Use the returned authentication token for protected requests. Never use real passwords or tokens in public documentation.

## Frontend and Backend Integration

The frontend communicates with the backend using Axios.

- `src/lib/api.ts` configures the API client and attaches the stored access token to requests.
- `src/lib/auth.ts` handles registration, login, logout, and authentication state.
- `src/lib/enquiries.ts` contains enquiry API functions.
- `src/hooks/useLeads.ts` provides React Query hooks for fetching and claiming leads.
- `src/pages/Dashboard.tsx` provides the main dashboard interface.

After creating or claiming a lead, the frontend refreshes the relevant lead queries so the interface can reflect the latest data.

For local development, configure the backend CORS origin to allow:

```text
http://localhost:5173
```

For production, update the allowed origin to the deployed frontend URL.

## Production Deployment

### Backend — Render

1. Push the backend repository to GitHub.
2. Sign in to [Render](https://render.com/).
3. Select **New + → Web Service**.
4. Connect the backend repository.
5. Configure the repository root directory if the backend is in a subfolder.
6. Set the build command to `npm install`.
7. Set the start command to the actual production script in the backend `package.json`.
8. Configure the production environment variables.
9. Deploy the service and copy its public URL.
10. Verify the health endpoint.

Example health-check URL:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/v1/health
```

The hostname above is a placeholder; use the URL assigned by Render.

### Database — MongoDB Atlas

If using MongoDB Atlas:

1. Create or select a database cluster.
2. Create a database user.
3. Configure network access securely for the deployed application.
4. Copy the database connection string.
5. Add it as a secret environment variable in Render.
6. Confirm that the backend successfully connects to the database.

A database running only on your computer will not automatically be accessible to a deployed backend.

### Frontend — Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Import the frontend GitHub repository.
3. Set the project root directory to `frontend` if both projects are in one repository.
4. Use the Vite build command:

   ```bash
   npm run build
   ```

5. Set the output directory to:

   ```text
   dist
   ```

6. Add the production environment variable:

   ```env
   VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api/v1
   ```

7. Deploy the frontend.
8. Update the backend's `CLIENT_ORIGIN` environment variable with the actual deployed frontend URL.
9. Redeploy or restart the backend if required for the updated environment variable to take effect.

If the frontend uses client-side routing, configure the hosting platform to serve the frontend entry point for application routes.

## Testing

### Backend

From the backend directory:

```bash
npm run
```

Use the available test script shown in `package.json`. If a test script exists, run:

```bash
npm test
```

Check the health endpoint:

```bash
curl http://localhost:5000/api/v1/health
```

### Frontend

From the frontend directory:

```bash
npm run build
```

Verify that the production build completes successfully.

### End-to-end checklist

- [ ] Backend starts successfully.
- [ ] Database connection succeeds.
- [ ] Health endpoint returns a valid response.
- [ ] Counselor registration works.
- [ ] Counselor login works.
- [ ] Protected endpoints reject unauthenticated requests.
- [ ] Public enquiries can be retrieved.
- [ ] New enquiries can be created.
- [ ] Available enquiries can be claimed.
- [ ] Claimed enquiries appear in the counselor's list.
- [ ] The deployed frontend communicates with the deployed backend.
- [ ] CORS and production environment variables are configured correctly.

## Security Notes

- Store secrets in environment variables, not source code.
- Keep `.env` files out of version control.
- Use HTTPS in production.
- Use a strong production JWT secret.
- Restrict database network access appropriately.
- Validate request bodies and protect authenticated routes.
- Avoid publishing real user information, passwords, tokens, or database connection strings in the README.

## License

Add the appropriate license and attribution information for your project before public distribution.
