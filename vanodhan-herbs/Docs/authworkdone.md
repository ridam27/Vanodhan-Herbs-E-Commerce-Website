# Vanodhan Herbs — Customer Website Authentication Log

This document tracks all implementation steps, file changes, and architectural enhancements made for the **Dual-Linking Identity Verification (Google OAuth ↔ Phone OTP)** and **Zero-Trust Server-Side Security Engine**.

---

## 📋 Change Log & Audit Trail

| Timestamp (IST) | Target File | Action Type | Summary of Changes |
| :--- | :--- | :--- | :--- |
| `2026-08-31 12:27` | [`Docs/authworkdone.md`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/Docs/authworkdone.md) | `[NEW]` | Created tracking log for authentication system updates. |
| `2026-08-31 12:28` | [`src/app/api/user/profile-status/route.js`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/api/user/profile-status/route.js) | `[NEW]` | Server-side GET endpoint validating canonical user JWT token & returning `isComplete`, `hasPhone`, `hasGoogle`. |
| `2026-08-31 12:28` | [`src/app/api/place-order/route.js`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/api/place-order/route.js) | `[MODIFY]` | Enforced zero-trust server-side validation requiring both verified phone and Google identity prior to order creation (HTTP 403 `PROFILE_INCOMPLETE`). |
| `2026-08-31 12:28` | [`src/app/api/phonepe/create-payment/route.js`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/api/phonepe/create-payment/route.js) | `[MODIFY]` | Enforced zero-trust server-side validation before initiating PhonePe payment payloads. |
| `2026-08-31 12:28` | [`src/app/auth/callback/page.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/auth/callback/page.jsx) | `[NEW]` | Client route handler for OAuth redirects & identity linking returns with dynamic target redirect preservation. |
| `2026-08-31 12:28` | [`src/components/PendingVerificationModal.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/components/PendingVerificationModal.jsx) | `[NEW]` | High-aesthetic modal component handling SMS OTP phone verification & Google identity linking. Supports post-login popup and mandatory checkout mode. |
| `2026-08-31 12:28` | [`src/providers/AuthProvider.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/providers/AuthProvider.jsx) | `[MODIFY]` | Added `checkServerProfileStatus()`, `sendPhoneOtp()`, `verifyPhoneOtp()`, `linkGoogleAccount()`, route-aware mandatory modal trigger on `/checkout`, and immediate post-login popup listener. |
| `2026-08-31 12:28` | [`src/app/auth/page.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/auth/page.jsx) | `[MODIFY]` | Added dynamic origin redirect for Google OAuth (`window.location.origin`) and support for `redirect` query parameter. |
| `2026-08-31 12:28` | [`src/app/checkout/page.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/checkout/page.jsx) | `[MODIFY]` | Updated checkout order handler to trigger verification modal on server-side `PROFILE_INCOMPLETE` code. |
| `2026-08-31 14:57` | [`src/app/api/user/profile-status/route.js`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/api/user/profile-status/route.js) | `[MODIFY]` | Added automatic server-side sync using `updateUserById` to copy Google identity `full_name`, `email`, and `avatar_url` into the primary user database row when linked to a phone account. |
| `2026-08-31 14:57` | [`src/app/auth/callback/page.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/auth/callback/page.jsx) | `[MODIFY]` | Added automatic profile sync trigger & `supabase.auth.refreshSession()` execution upon OAuth callback to immediately update client session with linked Google metadata. |
| `2026-08-31 14:57` | [`src/app/account/page.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/account/page.jsx) | `[MODIFY]` | Added `googleIdentity` fallback lookup for `fullName`, `avatar`, and `email` to ensure user details render immediately without requiring logout/login. |
| `2026-08-31 15:27` | [`Docs/AuthDevelopment.md`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/Docs/AuthDevelopment.md) | `[NEW]` | Created master authentication architecture & development documentation covering Supabase/Twilio setup, zero-trust backend security, data flow diagrams, and troubleshooting guide. |

---

## 🔐 Architecture Features Implemented

1. **Zero-Trust Server-Side Profile Verification & Identity Data Sync**:
   - `/api/user/profile-status` inspects canonical user record directly via `supabaseAdmin.auth.getUser(token)`.
   - Automatically synchronizes Google identity attributes (`full_name`, `email`, `avatar_url`) onto the top-level `user.user_metadata` and `user.email` via `updateUserById` so phone accounts linked to Google immediately reflect user details across the entire site.
   - `/api/place-order` and `/api/phonepe/create-payment` reject any attempt to place an order or create payments if `!hasPhone` or `!hasGoogle`.

2. **Dual Identity Linking Mechanics**:
   - **Google User missing Phone**: `supabase.auth.updateUser({ phone })` + SMS OTP verification with `supabase.auth.verifyOtp({ type: 'phone_change' })`.
   - **Phone User missing Google**: `supabase.auth.linkIdentity({ provider: 'google' })` attaching OAuth credentials to the active user account.

3. **Immediate Post-Login Popup & Route-Aware Mandatory Checkout Modal**:
   - Pops up automatically after user logs in on any page showing pending credential verification badge.
   - On `/checkout`, modal is non-dismissable until profile completion is verified.
