# IIMST Portal (iimst.co.in)

Portal for **Infinity Institute of Management Science & Technology** with:
- **Public website** — Orange-themed landing, about, contact, and applications hub
- **Student portal** — Login, ID card, semester-wise results, subject-wise exams (with min passing marks)
- **Admin panel** — Manage students, subjects, results, and exam links

## Tech stack

- **Backend:** .NET Web API, **MongoDB**, JWT auth
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, TypeScript

## Quick start

### MongoDB (Docker)

Run MongoDB in a container:

```bash
docker-compose up -d
```

MongoDB will be available at `localhost:27017`. The API uses database `iimst` and the credentials in `docker-compose.yml` (root/example) — see `appsettings.json` → `MongoDb:ConnectionString`.

**You must start MongoDB before running the API.** If you see a timeout or "connection refused" when running the API, start MongoDB first: from the project root run `docker-compose up -d`.

### Backend

```bash
cd backend/Iimst.Api
dotnet restore
dotnet run
```

API runs at **http://localhost:5000** (Swagger at http://localhost:5000/swagger).

**Credentials:**
- **Admin:** User ID = `admin`, Password = `admin@123`
- **Student:** User ID = **Enrollment number**, Password = **Enrollment number** (same; enrollment number is unique). Students can change their password after first login.

**If you get error MSB3027** (file locked / could not copy ... Iimst.Api.exe): the API process is still running. Stop it first, or run:
```bash
taskkill /IM Iimst.Api.exe /F
```
Then run `dotnet build` or `dotnet run` again.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Site runs at **http://localhost:3000**.

Copy `frontend/.env.example` to `frontend/.env` and set `NEXT_PUBLIC_API_URL` if the API is on a different host (default: `http://localhost:5000/api`). Backend CORS allows `http://localhost:3000` by default.

## Structure

- `docker-compose.yml` — MongoDB service (port 27017)
- `backend/Iimst.Api` — .NET API (Auth, Students, Users, Subjects, Results, SubjectExams, ExamAttempts, Enquiries); MongoDB
- `frontend` — Next.js app
  - `/` — Public home, about, contact; applications hub (Student Portal, Admin)
  - `/login` — Login (Admin → /admin, Student → /student)
  - `/change-password` — Change password (admin and students, after login)
  - `/student` — Student dashboard, ID card, results, exams (submit marks)
  - `/admin` — Admin dashboard, students, subjects, results, exam links
- `frontend/public/iimst_logo.jpg` — IIMST logo (referenced in app as `/iimst_logo.jpg`)

## Features

- **Admin:** Add students (one form: enrollment no, name, program, etc.; login is created with enrollment no as user ID and initial password), edit/delete students; manage subjects, semester results; set per-subject exam link and min passing marks. Change password from sidebar.
- **Student:** Login with enrollment number (password = enrollment number initially); view ID card, semester-wise results; open exam link and submit marks; pass/fail based on min marks. Change password from header.

Logo and orange theme used across the user-facing site and portals.
