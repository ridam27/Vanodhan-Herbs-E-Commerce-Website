# 🌿 Vanodhan Herbs — Customer E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

**Vanodhan Herbs** is a modern, high-performance customer-facing e-commerce application crafted for authentic Ayurvedic formulations, herbal teas, wellness powders, and organic remedies. Built on top of **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Supabase**, it delivers an intuitive shopping experience, dynamic product filtering, seamless checkout with payment gateway support, customer account management, and a dedicated customer support ticketing portal.

---

## 🚀 Key Modules & Capabilities

### 🛍️ Storefront & Product Catalog (`/shop`, `/product/[slug]`)
- **Catalog & Search**: Filter products by category, price range, and stock availability with real-time search and sorting.
- **Product Showcase**: Detailed pages with ingredients, usage dosage, image gallery carousel ([`ProductGallery.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/components/ProductGallery.jsx)), and customer reviews ([`RatingsReviews.jsx`](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/src/components/RatingsReviews.jsx)).

### 🛒 Cart & Checkout Engine (`/cart`, `/checkout`)
- **Cart Management**: Real-time quantity adjustments, subtotal updates, and coupon discount validation (`/api/validate-coupon`).
- **Payment & Order Placement**: Supports PhonePe gateway (`/api/phonepe`), Cash on Delivery (COD), and atomic stock reduction (`/api/place-order`).

### 👤 Customer Accounts & Order Tracking (`/account`, `/orders`)
- **Profile & Addresses**: Manage profile info, contact details, and saved delivery addresses (`/account`).
- **Order Tracking**: Monitor past purchases and live fulfillment status (`Pending` ➔ `Confirmed` ➔ `Packed` ➔ `Shipped` ➔ `Delivered`).

### 📞 Customer Support & Ticket Portal (`/contact`, `/contact/tickets`)
- **Smart Contact Form**: Multi-category query submission with `sessionStorage` draft auto-preservation for unauthenticated visitors.
- **Support Ticket Tracker**: Dedicated customer portal (`/contact/tickets`) to track query statuses (`Pending Review`, `Under Review`, `Resolved`) and admin responses.

### 🌿 Brand Story & Quality Pillars (`/about`)
- **Brand Heritage**: Overview of company origins, 4-pillar quality philosophy (100% Organic, Ethical Sourcing, Lab Tested, Ancient Formulations), and processing workflow.

### 🎨 Dynamic Light / Dark Aesthetic
- **Adaptive Theme System**: Smooth dark/light mode toggle with dynamic logo switching (`logo-light.png` / `logo-dark.png`) across header and footer.

---

## 🛠️ Technology Stack

| Architecture Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) (JavaScript ES6+) |
| **Core UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS Design Tokens |
| **Icons** | [React Icons](https://react-icons.github.io/react-icons/) (Feather `fi`, Lucide `lu`) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Auth JWT, Row Level Security) |
| **HTTP Client** | Axios & Fetch API |
| **Payment Gateway** | PhonePe PG API & Cash on Delivery |

---

## ⚡ Serverless API Endpoints

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/contact` | `POST` | Validates, sanitizes, rate-limits, and submits user support queries to `public.support_queries`. |
| `/api/place-order` | `POST` | Atomically creates customer order, validates stock, and records order items in database. |
| `/api/validate-coupon` | `POST` | Validates active promo codes against minimum spend rules and returns calculated discounts. |
| `/api/phonepe` | `POST` | Initiates PhonePe PG checksum generation and handles transaction status verification callbacks. |

---

## 🔒 Security & Data Integrity Standards

1. **Server-Side Auth Verification**: Serverless API routes verify Supabase Bearer JWT tokens (`supabaseAdmin.auth.getUser(token)`) prior to executing database actions.
2. **XSS Input Sanitization**: Server-side string escaping and HTML entity encoding on all user inputs (`full_name`, `phone`, `subject`, `message`).
3. **Rate Limiting**: Enforces a strict threshold of **maximum 2 ticket submissions per 15-minute window** per user/IP address.
4. **SQL Injection Defense**: All database operations rely on Supabase ORM parameterized queries to prevent SQL injection vulnerabilities.
5. **Row Level Security (RLS)**: PostgreSQL policies isolate user data so customers can only access their own orders and support tickets.

---

## 📁 Repository Structure

```text
vanodhan-herbs/
├── Docs/                                 # Technical architecture & DB documentation
│   ├── Admin_development.md              # Operations panel specs
│   ├── Contact_Form_Backend_Architecture.md # Support ticket architecture
│   ├── Vanodhan_Herbs_Master_Documentation_Volume_1.md
│   └── Database/                         # Schema & Volume 2 specs (Chapters 1–9)
├── public/                               # Brand logos, product images & assets
├── src/
│   ├── app/                              # Next.js App Router (Pages & API routes)
│   │   ├── page.js                       # Storefront Homepage
│   │   ├── about/page.jsx                # Brand Heritage page
│   │   ├── account/page.jsx              # User Account Profile page
│   │   ├── auth/                         # Authentication pages
│   │   ├── cart/page.jsx                 # Shopping Cart page
│   │   ├── checkout/page.jsx             # Checkout page
│   │   ├── contact/                      # Contact & Support Tickets
│   │   │   ├── page.jsx                  # /contact (Contact Form)
│   │   │   └── tickets/page.jsx          # /contact/tickets (Ticket Tracker)
│   │   ├── orders/page.jsx               # Order History & Tracking page
│   │   ├── shop/page.jsx                 # Product Catalog page
│   │   ├── product/[slug]/page.jsx       # Dynamic Product Details page
│   │   └── api/                          # Serverless API routes
│   │       ├── contact/route.js          # Support ticket submission endpoint
│   │       ├── phonepe/route.js          # PhonePe gateway handler
│   │       ├── place-order/route.js      # Order processing endpoint
│   │       └── validate-coupon/route.js  # Coupon validation endpoint
│   ├── components/                       # UI Components
│   │   ├── Navbar.jsx                    # Header & Theme switcher
│   │   ├── Footer.jsx                    # Footer with dynamic logo
│   │   ├── Hero.jsx                      # Hero banner carousel
│   │   ├── CategoriesSection.jsx         # Product category cards
│   │   ├── BestSellers.jsx               # Featured products grid
│   │   ├── ProductCard.jsx               # Individual product item card
│   │   ├── ShopProducts.jsx              # Catalog grid with filters & sorting
│   │   ├── ProductGallery.jsx            # Multi-image product gallery
│   │   ├── ProductShare.jsx              # Social sharing menu
│   │   ├── RatingsReviews.jsx            # Customer reviews & rating breakdown
│   │   ├── ContactForm.jsx               # Contact form with draft persistence
│   │   ├── UserSupportTickets.jsx        # Customer ticket tracking component
│   │   ├── ContactSection.jsx            # Quick contact link section
│   │   └── WhyChooseUs.jsx               # 4-pillar quality features section
│   ├── lib/                              # Supabase browser & admin client helpers
│   └── providers/                        # Global context providers
│       ├── AuthProvider.js               # Supabase Auth context
│       └── ThemeProvider.js              # Dark/Light mode context
├── package.json
├── next.config.mjs
└── postcss.config.mjs
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` (v9+) or `yarn` / `pnpm`

### 2. Clone & Install Dependencies
Navigate to the customer application directory and install NPM packages:

```bash
cd vanodhan-herbs
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the `vanodhan-herbs` root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# PhonePe Payment Gateway (Optional / Sandbox)
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Start Development Server
Run the Next.js development server on **Port 3000**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Documentation References
- 📄 [Contact Form Backend Architecture Specification](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/Docs/Contact_Form_Backend_Architecture.md)
- 📄 [Volume 2 Chapter 9 — Support Queries & Tickets DB Specification](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/Docs/Database/Vanodhan_Herbs_Volume_2_Chapter_9_Support_Queries_and_Tickets.md)
- 📄 [Master Documentation Volume 1](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/Docs/Vanodhan_Herbs_Master_Documentation_Volume_1.md)
