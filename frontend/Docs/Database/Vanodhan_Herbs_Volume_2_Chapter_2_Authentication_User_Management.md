# Vanodhan Herbs

# Volume 2 -- Database Documentation

## Chapter 2 -- Authentication & User Management

**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This chapter documents the authentication architecture and user-related
tables. Authentication is handled by Supabase Auth, while
application-specific authorization is stored separately.

------------------------------------------------------------------------

# Authentication Architecture

    Google OAuth / Phone OTP
              │
              ▼
       auth.users
              │
              ▼
       user_profiles
              │
              ├── addresses
              ├── cart_items
              ├── orders
              ├── reviews
              └── coupon_redemptions

The `auth.users` table is the source of identity. Business data is never
stored inside authentication metadata.

------------------------------------------------------------------------

# Table: user_profiles

## Purpose

Stores authorization data and business-specific information for
authenticated users.

## Columns

  Column       Type          Description
  ------------ ------------- --------------------------------
  id           UUID          References `auth.users.id`
  role         TEXT          customer, admin or super_admin
  created_at   TIMESTAMPTZ   Creation timestamp
  updated_at   TIMESTAMPTZ   Last update timestamp

## Relationships

-   Primary Key: `id`
-   Foreign Key → `auth.users(id)`
-   One-to-one relationship with authenticated users.

## Role Model

-   customer
-   admin
-   super_admin

Never trust roles sent by the client. Always verify from the database.

------------------------------------------------------------------------

# Table: addresses

## Purpose

Stores delivery addresses belonging to users.

## Columns

-   id
-   user_id
-   full_name
-   phone
-   address_line_1
-   address_line_2
-   city
-   state
-   pincode
-   country
-   is_default
-   created_at
-   updated_at

## Relationships

-   Many addresses belong to one user.
-   Linked through `user_id`.

## Constraints

-   Phone length ≥ 10
-   Pincode length = 6
-   One default address per user

## Indexes

-   `addresses_user_id_idx`
-   `one_default_address_per_user`

These optimise address lookups and enforce a single default address.

------------------------------------------------------------------------

# Security Considerations

-   Users must only access their own profile and addresses.
-   Never expose another user's address.
-   All writes must validate ownership.
-   Roles must never be editable by customers.

------------------------------------------------------------------------

# Future Improvements

-   Address labels (Home, Office)
-   Geo coordinates
-   Address verification
-   Soft delete
-   Audit logs

------------------------------------------------------------------------

# AI Context

Future AI assistants should:

-   Keep authentication separate from business metadata.
-   Preserve one-to-one relationship between `auth.users` and
    `user_profiles`.
-   Never move roles into frontend state or authentication metadata.
-   Always enforce ownership checks on addresses.

------------------------------------------------------------------------

*End of Chapter 2*
