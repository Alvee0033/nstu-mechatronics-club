# NSTU Mechatronics Club Website

A modern, full-stack website for NSTU Mechatronics Club featuring stunning UI effects, gradient themes, and smooth animations.

## 🚀 Features

- **Modern UI/UX**: Beautiful gradient themes with purple, pink, and blue color schemes
- **Smooth Animations**: Framer Motion powered animations and transitions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component-Based Architecture**: Modular and reusable components
- **Full-Stack Solution**: Next.js frontend with Express backend

## 📁 Project Structure

```
nstumc/
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js app directory (pages)
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── members/           # Members page
│   │   │   ├── events/            # Events page
│   │   │   ├── projects/          # Projects page
│   │   │   └── achievements/      # Achievements page
│   │   ├── components/   # Reusable components
│   │   │   ├── ui/               # UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   └── GradientCard.tsx
│   │   │   └── layout/           # Layout components
│   │   │       ├── Navbar.tsx
│   │   │       └── Footer.tsx
│   │   └── lib/          # Utility functions
│   └── package.json
│
└── backend/              # Express backend API
    ├── src/
    │   ├── index.ts      # Main server file
    │   └── routes/       # API routes
    │       ├── members.ts
    │       ├── events.ts
    │       ├── projects.ts
    │       └── achievements.ts
    └── package.json
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (React 18+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Middleware**: CORS, dotenv

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm installed
- Git (optional)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend API will run on `http://localhost:5000`

## 🚀 Running the Application

### Development Mode

**Terminal 1 (Frontend):**
```bash
cd frontend
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
npm run dev
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

## 📄 Pages

1. **Landing Page** (`/`)
   - Hero section with animated gradients
   - Features showcase
   - Statistics display
   - Smooth scroll animations

2. **Members** (`/members`)
   - Team member cards with hover effects
   - Social media links
   - Role and department information

3. **Events** (`/events`)
   - Upcoming and past events
   - Event details with date and location
   - Registration buttons

4. **Projects** (`/projects`)
   - Project showcase grid
   - Technology tags
   - GitHub links
   - Category filters

5. **Achievements** (`/achievements`)
   - Timeline-style achievement display
   - Award categories
   - Statistics section

## 🎨 UI Components

### GradientCard
Reusable card component with gradient backgrounds and hover effects.

### Button
Customizable button with multiple variants (primary, secondary, outline).

### Navbar
Responsive navigation with mobile menu support.

### Footer
Footer with quick links and social media icons.

## 🔌 API Endpoints

- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/:id` - Get achievement by ID

## 🎯 Key Features

- ✨ Stunning gradient animations
- 🎨 Modern purple/pink/blue theme
- 📱 Fully responsive design
- ⚡ Fast page transitions
- 🎭 Smooth hover effects
- 🌙 Dark theme optimized
- 🔄 Component-based architecture
- 📊 Clean and organized code structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is created for NSTU Mechatronics Club.

## 👥 Team

Created with ❤️ by NSTU Mechatronics Club members

---

**Happy Coding! 🚀**
