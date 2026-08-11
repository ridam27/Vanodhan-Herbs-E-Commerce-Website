# Vanodhan Herbs

# Volume 2 -- Database Documentation

## Chapter 1 -- Database Architecture & Design Philosophy

**Version:** 1.0

------------------------------------------------------------------------

## Purpose

This chapter defines the architectural principles behind the Vanodhan
Herbs PostgreSQL database. It documents not only the schema philosophy
but also the engineering decisions so future developers and AI
assistants can maintain consistency.

## Database Overview

-   Database Engine: PostgreSQL (Supabase)
-   Authentication: `auth.users`
-   Business Tables: `public` schema
-   ACID compliant
-   Security-first design
-   Production-ready architecture

## Core Principles

1.  Security before convenience.
2.  Server-side validation.
3.  Historical order integrity.
4.  Clear relational modelling.
5.  Future scalability.
6.  Strong data integrity.

## Identifier Strategy

### UUID

Used for users, orders, addresses, reviews and coupons because they are
globally unique and difficult to enumerate.

### BIGINT

Used for products because they are internal catalogue entities and
benefit from sequential indexing.

## Relationship Strategy

    auth.users
     ├── user_profiles
     ├── addresses
     ├── cart_items
     ├── orders
     ├── reviews
     └── coupon_redemptions

    orders
     └── order_items

    products
     ├── cart_items
     ├── reviews
     └── order_items

## Order Snapshot Philosophy

`order_items` stores product name, image and pricing at purchase time so
historical orders never change after product updates.

## Security Philosophy

Never trust: - Frontend values - Client prices - Hidden fields - Client
roles

Always verify: - Authenticated session - Ownership - Payment state -
Inventory - Coupon validity

## Performance

Indexes are created on frequently queried fields such as user IDs,
product IDs, order IDs, coupon IDs, slug, category and active status.

## Future Improvements

-   Inventory history
-   Audit logging
-   Full-text search
-   Read replicas
-   Analytics

## AI Context

Future AI assistants must preserve schema compatibility, avoid
unnecessary redesigns and prefer secure production-grade solutions over
shortcuts.

------------------------------------------------------------------------

*End of Chapter 1*
