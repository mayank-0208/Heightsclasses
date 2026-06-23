# Coaching ERP Management System - Backend

Production-grade REST API for coaching institute management.

## Tech Stack

- Node.js + Express.js + TypeScript
- MongoDB Atlas + Mongoose
- JWT (access + refresh tokens)
- bcrypt, Cloudinary, Winston, Helmet, Rate Limiting

## Features

- **Authentication**: Admin/Teacher/Student login, JWT, password reset, change password
- **RBAC**: Role-based access control (admin, teacher, student)
- **Students**: Admin-only student creation with profile and fee setup
- **Batches**: Batch management with assigned teachers
- **Attendance**: Mark/update attendance, bulk marking, analytics, reports
- **Tests & Results**: Test creation, marks entry, auto rank/percentage calculation
- **Notes**: File upload to Cloudinary (PDF, DOCX, PPTX, PNG, JPG)
- **Fees**: Fee tracking, payment history, defaulter reports
- **Announcements**: Batch-targeted announcements with read tracking
- **Dashboard**: Role-specific analytics for admin, teacher, student
- **Audit Logs**: Track user actions with IP address
- **Reports**: Export attendance, results, fees as JSON/CSV/Excel

## Project Structure

```
backend/
├── src/
│   ├── config/          # Environment, database, Cloudinary
│   ├── middleware/      # Auth, validation, upload, error handling
│   ├── modules/         # Feature modules (controller/service/repository)
│   ├── routes/          # API route aggregator
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # Logger, errors, pagination helpers
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── .env.example
└── package.json
```

## Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Fill in your MongoDB URI, JWT secrets, and Cloudinary credentials.

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## API Base URL

```
http://localhost:5000/api/v1
```

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/login` | Public | Login |
| POST | `/auth/refresh-token` | Public | Refresh access token |
| POST | `/auth/forgot-password` | Public | Request password reset |
| POST | `/auth/reset-password` | Public | Reset password |
| POST | `/auth/logout` | Auth | Logout |
| GET | `/auth/profile` | Auth | Get profile |
| POST | `/auth/change-password` | Auth | Change password |
| POST | `/auth/users` | Admin | Create user (teacher) |
| GET | `/auth/users` | Admin | List users |
| PATCH | `/auth/users/:id` | Admin | Update user |
| DELETE | `/auth/users/:id` | Admin | Deactivate user |

### Students
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/students` | Admin | Create student |
| GET | `/students` | Admin, Teacher | List students |
| GET | `/students/:id` | All roles | Get student |
| PATCH | `/students/:id` | Admin | Update student |
| GET | `/students/batch/:batchId` | Admin, Teacher | Students by batch |

### Batches
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/batches` | Admin | Create batch |
| GET | `/batches` | All roles | List batches |
| GET | `/batches/my-batches` | Teacher | Teacher's batches |
| GET | `/batches/:id` | All roles | Get batch |
| PATCH | `/batches/:id` | Admin | Update batch |

### Attendance
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/attendance` | Admin, Teacher | Mark attendance |
| POST | `/attendance/bulk` | Admin, Teacher | Bulk mark |
| PATCH | `/attendance/:id` | Admin, Teacher | Update |
| GET | `/attendance/student/:studentId` | All roles | Student attendance |
| GET | `/attendance/report` | Admin, Teacher | Report |
| GET | `/attendance/analytics` | All roles | Analytics |

### Tests & Results
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/tests` | Admin, Teacher | Create test |
| GET | `/tests` | All roles | List tests |
| POST | `/results` | Admin, Teacher | Enter marks |
| POST | `/results/bulk` | Admin, Teacher | Bulk enter marks |
| GET | `/results/test/:testId` | All roles | Test results |
| GET | `/results/student/:studentId` | All roles | Student results |

### Notes, Fees, Announcements, Dashboard, Reports
See module route files for full endpoint list.

## Response Format

**Success:**
```json
{ "success": true, "data": {} }
```

**Error:**
```json
{ "success": false, "message": "Error message" }
```

## Default Admin

On first startup, if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env`, an admin account is created automatically.

## Deployment

- **Backend**: Railway or Render
- **Database**: MongoDB Atlas
- Set all environment variables from `.env.example`

## Security

- Helmet security headers
- Rate limiting
- JWT authentication with refresh tokens
- bcrypt password hashing (12 rounds)
- Input validation with Zod
- File upload validation (type, size, extension)
- MongoDB injection protection via Mongoose
- Role-based access control on all protected routes
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
