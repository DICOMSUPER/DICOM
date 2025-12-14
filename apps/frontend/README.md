# DICOM Medical Imaging System - Frontend

A modern, feature-rich web application for medical imaging management built with Next.js 15, React 18, and Cornerstone.js.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Role-Based Interfaces](#role-based-interfaces)

## 🎯 Overview

This frontend application provides a comprehensive user interface for the DICOM Medical Imaging System. It includes role-based dashboards, an advanced DICOM image viewer, patient management, scheduling, and radiology workflow tools.

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **UI Library** | React 18 |
| **State Management** | Redux Toolkit |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI, Lucide Icons |
| **Forms** | React Hook Form + Zod validation |
| **Data Tables** | TanStack Table |
| **Charts** | Recharts |
| **DICOM Viewer** | Cornerstone.js (Core, Tools, DICOM Image Loader) |
| **Real-time** | Socket.IO Client |
| **Rich Text Editor** | React Quill, Slate |
| **PDF Generation** | jsPDF, html2pdf.js |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+ (or yarn/pnpm)
- Backend services running (see [backend README](../backend/README.md))

### Installation

```bash
# Navigate to frontend directory
cd apps/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes (login)
│   ├── (workspace)/       # Protected workspace routes
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── reception/     # Reception staff pages
│   │   ├── physician/     # Physician pages
│   │   ├── imaging-technician/  # Technician pages
│   │   └── radiologist/   # Radiologist pages
│   └── viewer/            # DICOM viewer page
├── components/            # React components
│   ├── admin/             # Admin module components
│   ├── common/            # Shared/reusable components
│   ├── imaging-technician/ # Technician components
│   ├── loginPage/         # Login page components
│   ├── notification/      # Notification components
│   ├── patient/           # Patient management components
│   ├── pdf-generator/     # PDF generation components
│   ├── physician/         # Physician components
│   ├── radiologist/       # Radiologist components
│   ├── reception/         # Reception components
│   ├── schedule/          # Scheduling components
│   ├── ui/                # Base UI components (button, card, etc.)
│   ├── ui-next/           # Extended UI components
│   └── viewer/            # DICOM viewer components
├── contexts/              # React contexts (Auth, Theme, etc.)
├── enums/                 # TypeScript enums
├── hooks/                 # Custom React hooks
├── interfaces/            # TypeScript interfaces & types
├── lib/                   # Utility libraries
├── services/              # API service layer
├── store/                 # Redux store & slices
├── types/                 # Type definitions
└── utils/                 # Utility functions
```

## ✨ Key Features

### 🖼️ DICOM Image Viewer
- Multi-planar reconstruction (MPR) - Axial, Coronal, Sagittal views
- Window/Level adjustment for optimal contrast
- Measurement tools (distance, angle, ROI)
- Annotation capabilities
- Series and study navigation
- Image manipulation (zoom, pan, rotate, flip)

### 👥 User Management
- Role-based access control
- User profiles and authentication
- Department and room assignments

### 📋 Patient Management
- Patient registration and demographics
- Encounter tracking
- Medical history viewing

### 📅 Scheduling
- Imaging appointment scheduling
- Shift management
- Room and resource allocation

### 📝 Radiology Workflow
- Work queue management
- Diagnostic report creation
- Template-based reporting
- Digital signature support

### 🔔 Real-time Notifications
- Socket.IO integration
- Live updates across the application

## ⚙️ Environment Configuration

Create a `.env` file in the frontend root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5006

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_ANALYSIS=false
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run turbo:dev` | Start dev server with Turborepo |
| `npm run turbo:build` | Build with Turborepo |

## 👥 Role-Based Interfaces

The application provides specialized interfaces for different user roles:

### Administrator (`/admin`)
- User management
- Department configuration
- System settings
- Modality and procedure management
- Report template management

### Reception Staff (`/reception`)
- Patient registration
- Appointment scheduling
- Imaging order creation

### Physician (`/physician`)
- Patient imaging orders
- Report viewing
- Diagnostic history

### Imaging Technician (`/imaging-technician`)
- DICOM study management
- Modality work queue
- Study quality control

### Radiologist (`/radiologist`)
- DICOM study viewing
- Diagnostic report creation
- Work queue management
- Template-based reporting

## 🔗 Related Documentation

- [Root Project README](../../README.md) - System overview and architecture
- [Backend README](../backend/README.md) - Backend services documentation
- [API Documentation](http://localhost:5000/api) - Swagger API docs (when backend is running)

---

**Note**: This application requires the backend services to be running. See the backend README for setup instructions.
