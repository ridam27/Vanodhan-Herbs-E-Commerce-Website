# Vanodhan Herbs

# Volume 2 -- Database Documentation

## Chapter 7 -- Security, Constraints, Indexes & RLS

**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This chapter documents the database security strategy adopted across the
project.

## Security Philosophy

-   Never trust frontend data.
-   Authenticate every request.
-   Authorize every sensitive action.
-   Validate ownership server-side.
-   Enforce integrity using database constraints.

------------------------------------------------------------------------

# Constraints

Database constraints are the final protection layer.

Implemented:

-   Primary Keys
-   Foreign Keys
-   CHECK Constraints
-   UNIQUE Constraints
-   NOT NULL
-   Default Values

Never rely only on frontend validation.

------------------------------------------------------------------------

# Foreign Keys

Relationships guarantee referential integrity.

Examples:

-   orders → auth.users
-   reviews → products
-   cart_items → products
-   coupon_redemptions → coupons

ON DELETE CASCADE is used where orphaned data should never exist.

------------------------------------------------------------------------

# Index Strategy

Indexes exist for:

-   user_id
-   order_id
-   coupon_id
-   product_id
-   slug
-   category
-   is_active

Indexes should be added only after measuring query performance.

------------------------------------------------------------------------

# Recommended RLS

## Products

-   Public SELECT
-   Admin INSERT/UPDATE/DELETE

## Cart

Users may access only their own rows.

## Addresses

Users may access only their own addresses.

## Orders

Users may access only their own orders.

Admins receive elevated access.

## Reviews

Public SELECT

Owner UPDATE/DELETE

Authenticated INSERT

------------------------------------------------------------------------

# API Security

Every API should:

1.  Verify session.
2.  Verify role.
3.  Verify ownership.
4.  Validate input.
5.  Execute business logic.
6.  Return minimum required data.

------------------------------------------------------------------------

# SQL Injection

Protection relies on:

-   Supabase parameterized queries
-   No string concatenation
-   Input validation

Never build SQL manually.

------------------------------------------------------------------------

# Additional Recommendations

-   Rate limiting
-   Audit logs
-   Admin activity logs
-   Secret rotation
-   Monitoring
-   Security headers
-   Cloudflare WAF

------------------------------------------------------------------------

# AI Context

Future AI assistants must never weaken:

-   Authentication
-   Authorization
-   Ownership validation
-   Database constraints

Security takes precedence over convenience.

*End of Chapter 7*
