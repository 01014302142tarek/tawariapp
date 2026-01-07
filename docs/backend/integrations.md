# External Service Integrations

**Last Updated:** January 2, 2026

---

## Table of Contents

1. [Supabase (Database + Auth)](#supabase)
2. [Paymob Payments](#paymob-payments)
3. [Jitsi Meet Video](#jitsi-meet-video)
4. [Twilio SMS](#twilio-sms)
5. [Resend Email](#resend-email)

---

## Supabase

### Overview

| Aspect | Details |
|--------|---------|
| **Purpose** | Database, Storage, Authentication, Real-time |
| **Dashboard** | https://supabase.com/dashboard |
| **Auth Method** | Email/Password (Phase 1), Phone OTP (Phase 2) |
| **Region** | EU-West (closest to Egypt) |

### Setup via Vercel Marketplace

1. Go to https://vercel.com/marketplace/supabase
2. Click **Add Integration**
3. Select your Vercel project
4. Environment variables are auto-synced

### Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Configure Client

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

### Email Authentication

```typescript
// lib/supabase/auth.ts
import { createClient } from './client'

// Sign up with email
export async function signUp(email: string, password: string, metadata: { name_ar: string, role: string }) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  return { data, error }
}

// Sign in with email
export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

// Sign out
export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

// Get current user
export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Password reset
export async function resetPassword(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  return { error }
}
```

### Auth Component Example

```typescript
// components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { signIn } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Redirect based on role
    const role = data.user?.user_metadata?.role
    if (role === 'doctor') {
      router.push('/doctor')
    } else if (role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/patient')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="البريد الإلكتروني"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="كلمة المرور"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
      </button>
    </form>
  )
}
```

### Auth Middleware

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}
```

### Storage Configuration

```typescript
// Create storage buckets in Supabase Dashboard:
// - avatars (Public)
// - documents (Private)
// - prescriptions (Private)

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

### Future: Phone Authentication (Phase 2)

When ready to add phone auth:

1. Go to Supabase → Authentication → Providers
2. Enable Phone provider
3. Configure Twilio in Supabase settings
4. Use `supabase.auth.signInWithOtp({ phone })`

---

## Paymob Payments

### Overview

| Aspect | Details |
|--------|---------|
| **Purpose** | Payment processing |
| **Dashboard** | https://accept.paymob.com |
| **Integration** | Hosted payment page (iframe) |

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
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

### Webhook Handler

```typescript
// app/api/webhooks/paymob/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PaymobClient } from '@/lib/payments/paymob'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const signature = request.headers.get('hmac') || ''

  const paymob = new PaymobClient({
    apiKey: process.env.PAYMOB_API_KEY!,
    integrationId: process.env.PAYMOB_INTEGRATION_ID!,
    iframeId: process.env.PAYMOB_IFRAME_ID!,
    hmacSecret: process.env.PAYMOB_HMAC_SECRET!,
  })

  if (!paymob.verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const { obj } = payload
  const supabase = createClient()

  if (obj.success && !obj.pending) {
    await supabase
      .from('payments')
      .update({
        status: 'success',
        gateway_transaction_id: obj.id.toString(),
        paid_at: new Date().toISOString(),
      })
      .eq('gateway_order_id', obj.order.id.toString())

    const { data: payment } = await supabase
      .from('payments')
      .select('consultation_id')
      .eq('gateway_order_id', obj.order.id.toString())
      .single()

    await supabase
      .from('consultations')
      .update({ status: 'scheduled' })
      .eq('id', payment.consultation_id)
  } else if (!obj.success) {
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
| **Domain** | meet.jit.si (free public server) |
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
import { useRef } from 'react'

interface JitsiMeetProps {
  roomId: string
  userName: string
  userRole: 'patient' | 'doctor'
  onEnd: () => void
}

export function JitsiMeetComponent({ roomId, userName, userRole, onEnd }: JitsiMeetProps) {
  const apiRef = useRef<any>(null)

  return (
    <JitsiMeeting
      domain="meet.jit.si"
      roomName={roomId}
      configOverwrite={{
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        defaultLanguage: 'ar',
      }}
      interfaceConfigOverwrite={{
        SHOW_JITSI_WATERMARK: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'chat', 'hangup', 'tileview', 'fullscreen',
        ],
      }}
      userInfo={{ displayName: userName }}
      onApiReady={(externalApi) => {
        apiRef.current = externalApi
        externalApi.on('videoConferenceLeft', onEnd)
      }}
      getIFrameRef={(node) => {
        if (node) {
          node.style.height = '100%'
          node.style.width = '100%'
        }
      }}
    />
  )
}
```

---

## Twilio SMS

### Overview

| Aspect | Details |
|--------|---------|
| **Purpose** | Appointment reminders, notifications |
| **Dashboard** | https://console.twilio.com |

### Install SDK

```bash
npm install twilio
```

### SMS Client

```typescript
// lib/sms/twilio.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMS(to: string, message: string) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })
    return { success: true, sid: result.sid }
  } catch (error) {
    console.error('SMS Error:', error)
    return { success: false, error }
  }
}

// Usage examples
export async function sendAppointmentReminder(phone: string, doctorName: string, time: string) {
  const message = `تذكير: لديك موعد مع ${doctorName} الساعة ${time}. تواري`
  return sendSMS(phone, message)
}

export async function sendBookingConfirmation(phone: string, doctorName: string, date: string) {
  const message = `تم تأكيد حجزك مع ${doctorName} يوم ${date}. تواري`
  return sendSMS(phone, message)
}
```

---

## Resend Email

### Overview

| Aspect | Details |
|--------|---------|
| **Purpose** | Transactional emails |
| **Dashboard** | https://resend.com |
| **Free Tier** | 3,000 emails/month |

### Install SDK

```bash
npm install resend
```

### Email Client

```typescript
// lib/email/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TawariApp <noreply@tawariapp.com>',
      to,
      subject,
      html,
    })

    if (error) throw error
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email Error:', error)
    return { success: false, error }
  }
}

// Usage examples
export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'مرحباً بك في تواري',
    html: `<h1>مرحباً ${name}!</h1><p>شكراً لتسجيلك في تواري.</p>`,
  })
}

export async function sendReceiptEmail(email: string, amount: number, doctorName: string) {
  return sendEmail({
    to: email,
    subject: 'إيصال الدفع - تواري',
    html: `<h1>إيصال الدفع</h1><p>المبلغ: ${amount} جنيه</p><p>الطبيب: ${doctorName}</p>`,
  })
}
```

---

## Environment Variables Summary

```env
# Supabase (auto-synced via Vercel Marketplace)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Paymob
PAYMOB_API_KEY=ZXlK...
PAYMOB_INTEGRATION_ID=123456
PAYMOB_IFRAME_ID=654321
PAYMOB_HMAC_SECRET=abc123...

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Resend
RESEND_API_KEY=re_xxxxxxxx

# Jitsi
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si

# App
NEXT_PUBLIC_APP_URL=https://tawariapp.vercel.app
```
