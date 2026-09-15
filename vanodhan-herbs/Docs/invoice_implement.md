# Vanodhan Herbs — Customer Tax Invoice System Specification (`invoice_implement.md`)

This document defines the implementation specifications, business rules, server-side PDF generation pipeline, and UI state behaviors for **Customer Tax Invoices** in the **Customer Website** (`vanodhan-herbs`). Admin invoicing and packing slips are handled separately in the admin panel app.

---

## 🔒 Customer Tax Invoice Business Rules

An official Tax Invoice PDF is **ONLY available for download/generation** when **BOTH** conditions are satisfied:
1. `order.status === "delivered"` (Order has been delivered to customer)
2. `order.payment_status === "paid"` (Payment is completed)

### Customer UI Button State Behavior:
- **If either condition is NOT met**:
  - The "Download Tax Invoice" button on the Customer Order Details page (`/orders/[orderId]`) is **disabled**.
  - Displays explicit reason text explaining why it is unavailable:
    - Pending delivery: `"Invoice will be available after order delivery"`
    - Pending payment: `"Invoice will be available after payment completion"`
    - Pending both: `"Invoice will be available after order delivery and payment completion"`
- **If BOTH conditions ARE met**:
  - The button is **enabled** and directly triggers the download of `Invoice-VH-[orderId].pdf`.

---

## 🏗️ System Architecture & Workflow

```
                               ┌─────────────────────────────┐
                               │     Customer Order View     │
                               │     /orders/[orderId]       │
                               └──────────────┬──────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
                    ▼                                                   ▼
       [ Incomplete: Not Delivered/Paid ]                      [ Complete: Delivered & Paid ]
                    │                                                   │
                    ▼                                                   ▼
      Button Disabled with Reason Text:                   Button Enabled: "Download Tax Invoice"
      "Invoice available after delivery..."                             │
                                                                        ▼
                                                        Click -> GET /api/orders/[orderId]/invoice
                                                                        │
                                                        ┌───────────────┴───────────────┐
                                                        │ Customer PDF Endpoint         │
                                                        │ 1. Verify Bearer JWT Token    │
                                                        │ 2. Check user owns order      │
                                                        │ 3. Verify status == delivered │
                                                        │    && payment_status == paid  │
                                                        │ 4. Generate & Stream PDF      │
                                                        └───────────────┬───────────────┘
                                                                        │
                                                                        ▼
                                                         Direct Download PDF File
```

---

## 📦 File Modification & Creation Index (Customer App)

| Target Application | File Path | Action | Description |
| :--- | :--- | :--- | :--- |
| **`vanodhan-herbs`** | [`src/app/api/orders/[orderId]/invoice/route.js`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/api/orders/[orderId]/invoice/route.js) | `[NEW]` | Server-side PDF invoice generator endpoint using `pdf-lib` with strict ownership & delivery/payment checks. |
| **`vanodhan-herbs`** | [`src/app/orders/[orderId]/page.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/orders/[orderId]/page.jsx) | `[MODIFY]` | Add status-aware Tax Invoice download button with disabled reason messaging. |
| **`vanodhan-herbs`** | [`Docs/authworkdone.md`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/Docs/authworkdone.md) | `[MODIFY]` | Audit log tracking all file changes. |

---

## 🛠️ Admin Panel Specifications (`vanodhan-herbs-admin`)

For reference and future integration in the separate Admin Panel codebase (`vanodhan-herbs-admin`):

### 1. Admin Tax Invoice Rules
- For Admin panel invoice downloads, the order status requirement is relaxed to allow shipping dispatch:
  - Enabled **ONLY** when `order.status === "shipped"` (or `"delivered"`) AND `order.payment_status === "paid"`.
  - Disabled if order status is before `shipped` (e.g. `pending`, `confirmed`, `processing`, `packed`) or if payment is unpaid.
  - Displays explicit reason messaging when disabled.

### 2. Admin Packing Slips Rules
- **Accessible for any order at ANY stage** (including `pending`, `confirmed`, `packed`, `shipped`, COD, or Pre-paid).
- Designed for warehouse fulfillment staff to pack items into shipping boxes before delivery/payment completion.
- Contains item checklist, quantities, MRPs, delivery address, and shipping labels, while excluding sensitive financial transaction summaries.

