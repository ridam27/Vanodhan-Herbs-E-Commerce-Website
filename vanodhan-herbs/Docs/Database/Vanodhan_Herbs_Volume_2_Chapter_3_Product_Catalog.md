# Vanodhan Herbs

# Volume 2 -- Database Documentation

## Chapter 3 -- Product Catalog

**Version:** 1.0

------------------------------------------------------------------------

# Purpose

The Product Catalog is the heart of the Vanodhan Herbs platform. It
stores every product, its metadata, pricing, inventory, images and
customer reviews.

The schema is intentionally designed so that products remain easy to
manage while supporting future scalability.

------------------------------------------------------------------------

# Product Catalog Architecture

    products
        │
        ├──────────────┐
        │              │
        ▼              ▼
    cart_items     reviews
        │
        ▼
    order_items (snapshot)

Products are referenced by multiple modules but remain the single source
of truth for catalogue information.

------------------------------------------------------------------------

# Table: products

## Purpose

Stores every sellable product.

This table represents the live product catalogue.

------------------------------------------------------------------------

## Primary Key

    id BIGINT GENERATED ALWAYS AS IDENTITY

A sequential BIGINT is used because:

-   Products are internal entities.
-   Faster indexing than UUID.
-   No security risk from sequential IDs.
-   Better performance for joins.

------------------------------------------------------------------------

## Column Reference

  Column              Purpose
  ------------------- -------------------------
  id                  Product Identifier
  slug                SEO friendly URL
  name                Product Name
  description         Detailed description
  short_description   Short marketing summary
  price               Selling price
  discount            Discount percentage
  image               Primary image
  images              Gallery images
  tag                 Marketing tag
  badge               Product badge
  rating              Average rating
  reviews             Review count
  delivery            Delivery information
  benefits            Product benefits
  ingredients         Ingredients list
  usage               Usage instructions
  category            Product category
  is_active           Product visibility
  stock_quantity      Inventory count
  created_at          Creation timestamp
  updated_at          Last update

------------------------------------------------------------------------

# Design Decisions

## Slug

Every product has a unique slug.

Example

    ashwagandha-powder

Instead of

    /products/5

Benefits

-   Better SEO
-   Readable URLs
-   Easier marketing

------------------------------------------------------------------------

## Images Array

Instead of creating another table,

    images TEXT[]

is used because:

-   Small catalogue
-   Faster reads
-   Simpler queries
-   Lower complexity

Future migration to a dedicated product_images table is possible.

------------------------------------------------------------------------

## Inventory

    stock_quantity

Stores available inventory.

Inventory is updated only after successful payment verification.

Never reduce inventory before payment confirmation.

------------------------------------------------------------------------

## Pricing

    price
    discount

Final selling price is calculated by application logic.

Historical prices are never read from this table once an order is
placed.

------------------------------------------------------------------------

# Constraints

Database validates:

-   Price \>= 0
-   Rating between 0 and 5
-   Discount between 0 and 100
-   Stock \>= 0
-   Reviews \>= 0

These prevent invalid business data.

------------------------------------------------------------------------

# Indexes

### products_slug_idx

Optimises

    /products/[slug]

------------------------------------------------------------------------

### products_category_idx

Optimises category pages.

------------------------------------------------------------------------

### products_active_idx

Optimises

    WHERE is_active = true

for customer catalogue.

------------------------------------------------------------------------

# Table: reviews

## Purpose

Stores customer reviews.

Each authenticated customer may review a product only once.

------------------------------------------------------------------------

## Relationships

    auth.users
          │
          ▼
    reviews
          ▲
          │
    products

------------------------------------------------------------------------

## Important Columns

  Column            Purpose
  ----------------- --------------------------
  user_id           Reviewer
  product_id        Reviewed Product
  rating            Rating
  review            Review text
  reviewer_name     Snapshot of display name
  reviewer_avatar   Snapshot of avatar
  purchased_on      Purchase date

------------------------------------------------------------------------

# Review Constraints

-   Rating between 1 and 5
-   Review length between 5 and 500 characters
-   One review per user per product

------------------------------------------------------------------------

# Security

Users must:

-   Review only purchased products (recommended future validation)
-   Edit only their own reviews
-   Delete only their own reviews

Never trust client supplied user_id.

Always derive from authenticated session.

------------------------------------------------------------------------

# Performance Considerations

Indexes:

-   reviews_user_id_idx
-   reviews_product_id_idx

Optimise:

-   Product page reviews
-   User review history

------------------------------------------------------------------------

# Future Improvements

Recommended additions:

-   Review images
-   Verified purchase badge
-   Helpful votes
-   Review moderation
-   AI spam detection
-   Review reports

------------------------------------------------------------------------

# AI Context

Future AI assistants should preserve these principles:

-   Products are the source of truth for the live catalogue.
-   Orders must never depend on current product pricing.
-   Inventory changes only after verified payments.
-   Product URLs should always use slug.
-   Reviews belong to authenticated users only.

------------------------------------------------------------------------

# Interview Talking Points

Why BIGINT instead of UUID?

Because products are internal catalogue entities and benefit from
sequential indexing.

Why snapshot product data inside order_items?

To preserve historical order accuracy.

Why slug instead of product id?

For SEO and user-friendly URLs.

------------------------------------------------------------------------

*End of Chapter 3*
