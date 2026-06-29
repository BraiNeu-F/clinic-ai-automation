# AI Automation Clinic — Implementation Plan

## Summary

Build a functional clinic management dashboard prototype with Next.js + Supabase + Tailwind CSS. The dashboard manages **Patients**, **Nurses & Doctors (Staff)**, and **Schedules** with full CRUD via REST API. The database schema is designed to also support 7 future AI automation features (patient registration, booking management, payment tracking, admin notifications, daily summaries, pending actions, management reports). The system uses simulated/dummy data for demonstration.

---

## Current State

- **Project**: Empty directory at `d:\LAB-32\ai-automation-clinic`
- **Available MCP tools**: Supabase (DB + Auth), Stripe (payments), LLM config (OpenAI/Anthropic), Deploy to Vercel
- **No existing code, config, or database**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui components |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Deployment | Vercel |
| AI (Phase 2) | LLM via OpenAI/Anthropic (TBD by user) |

---

## Proposed Changes

### 1. Initialize Next.js Project

**File**: `package.json`, `tsconfig.json`, `tailwind.config.ts`, etc.

Scaffold a new Next.js 14 project with TypeScript + Tailwind CSS + shadcn/ui. Configure Supabase client.

### 2. Database Schema (Supabase Migration)

**Files**: `supabase/migrations/001_initial_schema.sql`

Tables designed to support both the dashboard (Phase 1) and AI automation (Phase 2):

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `patients` | Patient records | id, name, email, phone, dob, gender, address, medical_history, created_at |
| `staff` | Nurses & Doctors | id, name, email, phone, role (doctor/nurse), specialization, license_number |
| `schedules` | Appointment slots | id, staff_id (FK), patient_id (FK nullable), date, start_time, end_time, status, type |
| `bookings` | Patient bookings | id, patient_id (FK), schedule_id (FK), status, reason, created_at |
| `payments` | Invoices/payments | id, booking_id (FK), patient_id (FK), amount, status, payment_method, invoice_number |
| `notifications` | Admin notifications | id, recipient_type, recipient_id, type, title, message, is_read |
| `automation_logs` | AI action audit trail | id, type, input_data (JSONB), output_data (JSONB), status |

### 3. Supabase Client Setup

**File**: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`

Browser and server-side Supabase clients using `@supabase/ssr`.

### 4. REST API Routes

**Directory**: `src/app/api/`

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/patients` | GET, POST | List all / Create patient |
| `/api/patients/[id]` | GET, PUT, DELETE | Single patient CRUD |
| `/api/staff` | GET, POST | List all / Create staff |
| `/api/staff/[id]` | GET, PUT, DELETE | Single staff CRUD |
| `/api/schedules` | GET, POST | List all / Create schedule |
| `/api/schedules/[id]` | GET, PUT, DELETE | Single schedule CRUD |

### 5. Dashboard Pages

**Directory**: `src/app/dashboard/`

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | `page.tsx` | Overview — stats cards (total patients, staff, today's appointments), recent activity |
| `/dashboard/patients` | `page.tsx` | Patient table with search, filter, add/edit/delete |
| `/dashboard/staff` | `page.tsx` | Staff table (Nurses & Doctors) with search, filter, add/edit/delete |
| `/dashboard/schedules` | `page.tsx` | Schedule calendar/table view, filter by date/staff, add/edit/delete |

Shared layout: `src/app/dashboard/layout.tsx` with sidebar navigation.

### 6. UI Components

Use shadcn/ui for consistent, production-grade components:
- `Table` — data tables with sorting
- `Dialog` — add/edit forms (patient, staff, schedule)
- `Card` — stats cards on overview
- `Button`, `Input`, `Select`, `Badge`, `Avatar`
- `Sheet` or sidebar for navigation

### 7. Seed / Dummy Data

**File**: `supabase/seed.sql`

Insert ~20 patients, ~10 staff (mix of doctors and nurses), ~50 schedule slots spanning 2 weeks, ~15 bookings, ~10 payments.

### 8. Deployment Configuration

**File**: `vercel.json` (if needed)

Project will be deployed to Vercel via `deploy_to_remote` MCP tool after implementation.

---

## Route & File Map

```
d:\LAB-32\ai-automation-clinic\
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql       # Full DB schema
│   └── seed.sql                          # Dummy data
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page → redirect to /dashboard
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                # Dashboard sidebar layout
│   │   │   ├── page.tsx                  # Overview dashboard
│   │   │   ├── patients/
│   │   │   │   └── page.tsx              # Patient management
│   │   │   ├── staff/
│   │   │   │   └── page.tsx              # Nurse & Doctor management
│   │   │   └── schedules/
│   │   │       └── page.tsx              # Schedule management
│   │   └── api/
│   │       ├── patients/
│   │       │   ├── route.ts              # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts           # GET, PUT, DELETE
│   │       ├── staff/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       └── schedules/
│   │           ├── route.ts
│   │           └── [id]/
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx               # Sidebar navigation
│   │   │   ├── stats-cards.tsx           # Overview stats
│   │   │   ├── patient-table.tsx         # Patient data table
│   │   │   ├── patient-form.tsx          # Add/edit patient dialog
│   │   │   ├── staff-table.tsx           # Staff data table
│   │   │   ├── staff-form.tsx            # Add/edit staff dialog
│   │   │   ├── schedule-table.tsx        # Schedule data table
│   │   │   └── schedule-form.tsx         # Add/edit schedule dialog
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts                 # Browser Supabase client
│       │   └── server.ts                 # Server Supabase client
│       └── utils.ts                      # Shared helpers
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Database Schema Detail

### `patients`
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male','female','other')),
  address TEXT,
  medical_history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `staff`
```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('doctor','nurse')),
  specialization TEXT,
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `schedules`
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','booked','completed','cancelled')),
  type TEXT DEFAULT 'consultation' CHECK (type IN ('consultation','follow_up','procedure')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Supporting Tables (for Phase 2 AI features)
`bookings`, `payments`, `notifications`, `automation_logs` — full schema included in migration but dashboard UI not in Phase 1 scope.

---

## Assumptions & Decisions

1. **Prototype with simulated data** — per user's choice. All data is dummy, no real patient information.
2. **LLM provider deferred** — user will configure later. Database and API are designed to feed AI features.
3. **Auth is minimal** — simple Supabase Auth for admin login to the dashboard. No patient-facing auth needed for Phase 1.
4. **shadcn/ui for components** — gives production-quality look with minimal effort.
5. **No real Stripe payments in Phase 1** — payments table exists but no payment UI yet.

---

## Verification Steps

1. Run `npm run dev` — dashboard loads at `http://localhost:3000/dashboard`
2. Login with Supabase Auth works
3. Patient CRUD — create, view, edit, delete a patient via UI
4. Staff CRUD — create, view, edit, delete a doctor/nurse via UI
5. Schedule CRUD — create, view, edit, delete a schedule slot via UI
6. API endpoints return correct JSON for all CRUD operations
7. Dummy data is seeded and visible in the dashboard
8. Supabase tables are created and populated
