# Vanodhan Herbs — Website Authentication Architecture & Development Guide (`AuthDevelopment.md`)

This master documentation provides an exhaustive guide to the customer authentication architecture of **Vanodhan Herbs**, detailing the **Dual-Linking Identity Verification Engine**, **Supabase & Twilio configurations**, **Zero-Trust Server Security Model**, and complete code-level workflows.

---

## 📑 Table of Contents
1. [Architecture & Security Principles](#1-architecture--security-principles)
2. [Supabase & External Provider Configurations](#2-supabase--external-provider-configurations)
   - [A. Phone Provider & Twilio Setup](#a-phone-provider--twilio-setup)
   - [B. Google OAuth Setup](#b-google-oauth-setup)
   - [C. Enabling Manual Account Linking](#c-enabling-manual-account-linking)
3. [Frontend Application Architecture](#3-frontend-application-architecture)
   - [A. AuthProvider Context (`src/providers/AuthProvider.jsx`)](#a-authprovider-context)
   - [B. Pending Verification Modal (`src/components/PendingVerificationModal.jsx`)](#b-pending-verification-modal)
   - [C. Primary Auth Page (`src/app/auth/page.jsx`)](#c-primary-auth-page)
   - [D. Auth Callback Handler (`src/app/auth/callback/page.jsx`)](#d-auth-callback-handler)
4. [Backend API Layer & Zero-Trust Verification](#4-backend-api-layer--zero-trust-verification)
   - [A. Profile Status & Auto Metadata Sync (`/api/user/profile-status`)](#a-profile-status--auto-metadata-sync)
   - [B. Protected Order Creation (`/api/place-order`)](#b-protected-order-creation)
   - [C. Protected Payment Initiation (`/api/phonepe/create-payment`)](#c-protected-payment-initiation)
5. [Complete Data Flow & Sequence Diagrams](#5-complete-data-flow--sequence-diagrams)
6. [Troubleshooting & Known Gotchas Guide](#6-troubleshooting--known-gotchas-guide)

---

## 1. Architecture & Security Principles

The **Vanodhan Herbs** customer authentication system is designed around three core principles:

1. **Dual Identity Requirement**: Every customer account must possess both a **verified Indian mobile phone number (+91)** for order SMS updates/delivery coordination and a **linked Google OAuth identity** for profile metadata (Full Name, Email, Avatar Photo).
2. **Zero-Trust Server-Side Model**: Never trust client-side React state, `localStorage`, `sessionStorage`, or cookies for security decisions. Every sensitive action (order creation, coupon validation, payment link generation) validates access tokens server-side directly against the canonical database using `supabaseAdmin.auth.getUser(token)`.
3. **Seamless Guest-to-Customer Transition**: Guest shopping carts stored in `localStorage` automatically merge into the user's database `cart_items` table upon login without losing any selected products.

---

## 2. Supabase & External Provider Configurations

### A. Phone Provider & Twilio Setup

Supabase acts as the orchestration engine, calling Twilio Programmable SMS API under the hood.

#### 1. Supabase Dashboard Settings
- Navigate to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Phone**.
- Set **Enable Phone Provider** to **ON**.
- Select **Twilio** from the *SMS Provider* dropdown.
- **Credentials Required**:
  - **Twilio Account SID**: Copied from Twilio Console Dashboard.
  - **Twilio Auth Token**: Copied from Twilio Console Dashboard.
  - **Twilio Message Service SID or Phone Number**: Must be your Twilio Phone Number (e.g. `+18331234567`) or a Messaging Service SID starting with `MG...`.
  - ⚠️ *Critical Gotcha*: **Do NOT enter a Twilio Verify Service SID (`VA...`)** into this field, as Twilio Programmable SMS will reject requests with Error 21212 ("Invalid From Number").

#### 2. Twilio Console Settings (For +91 Indian Numbers)
- **Verified Caller IDs**: Since Twilio accounts operate in Trial mode during development, all destination numbers must be added under **Twilio Console** $\rightarrow$ **Phone Numbers** $\rightarrow$ **Verified Caller IDs**.
- **Geo-permissions**: Navigate to **Messaging** $\rightarrow$ **Settings** $\rightarrow$ **Geo-permissions** and check **India (+91)** to permit outbound SMS delivery to Indian numbers.

---

### B. Google OAuth Setup

1. **Google Cloud Console**:
   - Create an OAuth 2.0 Client ID (Web Application type).
   - Set **Authorized Redirect URIs** to:
     `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
2. **Supabase Dashboard**:
   - Navigate to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Google**.
   - Enable Google Provider.
   - Enter **Client ID** and **Client Secret** obtained from Google Cloud Console.

---

### C. Enabling Manual Account Linking

By default, Supabase disables attaching secondary OAuth providers to an existing user session.

- Go to **Supabase Dashboard** $\rightarrow$ **Authentication** $\rightarrow$ **Settings** (or **Providers** / **Security**).
- Toggle **Allow Manual Linking** to **ON** (Green).
- *Without this setting enabled, calling `supabase.auth.linkIdentity({ provider: 'google' })` will fail with "Manual linking is disabled".*

---

## 3. Frontend Application Architecture

### A. AuthProvider Context (`src/providers/AuthProvider.jsx`)
Encapsulates global authentication state, session listeners, and identity linking helper methods:

```jsx
// Key Exposed Values & Methods:
const {
    user,                       // Canonical Supabase user object
    authLoading,                 // Boolean tracking initial session resolution
    isLoggedIn,                 // Derived boolean (!!user)
    profileStatus,              // { isComplete, hasPhone, hasGoogle, isChecked }
    showVerificationModal,      // Control state for verification modal
    sendPhoneOtp,               // Executing supabase.auth.updateUser({ phone })
    verifyPhoneOtp,             // Executing supabase.auth.verifyOtp({ type: 'phone_change' })
    linkGoogleAccount,          // Executing supabase.auth.linkIdentity({ provider: 'google' })
    logout,                     // Executing supabase.auth.signOut()
} = useAuth();
```

- **Route-Aware Mandatory Enforcement**: Automatically detects if `pathname === "/checkout"`. On `/checkout`, `isMandatory` is passed as `true` to `PendingVerificationModal`, disabling the close/dismiss button until verification completes.

---

### B. Pending Verification Modal (`src/components/PendingVerificationModal.jsx`)

A glassmorphism modal component displaying pending credential verification:

- **Phone Verification View (Google User missing Phone)**:
  1. Input for 10-digit mobile number (`+91`).
  2. Button calling `sendPhoneOtp` $\rightarrow$ sends SMS OTP via Twilio.
  3. 6-digit OTP input calling `verifyPhoneOtp` $\rightarrow$ verifies code and updates user phone.
- **Google Account Link View (Phone User missing Google)**:
  1. Prompts user with "Connect Google Account" button.
  2. Calls `linkGoogleAccount` $\rightarrow$ redirects to Google OAuth consent page.

---

### C. Primary Auth Page (`src/app/auth/page.jsx`)

- Handles both Google OAuth login and direct Mobile SMS OTP login for unauthenticated guest users.
- **Dynamic Origin**: Calculates `window.location.origin` dynamically to form redirect URLs:
  ```javascript
  const origin = window.location.origin;
  const callbackUrl = `${origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`;
  ```

---

### D. Auth Callback Handler (`src/app/auth/callback/page.jsx`)

Handles redirect returns after Google OAuth identity linking:

1. Retrieves active session via `supabase.auth.getSession()`.
2. Sends token to backend GET `/api/user/profile-status` (which performs server-side metadata synchronization).
3. Calls `await supabase.auth.refreshSession()` to update local React memory.
4. Performs `window.location.href = redirectTarget;` (full page reload) so all headers, navigation elements, and profile photos update instantly across the site.

---

## 4. Backend API Layer & Zero-Trust Verification

### A. Profile Status & Auto Metadata Sync (`/api/user/profile-status/route.js`)

**Endpoint**: `GET /api/user/profile-status` (Requires `Authorization: Bearer <access_token>`)

```javascript
// Server-side identity metadata sync logic:
const googleIdentity = user.identities?.find((id) => id.provider === "google");

if (googleIdentity?.identity_data) {
    const gData = googleIdentity.identity_data;
    const currentMeta = user.user_metadata || {};
    const updatePayload = {};
    let needsUpdate = false;

    if (!user.email && gData.email) {
        updatePayload.email = gData.email;
        updatePayload.email_confirm = true;
        needsUpdate = true;
    }

    const updatedMeta = { ...currentMeta };
    if (!currentMeta.full_name && (gData.full_name || gData.name)) {
        updatedMeta.full_name = gData.full_name || gData.name;
        needsUpdate = true;
    }
    if (!currentMeta.avatar_url && (gData.avatar_url || gData.picture)) {
        updatedMeta.avatar_url = gData.avatar_url || gData.picture;
        needsUpdate = true;
    }

    if (needsUpdate) {
        updatePayload.user_metadata = updatedMeta;
        await supabaseAdmin.auth.admin.updateUserById(user.id, updatePayload);
    }
}
```

*This solves the issue where phone users linking Google would retain blank names/emails in the database row.*

---

### B. Protected Order Creation (`/api/place-order/route.js`)

Before validating cart items or inserting order rows, the endpoint validates dual-identity status:

```javascript
const hasPhone = Boolean(user.phone && String(user.phone).trim().length >= 10);
const hasGoogle = Boolean(
    user.identities?.some((id) => id.provider === "google") ||
    user.app_metadata?.providers?.includes("google") ||
    (user.app_metadata?.provider === "google" && user.email)
);

if (!hasPhone || !hasGoogle) {
    return NextResponse.json(
        {
            success: false,
            code: "PROFILE_INCOMPLETE",
            message: "Mandatory profile completion required before checkout. Both Google account and verified phone number must be linked.",
            hasPhone,
            hasGoogle,
        },
        { status: 403 }
    );
}
```

---

### C. Protected Payment Initiation (`/api/phonepe/create-payment/route.js`)

Enforces the exact same zero-trust check prior to initiating payment payloads with PhonePe gateway.

---

## 5. Complete Data Flow & Sequence Diagrams

### Mobile User Linking Google Account

```
User (Phone Auth)            Client (Next.js)             Supabase Auth            Google OAuth            Server API (/api/...)
       │                            │                           │                        │                        │
       │─── Click "Connect Google" ─►│                           │                        │                        │
       │                            │─── linkIdentity() ───────►│                        │                        │
       │                            │                           │─── Redirect to OAuth ─►│                        │
       │                            │◄──────────────────────────┴────────────────────────┤ (User Consents)        │
       │                            │ (Redirects to /auth/callback)                                               │
       │                            │                                                                             │
       │                            │─── GET /api/user/profile-status (Bearer Token) ───────────────────────────►│
       │                            │                                                                             │─── Copies Google Name, Email,
       │                            │                                                                             │    Avatar to User DB row
       │                            │◄── { isComplete: true } ───────────────────────────────────────────────────│
       │                            │                                                                             │
       │                            │─── supabase.auth.refreshSession() ─────────────────────────────────────────►│
       │                            │─── window.location.href reload ─────────────────────────────────────────────│
       │◄── Profile Complete ───────│                                                                             │
```

---

## 6. Troubleshooting & Known Gotchas Guide

| Symptom / Error | Root Cause | Solution |
| :--- | :--- | :--- |
| `Unsupported phone provider` | **Enable Phone Provider** toggle is OFF in Supabase Dashboard. | Go to Supabase $\rightarrow$ Auth $\rightarrow$ Providers $\rightarrow$ Phone $\rightarrow$ Turn toggle ON & save. |
| `Twilio Error 21212: Invalid From Number (caller ID): VA...` | Verify Service SID (`VA...`) entered in Supabase instead of Phone Number/Messaging SID. | Replace `VA...` in Supabase Twilio settings with your actual **Twilio Phone Number** (`+1...`) or Messaging SID (`MG...`). |
| `Manual linking is disabled` | **Allow Manual Linking** toggle is OFF in Supabase Security settings. | Go to Supabase $\rightarrow$ Auth $\rightarrow$ Settings $\rightarrow$ Turn **Allow Manual Linking** to ON. |
| SMS OTP Not Arriving on Phone | Test phone number not added to Twilio Trial Verified Caller IDs or Geo-permissions disabled. | Add phone number to Twilio Console Verified Caller IDs and enable India (+91) under Geo-permissions. |
| User Name shows "Vanodhan Customer" after Google Link | Local session cache held old un-synced user object. | Handled automatically by `/api/user/profile-status` auto-sync and `refreshSession()` on `/auth/callback`. |
