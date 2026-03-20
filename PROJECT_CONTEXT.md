# Car Service Admin Dashboard - Project Context

## 📋 PROJECT OVERVIEW

**Car Service Admin** is a modern, full-featured admin panel for car service businesses to manage their operations efficiently. It's a Next.js 16 web application designed to help automotive service businesses track bookings, manage customers, view statistics, and onboard new business accounts with a clean, responsive interface.

**Primary Purpose**: Enable car service business owners and managers to efficiently manage daily operations through a web-based dashboard.

---

## ✨ KEY FEATURES

### Dashboard & Analytics
- **Dashboard Home**: Overview with service metrics and quick statistics
- **Booking Management**: Complete booking system with multiple viewing modes
- **Help Center**: Support and documentation hub for users

### Booking Management System
The application provides multiple ways to view and manage bookings:
- **Table View**: Spreadsheet-style view of all bookings with detailed columns
- **List View**: Compact card-based list with status grouping
- **Kanban View**: Visual board organized by booking status
- **Search Functionality**: Real-time search for clients
- **Filtering**: Filter by alphabetical order or booking status
- **Sorting**: Sort by price or time (ascending/descending)
- **Data Export**: Export booking data for reporting
- **Statistics Toggle**: Show/hide booking analytics and metrics

### Authentication System
- Email & password sign-in
- Business registration with full validation
- Form validation using Zod schema validation library

### 7-Step Business Onboarding Wizard
New businesses follow a guided multi-step flow:
1. Create Account
2. Business Overview
3. Build Profile
4. Bank Details
5. Tax Information
6. Two Factor Authentication
7. Review & Submit

Includes progress tracking throughout the entire flow.

### Internationalization (i18n)
- **English (en)**: Default language with LTR (left-to-right) layout
- **Arabic (ar)**: Full RTL (right-to-left) support and translations
- Locale-aware routing: `/en/` prefix for English, `/ar/` for Arabic
- Language switcher component for user convenience

---

## 🛠 TECH STACK

### Core Framework & Libraries
- **Next.js 16**: Full-stack React framework with App Router
- **React 19**: Modern React with latest features
- **TypeScript 5**: Type-safe JavaScript
- **Tailwind CSS v4**: Utility-first CSS framework
- **CSS Modules**: Component-scoped styling alongside Tailwind

### UI & Component Libraries
- **MUI (Material-UI) for Next.js**: Pre-built Material Design components
- **Lucide React**: Modern SVG icon library
- **React Icons**: Additional icon collection

### Form Validation & Data
- **Zod v4**: TypeScript-first schema validation (form validation, data parsing)

### Internationalization
- **next-intl**: I18n library for multi-language support with locale routing

### Specialized Features
- **react-international-phone**: International phone number input with country codes
- **Three.js**: 3D graphics library (for potential 3D visualizations)
- **Leaflet + react-leaflet**: Map library for location picking

### Development Tools
- **ESLint**: Code linting and quality checks
- **Node.js >= 18**: Runtime requirement

---

## 📁 PROJECT STRUCTURE

```
car-service-admin/
│
├── public/
│   └── assets/                          # Static files (SVGs, images, logos)
│
└── src/
    ├── app/
    │   └── [locale]/                    # Dynamic locale routing (en | ar)
    │       ├── (auth)/                  # Authentication route group
    │       │   ├── sign-in/             # Login page
    │       │   ├── sign-up/             # Business registration page
    │       │   └── layout.tsx
    │       │
    │       ├── (dashboard)/             # Protected dashboard route group
    │       │   ├── home/                # Dashboard home page
    │       │   ├── bookings/            # Bookings management page
    │       │   ├── helpCenter/          # Help center page
    │       │   └── layout.tsx           # Shared dashboard layout
    │       │
    │       ├── onboarding/              # Business onboarding flow
    │       │   ├── getting-started/     # Step 1
    │       │   ├── owner-information/   # Step 2
    │       │   ├── business-information/# Step 3
    │       │   ├── build-business/      # Step 4
    │       │   └── layout.tsx           # Onboarding layout
    │       │
    │       └── layout.tsx               # Root layout with locale provider
    │
    ├── presentation/                    # UI Layer (React Components)
    │   └── components/
    │       ├── bookings/                # Booking-specific features
    │       │   ├── TableView/           # Spreadsheet-style booking table
    │       │   ├── ListView/            # Card-based booking list
    │       │   ├── ColumnSelectionBar/  # Column visibility toggle
    │       │   ├── SelectionToolBar/    # Bulk action toolbar
    │       │   ├── StatusHeader/        # Status-based grouping headers
    │       │   ├── StatusComponent/     # Status badge component
    │       │   └── OverlayBookingDetails/ # Detail overlay modal
    │       │
    │       ├── Dashboard/               # Dashboard layout & display
    │       │   ├── DashboardBar/        # Top navigation bar
    │       │   ├── DashboardItem/       # Stat card component
    │       │   └── TableComponents/     # Dashboard table utilities
    │       │
    │       ├── form/                    # Onboarding form components
    │       │   ├── FormTextField/       # Text input field
    │       │   ├── FormSelectField/     # Select dropdown field
    │       │   ├── FormRow/             # Form row container
    │       │   ├── ChoiceCard/          # Choice selection card
    │       │   ├── StepIndicator/       # Progress/step indicator
    │       │   ├── LocationPicker/      # Location picker with map
    │       │   ├── ServicePicker/       # Service selection interface
    │       │   ├── Task/                # Task/checklist component
    │       │   ├── GetStartedButton/    # CTA button for onboarding
    │       │   └── MapView/             # Map integration component
    │       │
    │       ├── common/                  # Shared UI components
    │       │   ├── DropdownButton/      # Reusable dropdown component
    │       │   └── StatusComponent/     # Status badge/indicator
    │       │
    │       ├── CustomAlert/             # Alert/notification components
    │       │   └── ErrorAlert.tsx       # Error message display
    │       │
    │       ├── CustomButton/            # Reusable button component
    │       ├── InputWrapper/            # Input field wrapper
    │       ├── LanguageSwitcher/        # EN/AR language toggle
    │       ├── PasswordInput/           # Password field with visibility toggle
    │       ├── PhoneNumberInput/        # Phone number input with countries
    │       └── AnimatedText/            # Animated text component
    │
    ├── domain/                          # Domain Layer (Business Logic)
    │   ├── entities/
    │   │   └── Booking.ts               # Booking interface/entity
    │   │
    │   └── repositories/
    │       └── BookingsRepository.ts    # Data access abstraction
    │
    ├── application/                     # Application Layer (State & Coordination)
    │   └── context/
    │       └── business-signup.context.tsx  # Business signup state (React Context)
    │
    ├── infrastructure/                  # Infrastructure Layer (External Services)
    │   ├── api/
    │   │   ├── auth.api.ts              # Authentication API calls
    │   │   └── client.ts                # HTTP client configuration
    │   │
    │   └── context/
    │       └── business-signup.context.tsx  # Signup context provider
    │
    ├── i18n/                            # Internationalization Configuration
    │   ├── routing.ts                   # Locale routing configuration
    │   └── request.ts                   # i18n request handler
    │
    └── validation/                      # Form & Data Validation
        ├── schema.ts                    # Zod validation schemas
        └── validation.ts                # Validation helper functions
```

---

## 🗺 ROUTES & PAGES

All routes follow the pattern `/{locale}/...` where locale is either `en` or `ar`.

### Authentication Routes
| Route | Page | Purpose |
|-------|------|---------|
| `/{locale}/sign-in` | Sign In | User login page |
| `/{locale}/sign-up` | Sign Up | Business registration |

### Dashboard Routes (Protected)
| Route | Page | Purpose |
|-------|------|---------|
| `/{locale}/home` | Dashboard Home | Main overview with stats |
| `/{locale}/bookings` | Bookings Management | Full booking CRUD with multiple views |
| `/{locale}/helpCenter` | Help Center | Support documentation & FAQs |

### Onboarding Routes
| Route | Page | Purpose |
|-------|------|---------|
| `/{locale}/onboarding/getting-started` | Getting Started | Step 1 - Account creation |
| `/{locale}/onboarding/owner-information` | Owner Info | Step 2 - Personal details |
| `/{locale}/onboarding/business-information` | Business Info | Step 3 - Business details |
| `/{locale}/onboarding/build-business` | Build Business | Step 4 - Service setup |

---

## 🏗 ARCHITECTURE PATTERN

The project follows **Domain-Driven Design (DDD)** with a 3-layer architecture:

### Layer 1: Domain Layer (`src/domain/`)
- **Responsibility**: Pure business logic and entity interfaces
- **Contents**:
  - `Booking` entity interface (what a booking is)
  - `BookingsRepository` interface (how to access bookings)
- **Characteristics**: Framework-agnostic, pure TypeScript

### Layer 2: Application/Infrastructure Layer (`src/application/`, `src/infrastructure/`)
- **Responsibility**: Coordinate between domain and presentation, handle external systems
- **Contents**:
  - API clients (`auth.api.ts`, `client.ts`)
  - React Context for state management (`business-signup.context.tsx`)
  - HTTP communication
- **Characteristics**: Framework-aware but separated from UI

### Layer 3: Presentation Layer (`src/presentation/`, `src/app/`)
- **Responsibility**: User interface and page logic
- **Contents**:
  - Next.js pages (routes)
  - React components organized by feature
  - CSS Modules for component styling
- **Characteristics**: React/Next.js specific, UI-focused

**Flow**: UI Components → Infrastructure/APIs → Domain Business Logic → Data

---

## 🎨 COMPONENT ORGANIZATION STRATEGY

Components are organized by **feature/domain** rather than by type:

```
bookings/
├── TableView/          ← Feature: Table display
├── ListView/           ← Feature: List display
├── ColumnSelectionBar/ ← Feature: Column management
└── SelectionToolBar/   ← Feature: Bulk actions

form/
├── FormTextField/      ← Form field type
├── FormSelectField/    ← Form field type
├── ServicePicker/      ← Form feature
└── LocationPicker/     ← Form feature

common/
├── DropdownButton/     ← Reusable generic component
└── StatusComponent/    ← Reusable generic component
```

---

## 🔄 KEY WORKFLOWS

### 1. Booking Management Workflow
- User views bookings in Dashboard
- Choose view type: Table, List, or Kanban
- Search/filter/sort bookings
- Select multiple bookings for bulk actions
- Click to see booking details in overlay
- Export data if needed

### 2. Business Onboarding Workflow
1. User clicks "Get Started" button
2. Guided through 7-step wizard (progress tracked)
3. Each step collects specific information:
   - Account credentials
   - Owner details
   - Business information
   - Services offered
   - Tax & bank info
   - 2FA setup
4. Review and submit
5. Redirect to dashboard

### 3. Authentication Workflow
1. User visits sign-in or sign-up
2. Fill form with validation
3. Submit to auth API
4. On success: redirect to dashboard (with business onboarding if new user)
5. On failure: show error alert

---

## 📊 DATA STRUCTURES

### Booking Entity (Interface)
Located in: `src/domain/entities/Booking.ts`
Represents a single car service booking with properties like:
- ID, customer info, service type
- Status (pending, confirmed, completed, etc.)
- Date/time, price
- Notes/description

### State Management
- **React Context**: `business-signup.context.tsx` manages onboarding form state
- **Local State**: Component-level state with `useState`
- **No Redux/Zustand**: Simple Context API is sufficient for current complexity

---

## 🌐 INTERNATIONALIZATION (i18n) DETAILS

### Supported Languages
- **English (en)**: LTR layout, all pages in English
- **Arabic (ar)**: RTL layout, all pages in Arabic

### How i18n Works
1. **URL-based routing**: `/en/bookings` vs `/ar/bookings`
2. **Language switcher**: Component allows switching between languages
3. **Automatic direction**: Tailwind respects RTL automatically
4. **Translations**: Managed by `next-intl` library

### Adding New Languages
1. Add locale code to routing config (`i18n/routing.ts`)
2. Create translation files for the new locale
3. Update `LanguageSwitcher` component
4. Test routing and RTL support

---

## 🔧 DEVELOPMENT NOTES

### Form Validation
- **Library**: Zod (TypeScript-first schema validation)
- **Schemas**: Defined in `src/validation/schema.ts`
- **Usage**: Validate sign-up, sign-in, onboarding forms
- **Benefits**: Type-safe, runtime validation, clear error messages

### CSS Styling Strategy
- **Tailwind CSS**: Primary styling for responsive design
- **CSS Modules**: Component-scoped styles (avoid conflicts)
- **BEM Convention**: Used in CSS modules for class naming
- **MUI Components**: Pre-styled Material Design elements

### Phone Number Handling
- **Component**: `PhoneNumberInput` wrapper
- **Library**: `react-international-phone`
- **Features**: Country code selection, format validation

### Map Integration
- **Libraries**: Leaflet + react-leaflet
- **Use Case**: Location picker for business address
- **Features**: Searchable map, marker placement

### 3D Graphics (Future)
- **Library**: Three.js
- **Potential Uses**: 3D service animations, interactive visualizations

---

## 🚀 GETTING STARTED COMMANDS

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Run linter
npm run lint
```

---

## 📝 CODE STYLE & CONVENTIONS

- **Language**: TypeScript (strict mode enabled)
- **Component Style**: Functional components with hooks
- **Naming**: camelCase for functions/variables, PascalCase for components
- **File Structure**: Co-locate component files (TSX, CSS Modules, tests)
- **Imports**: Organized, relative paths within src/
- **Error Handling**: Custom error alerts and validation feedback

---

## 🎯 COMMON TASKS & WHERE TO FIND THEM

| Task | Location |
|------|----------|
| Add a new booking column | `src/presentation/components/bookings/TableView/` |
| Change form validation | `src/validation/schema.ts` |
| Add authentication logic | `src/infrastructure/api/auth.api.ts` |
| Create new dashboard stat | `src/presentation/components/Dashboard/DashboardItem/` |
| Add translation strings | Managed by `next-intl` (translations folder) |
| Create new booking view | Add to `src/presentation/components/bookings/` |
| Modify onboarding steps | Edit pages in `src/app/[locale]/onboarding/` |
| Fix styling issues | Check component's `.module.css` file |

---

## 🔐 Security Considerations

- Passwords validated via Zod schema
- Authentication via API (backend handles tokens)
- Next.js built-in security headers
- Input validation on all forms
- No sensitive data stored in client state (only context for non-sensitive data)

---

## 📈 SCALABILITY NOTES

**Current State**: Suitable for small to medium businesses
**Potential Improvements**:
- Database integration (currently stateless)
- WebSocket for real-time booking updates
- Image upload for business profiles
- PDF export for bookings
- Email notifications
- SMS alerts

---

**Last Updated**: 2026-03-20
**Framework Versions**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4
