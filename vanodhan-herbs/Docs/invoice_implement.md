# Vanodhan Herbs — Invoice & Packing Slip System Specification (`invoice_implement.md`)

This document defines the implementation specifications, business rules, server-side PDF generation pipeline, and UI state behaviors for **Tax Invoices** and **Packing Slips** across the **Customer Website** (`vanodhan-herbs`) and **Admin Panel** (`vanodhan-herbs-admin`).

---

## 🔒 Invoice & Packing Slip Business Rules

### 1. Customer & Admin Tax Invoice Rules
An official Tax Invoice PDF is **ONLY available for download/generation** (for both Customer and Admin) when **BOTH** conditions are satisfied:
1. `order.status === "delivered"` (Order has been delivered to customer)
2. `order.payment_status === "paid"` (Payment is completed)

#### Button State Behavior:
- **If either condition is NOT met**:
  - The "Download Tax Invoice" button is **disabled** on both Customer Order Details page (`/orders/[orderId]`) and Admin Order Modal (`OrderDetailsModal`).
  - Displays explicit reason text:
    - Pending delivery: `"Invoice will be available after order delivery"`
    - Pending payment: `"Invoice will be available after payment completion"`
    - Pending both: `"Invoice will be available after order delivery and payment completion"`
- **If BOTH conditions ARE met**:
  - The button is **enabled** and directly streams/downloads `Invoice-VH-[orderId].pdf`.

### 2. Admin Packing Slip Rules
- **Accessible for any order at ANY stage** (including `pending`, `confirmed`, `packed`, `shipped`, COD, or Pre-paid).
- Designed specifically for warehouse fulfillment staff to pack products into shipping boxes before payment/delivery completion.
- Excludes sensitive financial totals and includes product checklist, quantities, MRPs, delivery address, and customer contact details.

---

## 🏗️ System Architecture & Workflow

```
                               ┌─────────────────────────────┐
                               │   Customer / Admin Views    │
                               │   Order Details             │
                               └──────────────┬──────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
                    ▼                                                   ▼
       [ Incomplete: Not Delivered/Paid ]                      [ Complete: Delivered & Paid ]
                    │                                                   │
                    ▼                                                   ▼
      Button Disabled with Reason Text:                   Button Enabled: "Download Tax Invoice (PDF)"
      "Invoice available after delivery..."                             │
                                                                        ▼
                                                        Click -> GET /api/orders/[orderId]/invoice
                                                                        │
                                                        ┌───────────────┴───────────────┐
                                                        │ Server-Side PDF Endpoint      │
                                                        │ 1. Verify Bearer JWT Token    │
                                                        │ 2. Verify status == delivered │
                                                        │    && payment_status == paid  │
                                                        │ 3. Generate & Stream PDF      │
                                                        └───────────────┬───────────────┘
                                                                        │
                                                                        ▼
                                                         Direct Download PDF File
```

---

## 📦 File Modification & Creation Index

| Target Application | File Path | Action | Description |
| :--- | :--- | :--- | :--- |
| **`vanodhan-herbs`** | [`src/app/api/orders/[orderId]/invoice/route.js`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/api/orders/[orderId]/invoice/route.js) | `[NEW]` | Server-side PDF invoice generator endpoint with strict delivery & payment verification. |
| **`vanodhan-herbs`** | [`src/app/orders/[orderId]/page.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/app/orders/[orderId]/page.jsx) | `[MODIFY]` | Add status-aware Tax Invoice download button with disabled reason messaging. |
| **`vanodhan-herbs-admin`** | [`src/components/admin/AdminPackingSlipModal.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs-admin/src/components/admin/AdminPackingSlipModal.jsx) | `[NEW]` | Printable/downloadable warehouse packing slip modal & PDF layout. |
| **`vanodhan-herbs-admin`** | [`src/components/admin/OrderDetailsModal.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs-admin/src/components/admin/OrderDetailsModal.jsx) | `[MODIFY]` | Add "Print Packing Slip" (always available) & "Download Tax Invoice" (status-restricted) buttons. |
| **`vanodhan-herbs`** | [`Docs/authworkdone.md`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/Docs/authworkdone.md) | `[MODIFY]` | Audit log tracking all file changes. |
