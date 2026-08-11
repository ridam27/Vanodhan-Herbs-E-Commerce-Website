# Vanodhan Herbs

# Volume 2 -- Database Documentation

## Chapter 8 -- ER Diagram, Query Flows & AI Context

**Version:** 1.0

------------------------------------------------------------------------

# Entity Relationship Overview

``` text
auth.users
 ├── user_profiles
 ├── addresses
 ├── cart_items
 ├── orders
 ├── reviews
 └── coupon_redemptions

products
 ├── cart_items
 ├── reviews
 └── order_items

orders
 └── order_items

coupons
 ├── coupon_redemptions
 └── orders
```

------------------------------------------------------------------------

# Core Query Flows

## User Registration

OAuth/OTP → auth.users → user_profiles

------------------------------------------------------------------------

## Add to Cart

Authenticate

↓

Validate Product

↓

Insert / Update cart_items

------------------------------------------------------------------------

## Checkout

Validate Cart

↓

Validate Address

↓

Validate Coupon

↓

Create Gateway Order

↓

Verify Payment

↓

Create Order

↓

Create Order Items

↓

Reduce Inventory

↓

Clear Cart

------------------------------------------------------------------------

## Review Submission

Authenticate

↓

Verify Ownership

↓

Validate Rating

↓

Insert Review

------------------------------------------------------------------------

# AI Context

Future AI assistants should understand:

-   auth.users is identity.
-   user_profiles stores roles.
-   products are the live catalogue.
-   order_items are immutable snapshots.
-   coupons are validated server-side.
-   payment success must always be verified.
-   admin functionality belongs in a separate application.

------------------------------------------------------------------------

# Engineering Principles

1.  Security
2.  Correctness
3.  Data Integrity
4.  Scalability
5.  Performance
6.  Maintainability

Never sacrifice the first three.

------------------------------------------------------------------------

# Future Roadmap

-   Admin Dashboard
-   Analytics
-   Inventory History
-   Shipping Integration
-   GST Invoices
-   Notifications
-   Multi-vendor readiness
-   Warehouse support

------------------------------------------------------------------------

*End of Volume 2*
