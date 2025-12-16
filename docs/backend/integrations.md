# External Service Integrations

**Last Updated:** December 11, 2025

---

## Table of Contents

1. [Supabase](#supabase)
2. [Firebase Authentication](#firebase-authentication)
3. [Paymob Payments](#paymob-payments)
4. [Jitsi Meet Video](#jitsi-meet-video)

---

## Supabase

### Overview

| Aspect | Details |
|--------|---------|
| **Purpose** | Database, Storage, Real-time |
| **Dashboard** | https://supabase.com/dashboard |
| **Region** | Choose closest to Egypt (EU-West) |

### Setup

#### 1. Create Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Initialize in project
supabase init
```

#### 2. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

#### 3. Configure Client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
}
```

#### 4. Generate Types

```bash
# Generate TypeScript types from database
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

### Storage Configuration

```typescript
// Create storage buckets
const buckets = [
  { name: 'avatars', public: true },
  { name: 'documents', public: false },
  { name: 'prescriptions', public: false },
]

// Upload file example
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`doctors/${doctorId}/${filename}`, file, {
    contentType: file.type,
    cacheControl: '3600',
  })
```

### Real-time Subscriptions

```typescript
// Subscribe to consultation status changes
const subscription = supabase
  .channel('consultation-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'consultations',
      filter: `id=eq.${consultationId}`,
    },
    (payload) => {
      console.log('Consultation updated:', payload.new)
    }
  )
  .subscribe()

// Unsubscribe when done
subscription.unsubscribe()
```

---

## Firebase Authentication

### Overview

| Aspect | Details |
|--------|---------|
| **Purpose** | Phone number authentication |
| **Console** | https://console.firebase.google.com |
| **Auth Method** | Phone (SMS OTP) |

### Setup

#### 1. Create Firebase Project

1. Go to Firebase Console
2. Create new project "TawariApp"
3. Enable Phone authentication
4. Add Egypt (+20) to allowed countries

#### 2. Install Dependencies

```bash
npm install firebase firebase-admin
```

#### 3. Configure Client SDK

```typescript
// lib/firebase/config.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
```

#### 4. Configure Admin SDK

```typescript
// lib/firebase/admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const adminAuth = getAuth()
```

### Phone Authentication Flow

```typescript
// components/forms/PhoneAuth.tsx
'use client'

import { useState } from 'react'
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult 
} from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

export function PhoneAuth() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult>()

  // Initialize reCAPTCHA
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved')
        },
      })
    }
  }

  // Send OTP
  const handleSendOTP = async () => {
    setupRecaptcha()
    const phoneNumber = `+20${phone}`
    const appVerifier = (window as any).recaptchaVerifier
    
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      setConfirmationResult(confirmation)
      setStep('otp')
    } catch (error) {
      console.error('Error sending OTP:', error)
    }
  }

  // Verify OTP
  const handleVerifyOTP = async () => {
    try {
      const result = await confirmationResult?.confirm(otp)
      const idToken = await result?.user?.getIdToken()
      
      // Send token to your backend
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken: idToken }),
      })
    } catch (error) {
      console.error('Error verifying OTP:', error)
    }
  }

  return (
    <div>
      <div id="recaptcha-container" />
      {step === 'phone' ? (
        <PhoneInput phone={phone} setPhone={setPhone} onSubmit={handleSendOTP} />
      ) : (
        <OTPInput otp={otp} setOtp={setOtp} onSubmit={handleVerifyOTP} />
      )}
    </div>
  )
}
```

### Verify Token on Backend

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { firebaseToken, name_ar, role } = await request.json()

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(firebaseToken)
    const phone = decodedToken.phone_number

    // Create user in Supabase
    const supabase = createClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        phone,
        firebase_uid: decodedToken.uid,
        name_ar,
        role,
      })
      .select()
      .single()

    if (error) throw error

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(decodedToken.uid, { role })

    return NextResponse.json({ success: true, data: { user } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: 'Authentication failed' } },
      { status: 401 }
    )
  }
}
```

### Set Custom Claims

```typescript
// Set role-based claims
await adminAuth.setCustomUserClaims(uid, {
  role: 'doctor',
  doctorId: 'uuid',
  verified: true,
})
```

---

## Paymob Payments

### Overview

| Aspect | Details |
|--------|---------|
| **Purpose** | Payment processing |
| **Dashboard** | https://accept.paymob.com |
| **Integration** | Hosted payment page (iframe) |

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/tokens` | Get auth token |
| `POST /api/ecommerce/orders` | Create order |
| `POST /api/acceptance/payment_keys` | Get payment key |
| Iframe URL | Display payment form |

### Integration Flow

```typescript
// lib/payments/paymob.ts

interface PaymobConfig {
  apiKey: string
  integrationId: string
  iframeId: string
  hmacSecret: string
}

export class PaymobClient {
  private config: PaymobConfig
  private baseUrl = 'https://accept.paymob.com/api'

  constructor(config: PaymobConfig) {
    this.config = config
  }

  // Step 1: Get auth token
  async getAuthToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/auth/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: this.config.apiKey }),
    })
    const data = await response.json()
    return data.token
  }

  // Step 2: Create order
  async createOrder(authToken: string, amountCents: number, merchantOrderId: string) {
    const response = await fetch(`${this.baseUrl}/ecommerce/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: 'EGP',
        merchant_order_id: merchantOrderId,
        items: [],
      }),
    })
    return response.json()
  }

  // Step 3: Get payment key
  async getPaymentKey(
    authToken: string,
    orderId: number,
    amountCents: number,
    billingData: BillingData
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/acceptance/payment_keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600, // 1 hour
        order_id: orderId,
        billing_data: billingData,
        currency: 'EGP',
        integration_id: this.config.integrationId,
        lock_order_when_paid: true,
      }),
    })
    const data = await response.json()
    return data.token
  }

  // Get iframe URL
  getIframeUrl(paymentKey: string): string {
    return `${this.baseUrl}/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: any, signature: string): boolean {
    const crypto = require('crypto')
    const concatenated = [
      payload.obj.amount_cents,
      payload.obj.created_at,
      payload.obj.currency,
      payload.obj.error_occured,
      payload.obj.has_parent_transaction,
      payload.obj.id,
      payload.obj.integration_id,
      payload.obj.is_3d_secure,
      payload.obj.is_auth,
      payload.obj.is_capture,
      payload.obj.is_refunded,
      payload.obj.is_standalone_payment,
      payload.obj.is_voided,
      payload.obj.order.id,
      payload.obj.owner,
      payload.obj.pending,
      payload.obj.source_data.pan,
      payload.obj.source_data.sub_type,
      payload.obj.source_data.type,
      payload.obj.success,
    ].join('')

    const expectedSignature = crypto
      .createHmac('sha512', this.config.hmacSecret)
      .update(concatenated)
      .digest('hex')

    return expectedSignature === signature
  }
}

interface BillingData {
  apartment: string
  email: string
  floor: string
  first_name: string
  street: string
  building: string
  phone_number: string
  shipping_method: string
  postal_code: string
  city: string
  country: string
  last_name: string
  state: string
}
```

### Payment API Route

```typescript
// app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PaymobClient } from '@/lib/payments/paymob'
import { createClient } from '@/lib/supabase/server'

const paymob = new PaymobClient({
  apiKey: process.env.PAYMOB_API_KEY!,
  integrationId: process.env.PAYMOB_INTEGRATION_ID!,
  iframeId: process.env.PAYMOB_IFRAME_ID!,
  hmacSecret: process.env.PAYMOB_HMAC_SECRET!,
})

export async function POST(request: NextRequest) {
  const { consultationId } = await request.json()
  
  const supabase = createClient()
  
  // Get consultation
  const { data: consultation } = await supabase
    .from('consultations')
    .select('*, doctor:doctors(*), patient:patients(*)')
    .eq('id', consultationId)
    .single()

  // Calculate amounts
  const amount = consultation.consultation_fee
  const vat = amount * 0.14
  const total = amount + vat
  const amountCents = Math.round(total * 100)

  // Create payment
  const { data: payment } = await supabase
    .from('payments')
    .insert({
      consultation_id: consultationId,
      patient_id: consultation.patient_id,
      doctor_id: consultation.doctor_id,
      amount,
      vat,
      total,
      status: 'pending',
    })
    .select()
    .single()

  // Get Paymob auth token
  const authToken = await paymob.getAuthToken()

  // Create order
  const order = await paymob.createOrder(authToken, amountCents, payment.id)

  // Update payment with gateway order ID
  await supabase
    .from('payments')
    .update({ gateway_order_id: order.id.toString() })
    .eq('id', payment.id)

  // Get payment key
  const paymentKey = await paymob.getPaymentKey(
    authToken,
    order.id,
    amountCents,
    {
      first_name: consultation.patient.name_ar.split(' ')[0],
      last_name: consultation.patient.name_ar.split(' ').slice(1).join(' ') || '-',
      email: consultation.patient.email || 'customer@tawariapp.com',
      phone_number: consultation.patient.phone,
      apartment: 'NA',
      floor: 'NA',
      building: 'NA',
      street: 'NA',
      city: 'Cairo',
      country: 'EG',
      state: 'Cairo',
      postal_code: '00000',
      shipping_method: 'NA',
    }
  )

  // Get iframe URL
  const paymentUrl = paymob.getIframeUrl(paymentKey)

  return NextResponse.json({
    success: true,
    data: {
      payment_id: payment.id,
      payment_url: paymentUrl,
    },
  })
}
```

### Webhook Handler

```typescript
// app/api/webhooks/paymob/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PaymobClient } from '@/lib/payments/paymob'
import { createClient } from '@/lib/supabase/server'

const paymob = new PaymobClient({
  apiKey: process.env.PAYMOB_API_KEY!,
  integrationId: process.env.PAYMOB_INTEGRATION_ID!,
  iframeId: process.env.PAYMOB_IFRAME_ID!,
  hmacSecret: process.env.PAYMOB_HMAC_SECRET!,
})

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const signature = request.headers.get('hmac') || ''

  // Verify signature
  if (!paymob.verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const { obj } = payload
  const supabase = createClient()

  if (obj.success && !obj.pending) {
    // Payment successful
    await supabase
      .from('payments')
      .update({
        status: 'success',
        gateway_transaction_id: obj.id.toString(),
        paid_at: new Date().toISOString(),
      })
      .eq('gateway_order_id', obj.order.id.toString())

    // Update consultation status
    const { data: payment } = await supabase
      .from('payments')
      .select('consultation_id')
      .eq('gateway_order_id', obj.order.id.toString())
      .single()

    await supabase
      .from('consultations')
      .update({ status: 'scheduled' })
      .eq('id', payment.consultation_id)

    // TODO: Send confirmation SMS
  } else if (!obj.success) {
    // Payment failed
    await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('gateway_order_id', obj.order.id.toString())
  }

  return NextResponse.json({ received: true })
}
```

---

## Jitsi Meet Video

### Overview

| Aspect | Details |
|--------|---------|
| **Purpose** | Video consultations |
| **Domain** | meet.jit.si (public) or 8x8.vc (JaaS) |
| **Integration** | IFrame API |

### Install SDK

```bash
npm install @jitsi/react-sdk
```

### Video Component

```typescript
// components/consultation/JitsiMeet.tsx
'use client'

import { JitsiMeeting } from '@jitsi/react-sdk'
import { useEffect, useRef } from 'react'

interface JitsiMeetProps {
  roomId: string
  userName: string
  userRole: 'patient' | 'doctor'
  onEnd: () => void
  onError?: (error: Error) => void
}

export function JitsiMeetComponent({
  roomId,
  userName,
  userRole,
  onEnd,
  onError,
}: JitsiMeetProps) {
  const apiRef = useRef<any>(null)

  return (
    <div className="h-full w-full">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomId}
        configOverwrite={{
          // Start settings
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          
          // UI settings
          disableDeepLinking: true,
          hideConferenceSubject: true,
          hideConferenceTimer: false,
          
          // Language
          defaultLanguage: 'ar',
          
          // Disable some features for MVP
          enableClosePage: false,
          disableInviteFunctions: true,
          
          // Moderator options (doctors only)
          ...(userRole === 'doctor' && {
            enableInsecureRoomNameWarning: false,
          }),
        }}
        interfaceConfigOverwrite={{
          // Branding
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          
          // Theme
          DEFAULT_BACKGROUND: '#1a1a2e',
          
          // Toolbar buttons
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'chat',
            'hangup',
            'tileview',
            'fullscreen',
            ...(userRole === 'doctor' ? ['mute-everyone'] : []),
          ],
          
          // Settings menu
          SETTINGS_SECTIONS: ['devices', 'language'],
          
          // Mobile settings
          MOBILE_APP_PROMO: false,
        }}
        userInfo={{
          displayName: userName,
        }}
        onApiReady={(externalApi) => {
          apiRef.current = externalApi
          
          // Listen for end of call
          externalApi.on('videoConferenceLeft', () => {
            onEnd()
          })
          
          // Handle errors
          externalApi.on('errorOccurred', ({ error }: { error: Error }) => {
            onError?.(error)
          })
          
          // For doctors: auto-mute patients on join
          if (userRole === 'doctor') {
            externalApi.on('participantJoined', () => {
              // Could implement auto-mute logic here
            })
          }
        }}
        getIFrameRef={(node) => {
          if (node) {
            node.style.height = '100%'
            node.style.width = '100%'
            node.style.border = 'none'
            node.style.borderRadius = '12px'
          }
        }}
      />
    </div>
  )
}
```

### Consultation Page

```typescript
// app/(patient)/patient/consultation/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { JitsiMeetComponent } from '@/components/consultation/JitsiMeet'
import { WaitingRoom } from '@/components/consultation/WaitingRoom'
import { useConsultation } from '@/hooks/useConsultations'

export default function ConsultationPage({ params }: { params: { id: string } }) {
  const { data: consultation, isLoading } = useConsultation(params.id)
  const [callStarted, setCallStarted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)

  if (isLoading) return <LoadingSpinner />
  
  if (!consultation) return <NotFound />

  // Show waiting room before scheduled time
  if (!callStarted && consultation.status === 'scheduled') {
    return (
      <WaitingRoom
        consultation={consultation}
        onJoin={() => setCallStarted(true)}
      />
    )
  }

  // Show post-call summary
  if (callEnded) {
    return <ConsultationSummary consultation={consultation} />
  }

  return (
    <div className="h-screen">
      <JitsiMeetComponent
        roomId={consultation.jitsi_room_id}
        userName={consultation.patient.name_ar}
        userRole="patient"
        onEnd={() => setCallEnded(true)}
      />
    </div>
  )
}
```

### Generate Room ID

```typescript
// lib/utils/jitsi.ts
import { nanoid } from 'nanoid'

export function generateJitsiRoomId(): string {
  // Format: tawari-{random-id}
  // Use nanoid for URL-safe random string
  return `tawari-${nanoid(12)}`
}

// Example output: "tawari-V1StGXR8_Z5j"
```

---

## Environment Variables Summary

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tawariapp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tawariapp

# Firebase Admin
FIREBASE_PROJECT_ID=tawariapp
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@tawariapp.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Paymob
PAYMOB_API_KEY=ZXlKaGtH...
PAYMOB_INTEGRATION_ID=123456
PAYMOB_IFRAME_ID=654321
PAYMOB_HMAC_SECRET=abc123...

# Jitsi
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si

# App
NEXT_PUBLIC_APP_URL=https://tawariapp.vercel.app
```

---

*This integrations guide provides complete setup and code examples for all external services.*
