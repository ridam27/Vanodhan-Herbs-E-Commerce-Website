# 🌿 Vanodhan Herbs — Authentic Ayurvedic E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

**Vanodhan Herbs** is a modern, premium e-commerce web application crafted for authentic Ayurvedic and herbal wellness products. Built with Next.js App Router, Tailwind CSS, and Supabase, it offers a seamless shopping experience, real-time cart and order management, dynamic light/dark mode styling, and an integrated customer support ticketing portal.

---

## 🚀 Key Features

### 🛍️ E-Commerce & Shopping Experience
- **Dynamic Product Catalog (`/shop`)**: Filter and search through authentic herbal products, powders, oils, and Ayurvedic formulations.
- **Detailed Product Pages (`/product/[slug]`)**: Dosage instructions, ingredients list, customer reviews, and usage guidance.
- **Cart & Checkout Flow (`/cart`, `/checkout`)**: Real-time quantity validation, coupon redemption engine, and PhonePe / Cash on Delivery payment gateways.

### 📜 Brand Story & Heritage (`/about`)
- **Interactive About Page**: Features company statistics, 4-pillar quality philosophy (100% Organic, Ethical Sourcing, Lab Tested, Ancient Formulations), 4-step processing timeline, and custom ambient primary gradient cards.

### 📞 Contact & Customer Support Portal (`/contact`, `/contact/tickets`)
- **Interactive Contact Form**: Category selector (*General Inquiry*, *Order Status & Shipping*, *Payment Status & Failure*, *Herbal Usage Advice*, *Wholesale & Bulk Orders*).
- **Zero Data-Loss Draft Preservation**: Unauthenticated submit attempts automatically store typed text in `sessionStorage` (`vanodhan_contact_draft`) with an instant login modal prompt and auto-rehydration upon authentication return.
- **Dedicated Ticket Portal (`/contact/tickets`)**: Real-time customer support portal where users track past queries, status badges (`Pending Review`, `Under Review`, `Resolved`), and read official responses from the Vanodhan Herbs specialist team (`admin_notes`).
- **Store Map & FAQs**: Wardha store address, Google Maps directions link, and expandable FAQ accordion.

### 🎨 Premium Aesthetics & UX
- **Dynamic Dark/Light Mode**: Automatic theme switching across all components, including dynamic logo swapping in Navbar and Footer (`/logo-light.png` and `/logo-dark.png`).
- **Rich Motion & Micro-Animations**: Smooth glassmorphism, responsive hover states, ambient glowing backdrops, and mobile-friendly responsive navigation.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js App Router](https://nextjs.org/) (JavaScript / JSX) |
| **Styling** | Vanilla CSS Tokens + [Tailwind CSS](https://tailwindcss.com/) |
| **Icons** | [React Icons](https://react-icons.github.io/react-icons/) (Feather Icons `fi`) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Auth JWT, Row Level Security) |
| **API Architecture** | Next.js Serverless API Routes (`/api/contact`, etc.) |

---

## 🔒 Security & Data Integrity Standards

- **Server-Side Auth Verification**: Serverless API routes verify Supabase Bearer JWT tokens (`supabaseAdmin.auth.getUser(token)`) before executing database insertions.
- **XSS HTML Sanitization**: Server-side string escaping on all user inputs (`full_name`, `phone`, `subject`, `message`).
- **Rate Limiting**: Enforces a maximum of **2 ticket submissions per 15-minute window** per user/IP address.
- **Parameterized Queries**: All database queries utilize Supabase SDK methods to eliminate raw SQL string concatenation and prevent SQL injection.

---

## 📁 Repository Structure

```text
vanodhan-herbs/
├── Docs/                                 # Architectural specifications & DB setup scripts
│   ├── Contact_Form_Backend_Architecture.md
│   ├── Admin_Support_Queries_Database_Setup.sql
│   └── Database/                         # Volume 2 Database Documentation (Chapters 1–9)
├── public/                               # Static images, product assets & brand logos
├── src/
│   ├── app/                              # Next.js App Router pages & API routes
│   │   ├── page.jsx                      # Homepage
│   │   ├── about/page.jsx                # About Us page
│   │   ├── contact/                      # Contact page & dedicated tickets portal
│   │   │   ├── page.jsx                  # /contact
│   │   │   └── tickets/page.jsx          # /contact/tickets
│   │   ├── api/contact/route.js          # Serverless contact API route
│   │   ├── shop/page.jsx                 # Product Catalog
│   │   └── product/[slug]/page.jsx       # Product Details
│   ├── components/                       # Reusable UI components
│   │   ├── Navbar.jsx                    # Header & Theme switcher
│   │   ├── Footer.jsx                    # Dynamic footer
│   │   ├── ContactForm.jsx               # Contact form with draft persistence
│   │   ├── UserSupportTickets.jsx        # Support ticket tracker component
│   │   └── ContactSection.jsx            # Form & ticket tracking link card
│   ├── lib/                              # Supabase browser client helpers
│   └── providers/                        # Auth & Theme context providers
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn

### 2. Clone & Install Dependencies
```bash
cd vanodhan-herbs
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root of `vanodhan-herbs`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Documentation References
- [Contact Form Backend Architecture](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/Docs/Contact_Form_Backend_Architecture.md)
- [Volume 2 Chapter 9 — Support Queries & Tickets DB Specification](file:///c:/Users/HP/Desktop/Github/Vanodhan-Herbs-E-Commerce-Website/vanodhan-herbs/Docs/Database/Vanodhan_Herbs_Volume_2_Chapter_9_Support_Queries_and_Tickets.md)
