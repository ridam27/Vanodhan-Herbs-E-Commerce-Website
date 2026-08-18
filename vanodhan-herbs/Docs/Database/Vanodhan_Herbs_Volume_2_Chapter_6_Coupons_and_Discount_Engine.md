# Vanodhan Herbs

# Volume 2 -- Database Documentation

## Chapter 6 -- Coupons & Discount Engine

**Version:** 1.0

------------------------------------------------------------------------

# Purpose

The coupon subsystem provides secure, flexible and scalable discount
management while preventing abuse and ensuring that every redemption is
traceable.

------------------------------------------------------------------------

# Architecture

``` text
coupons
   │
   ├──────────────┐
   ▼              ▼
coupon_redemptions
        │
        ▼
      orders

coupon_attempts
```

`coupons` defines discount rules, `coupon_redemptions` records
successful usage, and `coupon_attempts` helps monitor abuse and rate
limiting.

------------------------------------------------------------------------

# Table: coupons

## Purpose

Stores all active and historical coupon definitions.

### Important Columns

  Column             Description
  ------------------ ---------------------------
  id                 Coupon UUID
  code               Unique coupon code
  description        Marketing description
  discount_type      percentage / fixed
  discount_value     Discount amount
  min_order_amount   Minimum cart value
  max_discount       Maximum discount cap
  usage_limit        Global usage limit
  used_count         Redemption counter
  per_user_limit     Per-user redemption limit
  starts_at          Activation time
  expires_at         Expiration time
  is_active          Coupon enabled flag

### Constraints

-   Positive discount value
-   Valid discount type
-   Non-negative minimum amount
-   Non-negative max discount
-   Positive usage limits
-   Non-negative usage counter

------------------------------------------------------------------------

# Table: coupon_redemptions

## Purpose

Maintains an audit trail of every successful coupon redemption.

### Relationships

-   coupon_id → coupons
-   user_id → auth.users
-   order_id → orders (optional until linked)

This table should never be edited manually.

------------------------------------------------------------------------

# Table: coupon_attempts

## Purpose

Stores coupon validation attempts using client IP.

Primary goals:

-   Rate limiting
-   Abuse detection
-   Security analytics

------------------------------------------------------------------------

# Coupon Validation Flow

1.  Validate coupon format.
2.  Verify coupon exists.
3.  Check active status.
4.  Check start and expiry dates.
5.  Verify minimum order amount.
6.  Verify global usage limit.
7.  Verify per-user redemption limit.
8.  Calculate discount.
9.  Reserve for checkout.
10. Record redemption after successful payment.

------------------------------------------------------------------------

# Discount Calculation

## Percentage

    discount = subtotal × percentage / 100

Apply `max_discount` when configured.

## Fixed

    discount = fixed_amount

Never exceed order subtotal.

------------------------------------------------------------------------

# Security

Never trust:

-   Client supplied discount
-   Client supplied coupon validity
-   Client supplied redemption count

Always calculate discounts on the server.

Record every successful redemption atomically with order completion.

------------------------------------------------------------------------

# Performance

Indexes:

-   coupons_code_idx
-   coupon_redemptions_coupon_id_idx
-   coupon_redemptions_user_id_idx

These optimize validation and redemption history lookups.

------------------------------------------------------------------------

# Future Improvements

-   Category-specific coupons
-   Product-specific coupons
-   First-order offers
-   Referral coupons
-   Automatic promotions
-   Scheduled campaigns
-   Coupon analytics dashboard

------------------------------------------------------------------------

# AI Context

Future AI assistants should preserve:

-   Server-side coupon validation
-   Atomic redemption recording
-   Immutable redemption history
-   Abuse detection through attempt logging
-   No client-controlled discount calculations

------------------------------------------------------------------------

# Interview Talking Points

**Why separate coupons and coupon_redemptions?**

To separate coupon definitions from redemption history and maintain an
audit trail.

**Why store coupon_attempts?**

To detect brute-force coupon guessing and enable rate limiting.

**Why keep used_count?**

To efficiently enforce global usage limits without expensive aggregation
queries.

------------------------------------------------------------------------

*End of Chapter 6*
