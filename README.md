# Internship LMS (RBAC & TDD)

A full-stack Learning Management System built with **Node.js, TypeScript, and React**, featuring strict Role-Based Access Control (RBAC) and sequential course progression logic. This project was developed using a strict **Test-Driven Development (TDD)** methodology.

🔴 **Live Frontend:** https://tdd-kata-three.vercel.app  
⚙️ **Live Backend:** https://lms-backend-3zv7.onrender.com  

> **Note:** The backend is hosted on Render's free tier. Please allow **30–60 seconds** for the server to wake up on the first request.

---

## 🔑 Test Credentials

To verify the RBAC features, use these pre-configured accounts:

| Role | Email | Password | Permissions |
|----|----|----|----|
| **Admin** | admin@lms.com | admin123 | View all users & course associations, delete users, onboard new mentors |
| **Mentor** | mentor@seed.com | password123 | Create & delete courses, manage chapters, enroll students |
| **Student** | student@seed.com | password123 | View assigned courses, watch videos, earn certificates |

---

## 🚀 Key Features

- **Strict TDD:** Built using the **Red-Green-Refactor** cycle. 100% of the core business logic is covered by automated tests.
- **Role-Based Access Control (RBAC):** Middleware ensures strict separation of concerns.
  - *Admins* have global oversight but cannot modify course content directly.
  - *Mentors* own their specific courses and cannot touch others'.
- **Advanced Admin Dashboard:**
  - **User Management:** Admins can view all users and see exactly which courses they are enrolled in (Students) or teaching (Mentors).
  - **Onboarding:** Instant "Add Mentor" modal allows Admins to create and auto-approve new instructors.
  - **Moderation:** Ability to delete any user account or course.
- **Sequential Locking Logic:** Backend enforcement ensures Chapter 2 cannot be completed until Chapter 1 is marked done.
- **Dynamic PDF Certificates:** Generates a personalized PDF certificate on-the-fly using `pdfkit` only when course progress equals 100%.
- **Secure Authentication:** Stateless JWT authentication with Bcrypt password hashing.

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js & Express
- **Language:** TypeScript (Strict Mode)
- **Database:** Supabase (PostgreSQL)
- **Testing:** Jest & Supertest
- **Validation:** Zod schemas
- **PDF Generation:** PDFKit

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS & Lucide React (Icons)
- **State Management:** React Context API
- **Deployment:** Vercel

---

## 🧪 AI Usage Declaration

*Per the project requirements, I declare the use of AI tools during development.*

### Tools Used
- Google Gemini
- ChatGPT

### How AI Was Used
1. **Boilerplate & Configuration:** Used to generate initial `tsconfig.json`, `jest.config.js`, and Tailwind setup to save setup time.
2. **Mock Data:** Generated the `seed.ts` script logic to quickly populate the database with dummy courses and chapters for testing.
3. **Refactoring & UI Components:** Assisted in building the Admin Dashboard UI components (Tables, Modals) and debugging the backend logic for joining user data with course enrollments.
4. **Deployment Debugging:** Assisted in resolving CORS issues between Vercel and Render.
5. **Logical Help for functions** Assisted in providing the logical workflow of different fucntions and helped in their debugging.
6. **Setting up Readme.**Assisted in structuring the Readme file.

### What Was NOT AI-Generated
- **Core TDD Process:** The test suites (`auth.test.ts`, `progress.test.ts`) were written manually *before* the implementation code to ensure strict adherence to the TDD Kata.
- **Business Rules:** The specific logic for sequential chapter locking and RBAC middleware permissions was manually architected.

---

## ⚙️ Local Setup Instructions

### 1. Backend Setup
```bash
cd lms-backend
npm install
npm run dev
```

### 2.  Frontend Setup
```bash
cd lms-frontend
npm install
# The frontend defaults to http://localhost:5000 for API calls
npm run dev
```
### 3. Running Tests

To verify the Test-Driven Development (TDD) implementation and ensure all business rules behave correctly:
```bash
cd lms-backend
npm test -- --runInBand
```