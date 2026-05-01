# Team Task Manager (Full-Stack)

A modern, full-stack task management application with role-based access control, premium UI, and a dedicated backend API. Built to track projects, assign tasks, and view dynamic dashboard statistics.

## Features

- **Authentication:** Secure Login & Signup with JWT.
- **Role-Based Access (RBAC):**
  - **Admin:** Can create/delete projects, manage all tasks, and reassign tasks.
  - **Member:** Can view assigned tasks, update task statuses (Todo, In Progress, Done).
- **Projects & Tasks:** Full CRUD functionality for task management within specific projects.
- **Dynamic Dashboard:** Real-time statistics including total projects, personal task counts, and overdue warnings.
- **Premium UI:** Custom Vanilla CSS featuring glassmorphism, dynamic animations, and responsive layouts.

## Tech Stack

### Backend (`/backend`)
- Node.js, Express.js
- PostgreSQL (via Prisma ORM)
- JSON Web Tokens (JWT), bcrypt

### Frontend (`/frontend`)
- React (Vite)
- React Router DOM
- Axios
- Vanilla CSS

---

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### 1. Backend Setup
```bash
cd backend
npm install
```
Configure your environment variables in `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager?schema=public"
JWT_SECRET="your-super-secret-key"
PORT=5000
```
Run Prisma migrations and start the server:
```bash
npx prisma migrate dev --name init
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Deployment Instructions (Railway)

Railway allows you to easily deploy this full-stack application.

1. **Push to GitHub**:
   Ensure both `frontend` and `backend` are pushed to your GitHub repository.

2. **Create a Railway Project**:
   - Go to [Railway.app](https://railway.app/).
   - Click "New Project" -> "Deploy from GitHub repo".
   - Select your repository.

3. **Provision PostgreSQL Database**:
   - In your Railway project, click "New" -> "Database" -> "Add PostgreSQL".
   - This will automatically provision a Postgres database.

4. **Deploy Backend**:
   - Go to the Backend service settings on Railway.
   - Under **Root Directory**, set it to `/backend`.
   - Under **Variables**, add:
     - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (Railway handles this reference automatically).
     - `JWT_SECRET`: Any secure random string.
     - `PORT`: `5000`
   - Under **Deploy**, set the Build Command to `npm run build` and the Start Command to `npm run start`.
   - Railway will automatically run Prisma generate and typescript build. (Ensure you add a release command `npx prisma migrate deploy` in the Railway UI under Settings -> Deploy -> Release Command).
   - Generate a Domain for the backend.

5. **Deploy Frontend**:
   - Create a new service in the same project: "Deploy from GitHub repo".
   - Select the same repository.
   - Under **Root Directory**, set it to `/frontend`.
   - Under **Variables**, add `VITE_API_URL` pointing to your deployed backend URL. *(Note: You may need to update the axios base URLs in the React code to use `import.meta.env.VITE_API_URL || 'http://localhost:5000'`)*.
   - Generate a Domain for the frontend.

You are now live!
