# Lumina - Modern E-Learning & Course Authoring Platform

<div align="center">
  <img src="./public/icon.svg" alt="Lumina Logo" width="80" height="80" />
  <p><em>A state-of-the-art e-learning client application with advanced course authoring and interactive learning portals.</em></p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
</div>

---

## 📖 Overview

**Lumina** is a premium, responsive Single Page Application (SPA) built using **Next.js 16 (App Router)** and **React 19**. It serves as the frontend layer for an enterprise-level Learning Management System (LMS), offering features for both student learning journeys and comprehensive instructor course administration.

---

## 🚀 Key Features

### 👨‍🏫 Instructor Authoring Dashboard
* **Dynamic Curriculum Builder**: Premium drag-and-drop compiler allowing instructors to seamlessly reorder sections and lessons or shift them between chapters.
* **Unified Quiz Architect**:
  * Create complex quizzes with local draft staging before pushing to the server.
  * Supports 5 question types: *Single Choice*, *Multiple Choice*, *Short Answer* (fill-in), *Matching Pairs*, and *Ordering Sequences*.
  * Built-in configurations: attempt limits, duration timers, review settings, and question/answer shuffling.
* **HLS Video & Material Uploader**: Custom presigned URL video/article uploader with support for interactive in-video questions and multi-language AI translation tracks.
* **Student Monitoring & Grading**: View learner progress details, check average grades, review essay answers, and grade assignment attachments.

### 🧑‍🎓 Student Interactive Learning Space
* **Immersive Video Player**: Custom HLS-based streaming video player equipped with subtitle tracks, active notes, and video checkpoints/question triggers.
* **Interactive Syllabus Drawer**: Fast-navigating collateral sidebar highlighting completed items, active courses, and locked prerequisites.
* **Community Board**: Q&A discussion panel for real-time course community engagement.
* **Certificate Generator**: Dynamic certificate generation and request pipeline upon completing 100% of the syllabus elements.

### 🎨 Design Systems & UX
* Curated dark/light layout variations, sleek glassmorphism panels, and smooth micro-animations.
* Global, responsive state tables (`@tanstack/react-table`) with multi-field search and pagination.
* Custom, non-intrusive notification banner system powered by Zustand.

---

## 📸 Screenshots

> [!NOTE]
> *Giảng viên hãy cập nhật hình ảnh chụp thực tế vào thư mục `/public/screenshots/` rồi thay thế các đường dẫn bên dưới.*

<div align="center">
  <h3>Student Learning Portal</h3>
  <!-- TODO: Replace with student portal screenshot -->
  <img src="https://via.placeholder.com/800x450.png?text=Lumina+Student+Learning+Space" alt="Student Portal Screenshot" width="80%" />

  <h3>Instructor Curriculum Drag & Drop Editor</h3>
  <!-- TODO: Replace with curriculum builder screenshot -->
  <img src="https://via.placeholder.com/800x450.png?text=Instructor+Curriculum+Builder" alt="Curriculum Builder Screenshot" width="80%" />

  <h3>Quiz Architect & Question Builder</h3>
  <!-- TODO: Replace with quiz builder screenshot -->
  <img src="https://via.placeholder.com/800x450.png?text=Quiz+Architect+Designer" alt="Quiz Builder Screenshot" width="80%" />
</div>

---

## 🛠️ Technology Stack

* **Framework**: Next.js 16.2.4 (App Router)
* **Library**: React 19.2.4
* **Styling**: TailwindCSS v4 & PostCSS
* **State Management**: Zustand v5
* **Data Fetching**: Axios & custom HTTP/API clients
* **Table Grid**: TanStack React Table v8
* **Icons**: Lucide React
* **Build tool / package manager**: npm / pnpm

---

## 📂 Project Structure

```text
my-app/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── app/                # Next.js page routes, layouts, and route handlers
│   │   ├── (auth)/         # Login, registration, credentials validation
│   │   ├── instructor/     # Instructor dashboard pages (courses, reviews, certificates)
│   │   ├── learning/       # Immersive student course player routes
│   │   └── page.tsx        # Application homepage
│   ├── components/         # Reusable React components
│   │   ├── ui/             # Core UI atoms (Button, Input, Checkbox)
│   │   ├── instructor/     # Instructor curriculum builders, analytics & tables
│   │   └── learning/       # Learning player modules & discussions
│   ├── lib/                # Utility helpers (format, PKCE auth, config)
│   ├── services/           # Data services layer
│   │   ├── api/            # Low-level API wrappers generated from Swagger
│   │   └── actions/        # Server/Client actions matching backend calls
│   ├── stores/             # Zustand global state stores (Toast, User Profile)
│   └── types/              # Auto-generated and custom TypeScript types
```

---

## ⚙️ Installation & Development

### 1. Prerequisites
Ensure you have Node.js (v18.x or higher) installed.

### 2. Clone the repository
```bash
git clone <your-repository-url>
cd FE/my-app
```

### 3. Install dependencies
Using **npm**:
```bash
npm install
```
Using **pnpm**:
```bash
pnpm install
```

### 4. Environment Configuration
Create a `.env.local` or edit `.env` in the root directory:
```env
NEXT_PUBLIC_API_URL=https://api.shiny.id.vn
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
```

### 5. Start the Development Server
```bash
npm run dev
# or
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
To build the application for deployment:
```bash
npm run build
# or
pnpm build
```

---

## 🤝 Contribution Guidelines

1. **Clean Code**: Adhere to ESLint configurations and TypeScript guidelines.
2. **Styles**: Utilize TailwindCSS v4 utility classes and CSS variables. Keep UI components generic and accessible.
3. **API Integrity**: Do not manually modify files inside `src/types/` or api endpoints; regenerate them from the OpenAPI swagger spec using the following command:
```bash
npm run swagger-generate
```

---

<div align="center">
  <p>© 2026 Lumina E-Learning. All rights reserved.</p>
</div>
