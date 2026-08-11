# Vanodhan Herbs

# Volume 2 -- Database Documentation

## Chapter 5 -- Orders & Payments

**Version:** 1.0

------------------------------------------------------------------------

# Purpose

The Orders module is the core transactional component of Vanodhan Herbs.
It records purchases, payment information, delivery status and preserves
immutable purchase history.

------------------------------------------------------------------------

# Architecture

``` text
auth.users
    │
    ▼
 orders
    │
    ├──────────────┐
    ▼              ▼
order_items    addresses
    │
    ▼
 products

orders
   │
   ▼
coupons (optional)
```

------------------------------------------------------------------------

# Table: orders

## Purpose

Stores one record per customer purchase.

The table represents the business transaction and order lifecycle.

## Important Columns

  Column                    Description
  ------------------------- -------------------------------------
  id                        Order UUID
  user_id                   Customer
  address_id                Shipping address snapshot reference
  subtotal                  Cart total before charges
  delivery_charge           Shipping fee
  coupon_discount           Discount applied
  total                     Final payable amount
  status                    Fulfilment status
  payment_status            Payment lifecycle
  payment_method            COD or PhonePe
  coupon_id                 Applied coupon
  gateway_order_id          Gateway reference
  gateway_transaction_id    Payment transaction
  phonepe_order_id          PhonePe merchant order id
  gateway_response          Raw JSON response
  created_at / updated_at   Audit timestamps

------------------------------------------------------------------------

## Status Flow

``` text
pending
   ↓
confirmed
   ↓
packed
   ↓
shipped
   ↓
delivered

cancelled
```

Payment flow:

``` text
pending
   ↓
verifying
   ↓
paid

failed
refunded
```

------------------------------------------------------------------------

# Table: order_items

## Purpose

Stores immutable snapshots of purchased products.

### Snapshot Strategy

Each row stores:

-   product_name
-   product_image
-   mrp
-   discount
-   price_at_purchase
-   quantity
-   line_total

Historical orders never depend on current product data.

------------------------------------------------------------------------

# Relationships

-   orders → order_items (1:N)
-   products → order_items (reference only)
-   addresses → orders
-   coupons → orders (optional)

------------------------------------------------------------------------

# Constraints

Database validates:

-   subtotal \>= 0
-   total \>= 0
-   delivery_charge \>= 0
-   coupon_discount \>= 0
-   valid payment method
-   valid order status
-   valid payment status
-   quantity \> 0
-   line_total \>= 0

------------------------------------------------------------------------

# Indexes

## orders_user_id_idx

Optimizes:

-   Order history
-   Customer dashboard
-   Admin customer lookup

## order_items_order_id_idx

Optimizes:

-   Loading order details
-   Invoice generation

------------------------------------------------------------------------

# Payment Philosophy

PhonePe is the payment gateway.

Server responsibilities:

1.  Create gateway order.
2.  Verify payment.
3.  Mark payment paid.
4.  Create immutable order.
5.  Clear cart.
6.  Reduce inventory.

Never trust client payment success.

Always verify with the gateway.

------------------------------------------------------------------------

# Security

Never allow clients to:

-   Choose payment status
-   Change order status
-   Modify totals
-   Update gateway IDs

All values must originate from server-side logic.

------------------------------------------------------------------------

# Future Improvements

-   Partial refunds
-   Shipment tracking
-   Invoice PDF
-   Multiple payment gateways
-   Warehouse allocation
-   Order audit log

------------------------------------------------------------------------

# AI Context

Preserve:

-   Immutable order history
-   Snapshot-based order_items
-   Server-side payment verification
-   Status transitions only through backend

------------------------------------------------------------------------

# Interview Talking Points

**Why snapshot products?**

To preserve historical accuracy even if catalogue data changes.

**Why JSONB gateway response?**

Flexible storage for gateway payloads without schema changes.

**Why separate payment and fulfilment status?**

Payment completion and shipping progress are independent business
processes.

*End of Chapter 5*
