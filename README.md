# Internship LMS (RBAC & TDD)

A full-stack Learning Management System built with **Node.js, TypeScript, and React**, featuring strict Role-Based Access Control (RBAC) and sequential course progression logic. This project was developed using a strict **Test-Driven Development (TDD)** methodology.

🔴 **Live Frontend:** [https://tdd-kata-three.vercel.app](https://tdd-kata-three.vercel.app)  
⚙️ **Live Backend:** [https://lms-backend-3zv7.onrender.com](https://lms-backend-3zv7.onrender.com)

> **Note:** The backend is hosted on Render's free tier. Please allow **30-60 seconds** for the server to wake up on the first request.

---

## 🔑 Test Credentials

To verify the RBAC features, use these pre-configured accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lms.com` | `admin123` | Approve mentors, view user database, create users. |
| **Mentor** | `mentor@seed.com` | `password123` | Create courses, add chapters, enroll students. |
| **Student** | `student@seed.com` | `password123` | View assigned courses, watch videos, earn certificates. |

---

## 🚀 Key Features

* **Strict TDD:** Built using the **Red-Green-Refactor** cycle. 100% of the core business logic is covered by automated tests.
* **Role-Based Access Control (RBAC):** Custom middleware ensures Students cannot access Admin routes, and Mentors cannot modify other Mentors' courses.
* **Sequential Locking Logic:** Backend enforcement ensures Chapter 2 cannot be completed until Chapter 1 is marked done.
* **Dynamic PDF Certificates:** Generates a personalized PDF certificate on-the-fly using `pdfkit` only when course progress equals 100%.
* **Secure Authentication:** Stateless JWT authentication with Bcrypt password hashing.

## 🛠 Tech Stack

**Backend:**
* **Runtime:** Node.js & Express
* **Language:** TypeScript (Strict Mode)
* **Database:** Supabase (PostgreSQL)
* **Testing:** Jest & Supertest
* **Validation:** Zod schemas
* **PDF Generation:** PDFKit

**Frontend:**
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS
* **State Management:** React Context API
* **Deployment:** Vercel

---

## 🧪 AI Usage Declaration

*Per the project requirements, I declare the use of AI tools during development.*

**Tools Used:**
* Google Gemini / ChatGPT

**How AI Was Used:**
1.  **Boilerplate & Configuration:** Used to generate initial `tsconfig.json`, `jest.config.js`, and Tailwind setup to save setup time.
2.  **Mock Data:** Generated the `seed.ts` script logic to quickly populate the database with dummy courses and chapters for testing.
3.  **Deployment Debugging:** Assisted in resolving CORS issues between Vercel and Render by suggesting the correct wildcard configurations for the final build.

**What Was NOT AI-Generated:**
* **Core Business Logic:** The sequential chapter validation (`progress.controller.ts`) and certificate generation logic were written manually.
* **Test Cases:** The TDD test suites (`auth.test.ts`, `progress.test.ts`) were written manually *before* the implementation code to ensure strict adherence to the TDD Kata.

---

## ⚙️ Local Setup Instructions

If you wish to run this locally instead of using the live link:

### 1. Backend Setup
```bash
cd lms-backend
npm install

# Create a .env file with your Supabase credentials
# DATABASE_URL=...
# JWT_SECRET=...

npm run dev