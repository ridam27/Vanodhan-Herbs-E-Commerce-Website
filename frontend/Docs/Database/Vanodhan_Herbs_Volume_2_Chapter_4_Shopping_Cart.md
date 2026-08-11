# Vanodhan Herbs

# Volume 2 -- Database Documentation

## Chapter 4 -- Shopping Cart

**Version:** 1.0

------------------------------------------------------------------------

# Purpose

The shopping cart acts as a temporary staging area before checkout. It
stores the products a customer intends to purchase while maintaining
data integrity and preventing duplicate cart entries.

------------------------------------------------------------------------

# Architecture

``` text
auth.users
      │
      ▼
 cart_items
      ▲
      │
  products
```

Each authenticated user owns an independent cart.

------------------------------------------------------------------------

# Table: cart_items

## Purpose

Stores the current shopping cart for each authenticated customer.

Unlike orders, cart data is temporary and can change until checkout.

------------------------------------------------------------------------

## Primary Key

`id UUID`

UUID prevents predictable identifiers and aligns with other
transactional tables.

------------------------------------------------------------------------

## Columns

  Column       Description
  ------------ -----------------------------
  id           Cart item identifier
  user_id      Owner of the cart item
  product_id   Referenced product
  quantity     Requested quantity
  created_at   Creation timestamp
  updated_at   Last modification timestamp

------------------------------------------------------------------------

# Relationships

-   `user_id` → `auth.users(id)`
-   `product_id` → `products(id)`

Deleting a user or product automatically removes related cart entries
through cascading foreign keys.

------------------------------------------------------------------------

# Business Rules

-   One product can appear only once per user's cart.
-   Quantity must be between **1** and **20**.
-   Quantity updates modify the existing row instead of creating
    duplicates.

This is enforced by the unique constraint:

`UNIQUE(user_id, product_id)`

------------------------------------------------------------------------

# Constraints

-   Quantity \> 0
-   Quantity ≤ 20
-   Valid authenticated user
-   Valid product reference

These checks prevent invalid cart data from reaching checkout.

------------------------------------------------------------------------

# Indexes

## cart_items_user_id_idx

Optimizes:

-   Load user's cart
-   Checkout preparation
-   Cart badge count

------------------------------------------------------------------------

# Query Flow

## Add to Cart

1.  Authenticate user.
2.  Verify product exists.
3.  Check stock availability.
4.  If product already exists, increment quantity.
5.  Otherwise insert new row.

## Update Quantity

-   Validate ownership.
-   Enforce quantity limits.
-   Update timestamp.

## Remove Item

Delete only rows owned by the authenticated user.

------------------------------------------------------------------------

# Security

Never trust:

-   Client supplied user_id
-   Product price
-   Product availability

Always derive user identity from the authenticated session and validate
the product on the server.

------------------------------------------------------------------------

# Performance

The table remains lightweight because product details are fetched from
`products`.

This avoids redundant storage while keeping cart reads efficient.

------------------------------------------------------------------------

# Future Improvements

-   Guest cart merging
-   Saved-for-later items
-   Inventory reservation timers
-   Wishlist integration

------------------------------------------------------------------------

# AI Context

Future AI assistants should preserve:

-   One cart per authenticated user.
-   One row per product per user.
-   Server-side ownership validation.
-   No price storage inside the cart.
-   Inventory validation during checkout.

------------------------------------------------------------------------

# Interview Talking Points

**Why not store price in the cart?**

Prices can change. The authoritative price should be verified during
checkout.

**Why use a unique constraint?**

To prevent duplicate rows and simplify quantity updates.

**Why validate quantity in the database?**

Database constraints protect against invalid requests even if
application validation is bypassed.

------------------------------------------------------------------------

*End of Chapter 4*
