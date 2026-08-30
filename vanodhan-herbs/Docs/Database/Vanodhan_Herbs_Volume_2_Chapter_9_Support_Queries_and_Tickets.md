# Vanodhan Herbs

# Volume 2 -- Database Documentation

## Chapter 9 -- Support Queries & Tickets

**Version:** 1.0

------------------------------------------------------------------------

# Purpose

The Support Queries & Tickets module manages customer assistance inquiries, ticket tracking, resolution workflows, and support team responses. It enables authenticated customers to submit queries from the contact portal and track progress while providing administrators (`admin` and `super_admin` roles) full capabilities to review, update status, and reply via support notes.

------------------------------------------------------------------------

# Architecture

```text
auth.users
    │
    ▼ (user_id)
public.support_queries ◄── public.user_profiles (role: admin, super_admin)
```

Customers own and view their submitted tickets. Support specialists and admins manage ticket statuses and provide responses in `admin_notes`.

------------------------------------------------------------------------

# Table: support_queries

## Purpose

Stores customer support tickets, contact messages, resolution status, and support specialist responses.

------------------------------------------------------------------------

## Primary Key

`id UUID`

Generates unique, non-sequential ticket identifiers using `gen_random_uuid()`. Displayed in UI components in shortened format (`#TK-<8-char-prefix>`).

------------------------------------------------------------------------

## Schema & Columns

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Support ticket unique identifier |
| `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Authenticated customer owner |
| `full_name` | `TEXT` | `NOT NULL` | Customer full name |
| `email` | `TEXT` | `NOT NULL` | Customer email address |
| `phone` | `TEXT` | `NULLABLE` | Contact phone number |
| `inquiry_type` | `query_category` | `NOT NULL DEFAULT 'General Inquiry'` | Inquiry category Enum |
| `subject` | `TEXT` | `NOT NULL` | Query subject line |
| `message` | `TEXT` | `NOT NULL` | Full inquiry message text |
| `status` | `query_status` | `NOT NULL DEFAULT 'pending'` | Resolution lifecycle status Enum |
| `admin_notes` | `TEXT` | `DEFAULT NULL` | Official support response / admin notes |
| `ip_address` | `TEXT` | `NULLABLE` | Client IP address |
| `user_agent` | `TEXT` | `NULLABLE` | Client browser user agent string |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Ticket creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last update timestamp |

------------------------------------------------------------------------

# Custom Enum Types

## 1. `query_category`

Represents customer inquiry classifications:

- `'General Inquiry'`
- `'Order Status & Shipping'`
- `'Payment Status & Failure'`
- `'Herbal Usage Advice'`
- `'Wholesale & Bulk Orders'`

## 2. `query_status`

Represents the ticket resolution lifecycle:

- `'pending'`: Newly submitted ticket awaiting initial review (Default).
- `'in_review'`: Ticket currently being investigated by support staff.
- `'resolved'`: Ticket successfully answered and closed.
- `'archived'`: Historical or inactive ticket archived by admin.

------------------------------------------------------------------------

# Status Workflow

```text
pending (New)
   │
   ▼
in_review (Under Investigation)
   │
   ▼
resolved (Response Delivered & Closed)

archived (Archived)
```

------------------------------------------------------------------------

# Database Functions & RPCs

## `public.admin_get_unresolved_queries_count()`

### Purpose

Calculates the count of unresolved support queries (`pending` or `in_review`) to display the live badge counter on the Admin Panel Sidebar.

### Security

Uses `SECURITY DEFINER` and enforces caller authorization using `public.get_current_user_role() IN ('admin', 'super_admin')`.

```sql
CREATE OR REPLACE FUNCTION public.admin_get_unresolved_queries_count()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role text;
    unresolved_count INT := 0;
BEGIN
    v_role := public.get_current_user_role();
    
    IF v_role IS DISTINCT FROM 'admin' AND v_role IS DISTINCT FROM 'super_admin' THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required'
            USING errcode = 'P0001';
    END IF;

    SELECT COUNT(*) INTO unresolved_count
    FROM public.support_queries
    WHERE status IN ('pending', 'in_review');

    RETURN unresolved_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_unresolved_queries_count() TO authenticated;
```

------------------------------------------------------------------------

# Indexes

- `idx_support_queries_user_id`: Optimizes customer ticket history lookups on `/contact/tickets`.
- `idx_support_queries_status`: Speeds up status filtering and unresolved badge counting.
- `idx_support_queries_created_at`: Optimizes table sorting by creation timestamp (`created_at DESC`).

------------------------------------------------------------------------

# Row Level Security (RLS) Policies

Row Level Security is enabled on `public.support_queries`.

## Customer Policies

- **INSERT**: Authenticated customers can insert queries bound to their own `user_id` (`auth.uid() = user_id`).
- **SELECT**: Authenticated customers can view only their own past queries (`auth.uid() = user_id`).

## Admin & Super Admin Policies

- **SELECT**: Admins and Super Admins can view all support queries (`public.get_current_user_role() IN ('admin', 'super_admin')`).
- **UPDATE**: Admins and Super Admins can update status and `admin_notes` (`public.get_current_user_role() IN ('admin', 'super_admin')`).

------------------------------------------------------------------------

# Security & Data Integrity

- **Authentication Verification**: Serverless API routes verify Supabase Bearer JWT tokens before inserting ticket records.
- **XSS Protection**: Inputs (`full_name`, `phone`, `subject`, `message`) are sanitized server-side.
- **Rate Limiting**: Enforces a maximum of 2 ticket submissions per 15-minute window per user/IP.
- **Draft Preservation**: Unauthenticated submit attempts save draft input to `sessionStorage` until login completes.
