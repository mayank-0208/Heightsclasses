# Coaching ERP - Postman Collections

All collections are in the **heightsclasses** workspace.

## Environment

Select **Coaching ERP - Local** environment (top-right in Postman).

| Variable | Purpose |
|----------|---------|
| `baseUrl` | `http://localhost:5001/api/v1` |
| `accessToken` | Auto-set after login |
| `teacherId` | Auto-set after creating teacher |
| `batchId` | Auto-set after creating batch |
| `studentId` | Auto-set after creating student |
| `testId` | Auto-set after creating test |

## Collections (run in this order)

| # | Collection | Endpoints |
|---|------------|-----------|
| 01 | Health | Health check |
| 02 | Authentication | Login, users, password |
| 04 | Batches | Create batch (needs teacherId) |
| 03 | Students | Create student (needs batchId) |
| 05 | Attendance | Mark/view attendance |
| 06 | Tests | Create tests |
| 07 | Results | Enter marks |
| 08 | Notes | Upload notes (needs Cloudinary) |
| 09 | Fees | Fee & payments |
| 10 | Announcements | Notices |
| 11 | Dashboard | Admin/Teacher/Student dashboards |
| 12 | Reports & Audit | Export reports, audit logs |

## Quick start

1. Start backend: `npm run dev` (port 5001)
2. Open **02 - Authentication** → run **Login (Admin)**
3. Token saves automatically to environment
4. Run **Create User (Teacher)** → saves `teacherId`
5. Open **04 - Batches** → run **Create Batch**
6. Open **03 - Students** → run **Create Student**
7. Test other modules

## Notes

- Login requests auto-save `accessToken` via test scripts
- Create requests auto-save IDs (`teacherId`, `batchId`, etc.)
- **Upload Note** uses form-data — pick a file manually
- Protected collections use Bearer auth with `{{accessToken}}`
