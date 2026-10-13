# CRM Lead Management API

A RESTful backend for managing student enquiries and counselor lead assignments, built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- Employee registration and login
- Secure password hashing with bcrypt
- JWT-protected endpoints
- Public enquiry submission without authentication
- Authenticated listing of unclaimed enquiries
- Atomic lead claiming to prevent duplicate assignments
- Counselor-specific private lead listings
- Request validation and centralized error handling
- Pagination for lead listings
- Automated integration tests

## Technology Stack

- Node.js
- Express
- MongoDB and Mongoose
- JSON Web Tokens
- bcryptjs
- Zod
- Helmet, CORS, and express-rate-limit
- Node.js test runner and Supertest

## Prerequisites

- A supported Node.js LTS release
- npm
- A MongoDB Atlas cluster or local MongoDB instance
- Git

## Installation

```bash
git clone <your-repository-url>
cd crm-lead-management-api
npm install
```

Create a `.env` file in the project root:

```dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-long-random-secret>
JWT_EXPIRES_IN=1h
CLIENT_ORIGIN=http://localhost:3000
TEST_MONGODB_URI=<your-dedicated-test-database-uri>
```

Never commit `.env` or share database credentials.

## Run the application

Development:

```bash
npm run dev
```

Production-style local startup:

```bash
npm start
```

Health check:

```text
GET http://localhost:5000/api/v1/health
```

## API Endpoints

| Method | Endpoint | Authentication |
|---|---|---|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | Bearer token |
| POST | `/api/v1/enquiries` | Public |
| GET | `/api/v1/enquiries/public` | Bearer token |
| PATCH | `/api/v1/enquiries/:id/claim` | Bearer token |
| GET | `/api/v1/enquiries/mine` | Bearer token |
| GET | `/api/v1/health` | Public |

## Authentication

After login, send the JWT in the request header:

```text
Authorization: Bearer <your-jwt>
```

## Submit an enquiry

```bash
curl -X POST http://localhost:5000/api/v1/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "courseInterest": "Full Stack Development"
  }'
```

## Claim a lead

```bash
curl -X PATCH \
  http://localhost:5000/api/v1/enquiries/<enquiry-id>/claim \
  -H "Authorization: Bearer <your-jwt>"
```

Only one counselor can successfully claim a given enquiry. A subsequent claim attempt returns a conflict response.

## List enquiries

Unclaimed enquiries:

```text
GET /api/v1/enquiries/public?page=1&limit=20
```

Enquiries claimed by the authenticated counselor:

```text
GET /api/v1/enquiries/mine?page=1&limit=20
```

## Testing

Configure `TEST_MONGODB_URI` to use a dedicated test database, then run:

```bash
npm test
```

The test suite covers authentication, public enquiry creation, ownership validation, concurrent claims, and counselor-specific visibility.

## Business Rules

1. Anyone can submit an enquiry.
2. Only authenticated counselors can browse the shared lead pool.
3. A lead can be claimed by only one counselor.
4. Claimed leads are excluded from the shared pool.
5. Counselors can access only their own claimed leads through the private listing endpoint.
6. Ownership is assigned by the server, never by public form input.

## Security Considerations

- Passwords are hashed before storage.
- JWTs have a configured expiration.
- Protected routes verify the token and employee record.
- Request data is validated.
- Rate limiting and security headers are enabled.
- Sensitive configuration is stored in environment variables.

## Future Improvements

- OpenAPI/Swagger documentation
- Structured application logging
- Cursor-based pagination for large datasets
- Automated CI checks
- Email verification and password recovery
- Lead activity history and administrative reassignment

## License

Specify the license appropriate for your submission.
