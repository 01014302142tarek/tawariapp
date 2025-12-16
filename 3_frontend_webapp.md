# Frontend Web Application

**Project:** TawariApp Medical Telemedicine Platform  
**Document Type:** Frontend Architecture  
**Last Updated:** December 11, 2025  
**Framework:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS

---

## Architecture Overview

### Single Unified Web Application

TawariApp is a single Next.js web application that serves all user roles with responsive design for all devices.

```
┌────────────────────────────────────────────────────────┐
│              TawariApp Web Application                 │
├────────────────────────────────────────────────────────┤
│  Public Pages    │ Patient Area │ Doctor Area │ Admin  │
│  (Landing, etc.) │ /patient/*   │ /doctor/*   │ /admin │
├────────────────────────────────────────────────────────┤
│             Shared Components & Design System          │
├────────────────────────────────────────────────────────┤
│               Responsive Design (RTL)                  │
│          Desktop │ Tablet │ Mobile                     │
└────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Framework
- **Next.js 14+**: App Router, Server Components, API Routes
- **TypeScript**: Type safety throughout
- **React 18+**: Latest React features

### Styling & UI
- **Tailwind CSS**: Utility-first CSS with RTL support
- **Arabic Fonts**: Cairo, Noto Sans Arabic
- **Headless UI**: Accessible component primitives

### State & Data
- **React Query**: Server state management
- **Zustand**: Client state management
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### Integrations
- **Firebase SDK**: Phone authentication
- **Supabase JS**: Database client
- **Jitsi Meet SDK**: Video consultations

---

## Project Structure

```
tawariapp/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── register/doctor/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Auth layout (centered)
│   │
│   ├── (public)/                 # Public layout group
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── doctors/
│   │   │   ├── page.tsx          # Doctor list
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Doctor profile
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Public layout (header/footer)
│   │
│   ├── (patient)/                # Patient dashboard group
│   │   ├── patient/
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── doctors/
│   │   │   │   └── page.tsx      # Find doctors
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx      # My appointments
│   │   │   ├── consultation/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Video call
│   │   │   ├── prescriptions/
│   │   │   │   └── page.tsx      # My prescriptions
│   │   │   ├── payments/
│   │   │   │   └── page.tsx      # Payment history
│   │   │   └── profile/
│   │   │       └── page.tsx      # Edit profile
│   │   └── layout.tsx            # Patient layout (sidebar)
│   │
│   ├── (doctor)/                 # Doctor dashboard group
│   │   ├── doctor/
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── availability/
│   │   │   │   └── page.tsx      # Manage schedule
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx      # Patient list
│   │   │   ├── consultation/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Video call + notes
│   │   │   ├── prescriptions/
│   │   │   │   └── page.tsx      # Create/history
│   │   │   ├── earnings/
│   │   │   │   └── page.tsx      # Revenue
│   │   │   └── profile/
│   │   │       └── page.tsx      # Doctor profile
│   │   └── layout.tsx            # Doctor layout (sidebar)
│   │
│   ├── (admin)/                  # Admin dashboard group
│   │   ├── admin/
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── doctors/
│   │   │   │   ├── page.tsx      # All doctors
│   │   │   │   └── pending/
│   │   │   │       └── page.tsx  # Verification queue
│   │   │   ├── patients/
│   │   │   │   └── page.tsx      # All patients
│   │   │   └── transactions/
│   │   │       └── page.tsx      # Payment monitoring
│   │   └── layout.tsx            # Admin layout (sidebar)
│   │
│   ├── api/                      # API Routes
│   │   └── ...
│   │
│   ├── layout.tsx                # Root layout (RTL, fonts)
│   ├── not-found.tsx             # 404 page
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   └── ...
│   │
│   ├── forms/                    # Form components
│   │   ├── PhoneInput.tsx
│   │   ├── OTPInput.tsx
│   │   ├── DatePicker.tsx
│   │   ├── FileUpload.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── ...
│   │
│   ├── doctor/                   # Doctor-specific components
│   │   ├── DoctorCard.tsx
│   │   ├── DoctorProfile.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   └── ...
│   │
│   ├── consultation/             # Consultation components
│   │   ├── JitsiMeet.tsx
│   │   ├── WaitingRoom.tsx
│   │   ├── ConsultationNotes.tsx
│   │   └── ...
│   │
│   └── prescription/             # Prescription components
│       ├── PrescriptionForm.tsx
│       ├── PrescriptionCard.tsx
│       └── ...
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── firebase/
│   │   ├── config.ts             # Firebase config
│   │   └── auth.ts               # Auth helpers
│   ├── payments/
│   │   └── paymob.ts             # Paymob integration
│   └── utils/
│       ├── formatters.ts         # Date, currency formatters
│       └── validators.ts         # Validation helpers
│
├── hooks/
│   ├── useAuth.ts                # Authentication hook
│   ├── useUser.ts                # Current user hook
│   ├── useDoctors.ts             # Doctor queries
│   ├── useConsultations.ts       # Consultation queries
│   └── ...
│
├── types/
│   ├── index.ts                  # Shared types
│   └── database.ts               # Supabase generated types
│
├── public/
│   ├── locales/
│   │   └── ar/                   # Arabic translations
│   └── images/
│
└── middleware.ts                 # Route protection
```

---

## Design System

### Colors

```css
:root {
  /* Primary - Medical Blue */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  /* Success - Green */
  --success-500: #22c55e;
  
  /* Error - Red */
  --error-500: #ef4444;
  
  /* Warning - Amber */
  --warning-500: #f59e0b;
  
  /* Gray */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #111827;
}
```

### Typography

```css
/* Arabic Fonts */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');

body {
  font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
}
```

### RTL Configuration

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-cairo">{children}</body>
    </html>
  );
}
```

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'Noto Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'), // RTL utilities
  ],
};
```

---

## Core Components

### Button Component

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  loading,
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors',
        // Variants
        variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700',
        variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        // Sizes
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
      )}
      disabled={loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

### Phone Input (Egyptian)

```tsx
// components/forms/PhoneInput.tsx
export function PhoneInput({ value, onChange, error }) {
  return (
    <div className="flex gap-2" dir="ltr">
      <div className="flex items-center px-3 bg-gray-100 rounded-lg">
        <span className="text-gray-600">+20</span>
      </div>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        placeholder="10xxxxxxxx"
        maxLength={10}
        className={cn(
          'flex-1 px-4 py-2 border rounded-lg',
          error && 'border-error-500'
        )}
      />
    </div>
  );
}
```

### Doctor Card

```tsx
// components/doctor/DoctorCard.tsx
interface DoctorCardProps {
  doctor: Doctor;
  onBook?: () => void;
}

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border">
      <div className="flex gap-4">
        <Avatar src={doctor.avatar_url} size="lg" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{doctor.name_ar}</h3>
          <p className="text-gray-600">{doctor.specialty}</p>
          <div className="flex items-center gap-2 mt-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{doctor.rating_avg.toFixed(1)}</span>
            <span className="text-gray-400">({doctor.rating_count})</span>
          </div>
        </div>
        <div className="text-left">
          <p className="font-semibold text-primary-600">
            {formatCurrency(doctor.consultation_fee)}
          </p>
          {doctor.is_online && (
            <Badge variant="success">متاح الآن</Badge>
          )}
        </div>
      </div>
      {onBook && (
        <Button onClick={onBook} className="w-full mt-4">
          حجز استشارة
        </Button>
      )}
    </div>
  );
}
```

---

## Page Layouts

### Public Layout

```tsx
// app/(public)/layout.tsx
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### Dashboard Layout (Patient/Doctor/Admin)

```tsx
// app/(patient)/layout.tsx
export default function PatientLayout({ children }) {
  return (
    <ProtectedRoute role="patient">
      <div className="min-h-screen flex">
        <Sidebar role="patient" />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 bg-gray-50">
            {children}
          </main>
        </div>
        <MobileNav role="patient" /> {/* Shown on mobile */}
      </div>
    </ProtectedRoute>
  );
}
```

---

## Authentication Flow

### Login Page

```tsx
// app/(auth)/login/page.tsx
'use client';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  
  const handleSendOTP = async () => {
    // Firebase phone auth
    await sendOTP(`+20${phone}`);
    setStep('otp');
  };
  
  const handleVerifyOTP = async (otp: string) => {
    const result = await verifyOTP(otp);
    if (result.user) {
      // Check user role and redirect
      router.push(getDashboardRoute(result.user.role));
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-8">
        تسجيل الدخول
      </h1>
      
      {step === 'phone' ? (
        <PhoneStep phone={phone} setPhone={setPhone} onSubmit={handleSendOTP} />
      ) : (
        <OTPStep phone={phone} onVerify={handleVerifyOTP} />
      )}
    </div>
  );
}
```

---

## Video Consultation

### Jitsi Meet Integration

```tsx
// components/consultation/JitsiMeet.tsx
'use client';

import { JitsiMeeting } from '@jitsi/react-sdk';

interface JitsiMeetProps {
  roomId: string;
  userName: string;
  onEnd: () => void;
}

export function JitsiMeetComponent({ roomId, userName, onEnd }: JitsiMeetProps) {
  return (
    <JitsiMeeting
      domain="meet.jit.si"
      roomName={roomId}
      configOverwrite={{
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
      }}
      interfaceConfigOverwrite={{
        SHOW_JITSI_WATERMARK: false,
        DEFAULT_BACKGROUND: '#1a1a2e',
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'chat', 
          'hangup', 'fullscreen'
        ],
      }}
      userInfo={{
        displayName: userName,
      }}
      onApiReady={(api) => {
        api.on('videoConferenceLeft', onEnd);
      }}
      getIFrameRef={(node) => {
        node.style.height = '100%';
        node.style.width = '100%';
      }}
    />
  );
}
```

---

## Responsive Design

### Breakpoints

```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
    },
  },
};
```

### Mobile Navigation

```tsx
// components/layout/MobileNav.tsx
export function MobileNav({ role }) {
  const items = getNavItems(role);
  
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t md:hidden">
      <div className="flex justify-around py-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center p-2',
              isActive && 'text-primary-600'
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

---

## Performance Optimization

### Image Optimization

```tsx
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={doctor.avatar_url}
  alt={doctor.name_ar}
  width={80}
  height={80}
  className="rounded-full"
/>
```

### Code Splitting

```tsx
// Lazy load heavy components
const JitsiMeet = dynamic(
  () => import('@/components/consultation/JitsiMeet'),
  { ssr: false, loading: () => <Spinner /> }
);
```

### Caching

```tsx
// Use React Query for data caching
const { data: doctors, isLoading } = useQuery({
  queryKey: ['doctors', filters],
  queryFn: () => fetchDoctors(filters),
  staleTime: 1000 * 60 * 5, // 5 minutes
});
```

---

## Accessibility

### ARIA Labels (Arabic)

```tsx
<button
  aria-label="إغلاق النافذة"
  onClick={onClose}
>
  <X className="w-6 h-6" />
</button>
```

### Touch Targets

```css
/* Minimum 44x44px touch targets */
.btn, .link, .card {
  min-height: 44px;
  min-width: 44px;
}
```

### Keyboard Navigation

```tsx
// Focus management
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);
```

---

*This frontend architecture provides a modern, accessible, and performant web application specifically designed for the Egyptian healthcare market with full Arabic support.*
