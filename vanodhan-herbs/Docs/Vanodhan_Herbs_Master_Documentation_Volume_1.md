# VANODHAN HERBS

# Master Project Documentation

## Volume 1 --- AI Context & Project Handbook

**Version:** 1.0\
**Project:** Vanodhan Herbs E-Commerce Platform\
**Architecture:** Production Ready\
**Status:** Active Development

------------------------------------------------------------------------

# 1. Project Overview

Vanodhan Herbs is a production-grade single-vendor Ayurvedic e-commerce
platform built to provide customers with a secure, scalable, and modern
online shopping experience while maintaining enterprise-level coding
standards and security practices.

This project is **not** a college demo.

Every module should be designed considering:

-   Scalability
-   Maintainability
-   Security
-   Performance
-   Future expansion

The project should remain production-ready at every stage.

------------------------------------------------------------------------

# 2. Technology Stack

## Frontend

-   Next.js (App Router)
-   React
-   JavaScript (No TypeScript)
-   Tailwind CSS
-   Plain CSS where required

## Backend

-   Next.js API Routes

## Database

-   Supabase PostgreSQL

## Authentication

-   Supabase Auth
-   Google OAuth
-   Phone OTP

## Payments

-   PhonePe Payment Gateway
-   Status API as source of truth
-   Optional webhook support

## Deployment

-   Vercel
-   Supabase
-   Cloudflare

------------------------------------------------------------------------

# 3. Coding Standards

-   JavaScript only
-   Reusable, readable components
-   Validate all API inputs
-   Authenticate and authorise every sensitive request
-   Never trust frontend data
-   Use parameterised Supabase queries
-   Responsive UI with CSS variables and dark mode support

------------------------------------------------------------------------

# 4. Folder Structure

``` text
vanodhan-herbs/
└── src/
    ├── app/
    ├── components/
    ├── lib/
    ├── hooks/
    ├── styles/
public/

Future:
admin/ (Separate Next.js project)
```

------------------------------------------------------------------------

# 5. Development Philosophy

Security → Correctness → Scalability → Performance → UI

Never reverse this order.

------------------------------------------------------------------------

# 6. Security Philosophy

Assume users can: - Modify frontend code - Inspect requests - Replay
requests - Automate attacks

Never trust: - Frontend - Hidden URLs - JavaScript validation - Local
storage permissions

Always trust: - Authenticated sessions - Server-side validation -
Database validation

------------------------------------------------------------------------

# 7. Authentication Philosophy

Supabase Auth → Session Validation → Server Authorisation → Database

Never determine permissions using frontend state.

------------------------------------------------------------------------

# 8. Authorisation

Roles: - customer - admin - super_admin

Stored in `user_profiles`.

------------------------------------------------------------------------

# 9. Admin Architecture

Customer Website: - `vanodhanherbs.com`

Admin: - `admin.vanodhanherbs.com` - Separate Next.js application -
Cloudflare Access - Supabase Authentication - Role Verification

Reasons: - Independent deployment - Reduced attack surface - Better
security - Cleaner codebase

------------------------------------------------------------------------

# 10. Payment Philosophy

Source of Truth: - PhonePe Status API

Verify: - Ownership - Amount - Currency - Gateway state - Transaction
ID - Order state

before: - Inventory deduction - Cart deletion - Order confirmation

------------------------------------------------------------------------

# 11. Project Goals

Current: - Customer website - Authentication - Payments - Orders -
Inventory - Coupons - Reviews - SEO - Dark mode - Responsive UI

Future: - Separate Admin - Analytics - Reports - Invoice generation -
Shipping - Returns - GST - Email notifications

------------------------------------------------------------------------

# 12. Fixed Technical Decisions

-   Next.js App Router
-   JavaScript only
-   Supabase
-   PhonePe
-   Server-side verification
-   Separate Admin Project
-   Cloudflare DNS
-   Responsive Design
-   Security-first architecture

------------------------------------------------------------------------

# 13. Rejected Decisions

-   Admin inside customer website
-   Client-side admin authorisation
-   Trusting payment redirect
-   Inventory deduction before verification
-   Service Role Key on frontend
-   Admin dashboard only on local machine

------------------------------------------------------------------------

# 14. AI Behaviour Instructions

Always: - Think like a Senior Software Architect - Prioritise security -
Explain trade-offs - Challenge incorrect assumptions - Protect existing
functionality - Prefer production-quality solutions

Never: - Agree blindly - Suggest insecure hacks - Break working code -
Compromise security

------------------------------------------------------------------------

# 15. Core Engineering Principles

1.  Security
2.  Correctness
3.  Maintainability
4.  Scalability
5.  Performance
6.  Developer Experience

Never sacrifice the first three for convenience.

------------------------------------------------------------------------

**Next:** Volume 2 --- Complete Database Documentation.
