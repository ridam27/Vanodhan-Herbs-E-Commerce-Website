# Vanodhan Herbs — Support Ticket & Contact System Architecture

**Project:** Vanodhan Herbs E-Commerce  
**Document Version:** 2.0 (Production Specification)  
**Target Modules:** Contact Form (`/contact`), Dedicated Tickets Portal (`/contact/tickets`), and API Route (`/api/contact`)  
**Database Table:** Supabase PostgreSQL (`public.support_queries`)

---

## 1. Executive Summary & Architecture Overview

This specification details the end-to-end architecture, database schema, security standards, authentication flows, and API specifications for the **Vanodhan Herbs Support Query & Customer Care System**.

### System Architecture Flow:

```
[ Customer at /contact ] ──► [ Fill Form ] ──► [ Auth Verified? ]
                                                     │
                                       ┌─────────────┴─────────────┐
                                    ( YES )                     ( NO )
                                       │                           │
                            [ POST /api/contact ]       [ Save Draft to sessionStorage ]
                                       │                           │
                            [ Validate & Sanitize ]     [ Display Login Modal Prompt ]
                                       │                           │
                            [ Check Rate Limits ]       [ Authenticate at /auth ]
                                       │                           │
                        [ Insert to support_queries ] ◄── [ Redirect to /contact + Rehydrate ]
                                       │
                    [ Live View at /contact/tickets ]
                                       │
                      [ Admin Updates admin_notes ]
```

---

## 2. Component & Page Route Breakdown

| Path / File | Responsibility | Access Control |
| :--- | :--- | :--- |
| [`/contact`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/contact/page.jsx) | Customer Contact Page with Hero, Support Cards, FAQ Accordion, and Store Map. | Public |
| [`/contact/tickets`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/contact/tickets/page.jsx) | Dedicated Customer Portal for live ticket status tracking and support team responses. | Authenticated / Login Prompt |
| [`src/components/ContactForm.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/components/ContactForm.jsx) | Interactive form component with field validation, draft persistence, and auth modal. | Interactive |
| [`src/components/UserSupportTickets.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/components/UserSupportTickets.jsx) | Real-time support query tracker displaying status badges (`Pending`, `Under Review`, `Resolved`) and `admin_notes` replies. | Authenticated |
| [`src/app/api/contact/route.js`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/api/contact/route.js) | Next.js Serverless API endpoint enforcing authentication, rate limiting, sanitization, and database writes. | Serverless Endpoint |

---

## 3. Database Schema Specification (Supabase PostgreSQL)

### Table: `public.support_queries`

```sql
-- 1. Create Enum Types for Category & Status
CREATE TYPE query_category AS ENUM (
    'General Inquiry',
    'Order Status & Shipping',
    'Payment Status & Failure',
    'Herbal Usage Advice',
    'Wholesale & Bulk Orders'
);

CREATE TYPE query_status AS ENUM (
    'pending',
    'in_review',
    'resolved',
    'archived'
);

-- 2. Create support_queries Table
CREATE TABLE public.support_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    inquiry_type query_category NOT NULL DEFAULT 'General Inquiry',
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status query_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT DEFAULT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Performance Indexes
CREATE INDEX idx_support_queries_user_id ON public.support_queries(user_id);
CREATE INDEX idx_support_queries_status ON public.support_queries(status);
CREATE INDEX idx_support_queries_created_at ON public.support_queries(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.support_queries ENABLE ROW LEVEL SECURITY;

-- 5. Define Row Level Security (RLS) Policies

-- Policy A: Users can insert their own queries (Authenticated Only)
CREATE POLICY "Users can create their own support queries"
ON public.support_queries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy B: Users can view their own past support queries
CREATE POLICY "Users can view own support queries"
ON public.support_queries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy C: Service Role / Admin full access
CREATE POLICY "Admins have full access to all support queries"
ON public.support_queries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

## 4. Security & Data Integrity Standards

| Security Domain | Standard / Policy | Implementation Detail |
| :--- | :--- | :--- |
| **SQL Injection** | **Parameterized Queries** | All database operations execute exclusively via Supabase SDK methods (`supabase.from('support_queries')`). Raw SQL string concatenation is strictly forbidden. |
| **XSS Prevention** | **HTML Sanitization** | All user inputs (`fullName`, `phone`, `subject`, `message`) are sanitized server-side using HTML character escaping before database storage. |
| **Authentication** | **Bearer Token Verification** | The API endpoint verifies the Supabase JWT token via `supabaseAdmin.auth.getUser(token)` server-side to guarantee `user_id` authenticity. |
| **Rate Limiting** | **Throttle Protection** | Enforces a maximum of **2 submissions per user within a 15-minute window** to prevent spam and server flooding. |
| **Secrets Isolation** | **Service Role Key Security** | The `SUPABASE_SERVICE_ROLE_KEY` is restricted exclusively to server-side API routes and is **never** bundled into browser code. |

---

## 5. Authentication & Zero Data-Loss Draft Flow

### A. Background User ID Capture
When a logged-in user submits a query, their authentication session token (`session.access_token`) is sent in the `Authorization: Bearer <token>` header. The server verifies this token and binds the exact `user.id` to the new `support_queries` record.

### B. Guest Attempt Flow (Draft Preservation)
1. **Unauthenticated Submit**: If `!user` when a visitor clicks *Send Message*:
   - The form state is serialized into browser session storage: `sessionStorage.setItem("vanodhan_contact_draft", JSON.stringify(formData))`.
2. **Login Prompt Modal**: Displays a modal: *"Please log in to submit your support query. Your typed message has been saved and will be restored automatically after login."*
3. **Auth Redirect**: Redirects to `/auth?redirect=/contact`.
4. **Automatic Rehydration**: Upon returning to `/contact` after authenticating, the component checks `sessionStorage`, pre-fills all fields, notifies the user with a *"Draft Restored"* banner, and clears the temporary storage key.

---

## 6. API Endpoint Specification (`/api/contact`)

- **HTTP Method:** `POST`
- **Headers Required:** `Authorization: Bearer <SUPABASE_JWT_TOKEN>`

### Sample Payload:
```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+91 98765 43210",
  "inquiryType": "Herbal Usage Advice",
  "subject": "Guidance on Ashwagandha Churna dosage",
  "message": "Hello, I would like to know the best time of day to consume Ashwagandha Churna with warm milk."
}
```

### HTTP Response Codes:
- `201 Created`: `{ "success": true, "message": "Your support query has been submitted successfully.", "queryId": "uuid" }`
- `400 Bad Request`: Validation error in payload fields.
- `401 Unauthorized`: Missing or invalid Bearer token.
- `429 Too Many Requests`: Rate limit exceeded (> 2 submissions in 15 mins).
- `500 Internal Server Error`: Database insertion or server failure.

---

## 7. Admin Panel Integration Specification

When building or connecting the Admin Panel, support tickets in `support_queries` are managed as follows:

1. **Fetching Queries**: Read `public.support_queries` ordered by `created_at DESC`.
2. **Updating Status**: Admins can update `status` to `'in_review'`, `'resolved'`, or `'archived'`.
3. **Providing Responses**: Admins write official responses into the **`admin_notes`** column.
4. **Customer Live Display**: As soon as `admin_notes` is updated, the customer's portal at [`/contact/tickets`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/contact/tickets/page.jsx) automatically renders the official response inside a highlighted green card:
   ```
   ↳ Response from Support Team:
   "Hello Rahul! We recommend taking 1 tsp of Ashwagandha Churna with warm milk at bedtime."
   ```
