# Vanodhan Herbs — Admin Panel Development Specification

**Purpose:** Master handoff document for another AI/developer building the Vanodhan Herbs Admin Panel.

## 1. Core decisions

- Build the admin panel as a **separate Next.js project**.
- Do not put the primary admin panel inside the customer-facing website.
- Use the same Supabase project/database, but keep application code separate.
- Existing customer website must not be broken or unnecessarily modified.
- Existing customer authentication remains in `auth.users`.
- Roles are stored in `public.user_profiles`.
- Current roles: `customer`, `admin`, `super_admin`.
- Be brutally honest: reject insecure or architecturally weak suggestions.
- Prefer the most secure practical implementation on the first attempt.
- Never invent database columns, APIs, routes, policies, or environment variables.

## 2. Recommended project layout

```text
Projects/
├── Vanodhan-Herbs-Website/
│   └── existing customer Next.js application
└── Vanodhan-Herbs-Admin/
    └── new admin Next.js application
```

Recommended stack:

- Next.js App Router
- React
- JavaScript / JSX
- Tailwind CSS
- ESLint
- Supabase
- PostgreSQL

Create independently:

```bash
npx create-next-app@latest Vanodhan-Herbs-Admin
cd Vanodhan-Herbs-Admin
npm run dev
```

If port 3000 is occupied:

```bash
npm run dev -- -p 3001
```

## 3. Authentication and roles

Identity is Supabase Auth:

```text
auth.users
```

Role table:

```text
public.user_profiles
```

Current role values:

```text
customer
admin
super_admin
```

Conceptual authorization:

```text
Request
 ↓
Supabase authentication
 ↓
Identify user
 ↓
Read authoritative role
 ↓
Check permission
 ↓
Check business rules / ownership
 ↓
Server operation
 ↓
RLS + PostgreSQL constraints
```

Never trust:

- `role` from request body
- `user_id` from request body
- localStorage admin flags
- hidden routes
- frontend-only checks

### Customer

Can access their own addresses, cart, orders and reviews.

### Admin

Operational management such as products, orders, coupons, customers and reviews, subject to explicit permissions.

### Super Admin

Higher-risk administration such as admin/role management, security settings and audit access.

Do not make `admin` and `super_admin` identical.

## 4. RLS strategy

There are two conceptual protection layers.

### Customer RLS

Customer-owned resources should normally enforce ownership such as:

```sql
auth.uid() = user_id
```

Relevant tables include:

- `addresses`
- `cart_items`
- `orders`
- `reviews`

### Admin authorization / RLS

Admin access must be controlled using the authenticated user's authoritative role and appropriate policies.

Do **not** blindly create a universal policy such as:

```sql
role = 'admin'
```

for every table.

Policies must be designed table-by-table and operation-by-operation.

Before modifying RLS:

1. Inspect existing policies.
2. Inspect schema.
3. Identify customer website dependencies.
4. Add minimum required access.
5. Test customer behavior.
6. Test admin behavior.
7. Test unauthorized behavior.

Never disable RLS globally just to fix an application error.

## 5. Cloudflare Zero Trust

Cloudflare Zero Trust / Cloudflare Access was selected as an additional protection layer for the admin application.

A hidden URL or subdomain is **not** security.

Preferred architecture:

```text
Internet
 ↓
Cloudflare Access / Zero Trust
 ↓
Admin Next.js
 ↓
Supabase Auth
 ↓
RBAC / permissions
 ↓
Server-side authorization
 ↓
Supabase RLS
 ↓
PostgreSQL constraints
```

Recommended production controls:

- Cloudflare Access
- Administrator identity allowlist/groups
- MFA
- Access logging
- HTTPS
- session/device controls where appropriate

Cloudflare does not replace Supabase Auth or RLS.

## 6. Planned admin modules

Initial scope:

```text
Authentication
Dashboard
Products
Orders
Customers
Coupons
Reviews
```

Later:

```text
Analytics
Admin Management
Audit Logs
Settings
Inventory History
Notifications
Reports
```

Build security before dashboard features.

## 7. Dashboard

Initial metrics:

- Total orders
- Today's orders
- Revenue
- Pending orders
- Product count
- Low-stock products
- Customer count
- Active coupons

Future:

- Revenue trends
- Order trends
- Best-selling products
- Payment statistics

Use server-side aggregation and avoid loading entire datasets into the browser.

## 8. Product management

Admin should eventually manage:

- Create/edit product
- Activate/deactivate
- Price
- Discount
- Stock
- Images
- Description
- Short description
- Ingredients
- Benefits
- Usage
- Category
- Badge
- Tag

Never trust client-supplied price, discount, stock or privileged fields.

Use explicit field allowlists to prevent mass assignment.

## 9. Order management

Features:

- List/search/filter orders
- Order details
- Customer
- Items
- Shipping address where authorized
- Payment status
- Fulfilment status
- Payment method

Fulfilment:

```text
pending → confirmed → packed → shipped → delivered
                    ↘ cancelled
```

Payment is separate:

```text
pending → verifying → paid
                    ↘ failed
                    ↘ refunded
```

Never merge payment and fulfilment state.

## 10. Payment / PhonePe

Admin can view:

- payment status
- payment method
- gateway order ID
- gateway transaction ID
- PhonePe order ID

Admin frontend must not directly set payment status.

Never trust:

- redirect URLs
- query parameters
- frontend success state
- arbitrary request body

Payment must be verified server-side with the gateway.

Payment processing must be idempotent so duplicate callbacks/retries cannot create duplicate financial records.

## 11. Coupons

Manage:

- code
- description
- discount type
- discount value
- minimum order
- maximum discount
- global usage limit
- per-user limit
- start/end time
- active status
- redemption history

Existing tables:

```text
coupons
coupon_redemptions
coupon_attempts
```

Coupon validation and discount calculation must remain server-side.

Protect against coupon brute forcing and race conditions.

## 12. Customers

Admin may:

- search customers
- view customer
- view orders
- view operationally necessary information

Do not duplicate authentication data.

Do not expose unnecessary personal information.

Identity remains `auth.users`; role remains `user_profiles`.

## 13. Reviews

Admin may:

- view reviews
- moderate reviews
- remove inappropriate reviews
- investigate suspicious reviews
- view rating statistics

Consider an audit trail for moderation actions.

## 14. Important database context

Relevant tables:

```text
auth.users
user_profiles
products
addresses
cart_items
orders
order_items
coupons
coupon_redemptions
coupon_attempts
reviews
```

### Products

Important fields:

```text
id
slug
name
description
short_description
price
discount
image
images
tag
badge
rating
reviews
delivery
benefits
ingredients
usage
category
is_active
created_at
updated_at
stock_quantity
```

Constraints include:

- unique slug
- discount 0–100
- reviews >= 0
- stock >= 0
- rating 0–5
- price >= 0

Indexes include:

```text
products_slug_idx
products_active_idx
products_category_idx
```

### Orders

Important fields:

```text
id
user_id
address_id
subtotal
delivery_charge
total
status
payment_status
payment_method
created_at
updated_at
coupon_id
coupon_code
coupon_discount
gateway_order_id
gateway_transaction_id
gateway_response
phonepe_order_id
```

Never trust client totals.

### Order items

Stores purchase-time snapshots:

```text
product_name
product_image
mrp
discount
price_at_purchase
quantity
line_total
```

Historical orders must remain correct even when current products change.

### Cart

`cart_items`:

```text
id
user_id
product_id
quantity
created_at
updated_at
```

Constraints:

- quantity > 0
- quantity <= 20
- unique `(user_id, product_id)`

### Addresses

Important fields:

```text
id
user_id
full_name
phone
address_line_1
address_line_2
city
state
pincode
country
is_default
created_at
updated_at
```

There is a partial unique index for one default address per user.

### Coupons

Important fields:

```text
id
code
description
discount_type
discount_value
min_order_amount
max_discount
usage_limit
used_count
per_user_limit
starts_at
expires_at
is_active
created_at
updated_at
```

Types:

```text
percentage
fixed
```

## 15. Security threat model

Explicitly defend against:

- SQL injection
- XSS
- CSRF
- SSRF
- authentication bypass
- authorization bypass
- privilege escalation
- IDOR/BOLA
- session theft
- session fixation
- replay attacks
- brute force
- credential stuffing
- OTP abuse
- coupon abuse
- malicious file uploads
- path traversal
- open redirects
- mass assignment
- parameter tampering
- payment manipulation
- race conditions
- duplicate callbacks
- information leakage
- secret exposure
- dependency vulnerabilities

## 16. SQL injection

Use Supabase parameterized query APIs.

Never concatenate user input into SQL:

```js
`SELECT * FROM orders WHERE id = '${id}'`
```

If raw SQL is genuinely required, parameterize it through a trusted server-side mechanism.

## 17. XSS

Treat all database/user content as untrusted:

- product descriptions
- coupon descriptions
- reviews
- names
- addresses

Avoid `dangerouslySetInnerHTML`. If absolutely required, sanitize content.

## 18. IDOR / BOLA

Knowing an order/resource UUID must never be enough to access it.

Every resource access requires:

```text
resource
 ↓
ownership or admin permission check
```

## 19. Mass assignment

Never blindly update with an entire request body.

Use explicit allowlists:

```text
Allowed product fields:
name
description
price
discount
stock_quantity
...
```

Do not allow clients to alter:

```text
id
created_at
payment_status
ownership fields
audit fields
```

unless explicitly authorized.

## 20. Secrets

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
PHONEPE_SECRET
PHONEPE_CLIENT_SECRET
Cloudflare secrets
```

in:

```text
NEXT_PUBLIC_*
client components
browser bundles
Git
```

Use `.env.local` locally and secure deployment environment variables in production.

The Supabase service-role key must remain server-only.

## 21. Session security

Do not store privileged tokens in:

```text
localStorage
sessionStorage
URLs
```

Use HTTPS and secure cookie/session mechanisms.

Production OAuth redirect URLs must not be hardcoded to localhost.

## 22. Validation

Validate every server/API input:

- type
- length
- format
- range
- enum
- required fields
- business rules

Examples:

```text
price >= 0
discount 0–100
stock >= 0
quantity 1–20
rating 1–5
pincode exactly 6 digits
```

Frontend validation is only a UX layer.

## 23. Rate limiting

Protect:

- login
- OTP
- recovery
- coupon endpoints
- product mutations
- order mutations
- bulk operations
- expensive searches
- analytics

Cloudflare can provide an additional edge protection layer.

## 24. Audit logging

Strongly recommended.

Record sensitive admin actions:

```text
admin login
role changes
product create/update/deactivate
price changes
stock changes
coupon create/update
order status changes
manual administrative actions
```

Possible future table:

```text
admin_audit_logs
```

Potential fields:

```text
id
actor_user_id
action
resource_type
resource_id
metadata
created_at
```

Keep audit logs protected from ordinary administrators.

## 25. Delete strategy

Avoid hard deleting business-critical records.

Prefer deactivation/archival for catalogue and operational data.

Orders and financial history should remain traceable.

## 26. Server/client separation

Client code:

- UI
- forms
- interaction
- display state

Server code:

- privileged DB access
- authorization
- secrets
- business logic
- payment operations
- sensitive mutations

Never import privileged server-only clients into client components.

## 27. Middleware

Middleware can protect routes early, but it is not the only authorization mechanism.

Sensitive server actions/API routes must independently verify authorization.

Recommended protected routes:

```text
/dashboard
/products
/orders
/customers
/coupons
/reviews
/settings
```

Behavior:

```text
Unauthenticated → login
Customer → denied
Admin → permitted by permission
Super Admin → permitted for elevated operations
```

## 28. Permissions

Initial roles:

```text
customer
admin
super_admin
```

Future granular permissions may include:

```text
products.read
products.write
orders.read
orders.update
customers.read
coupons.read
coupons.write
reviews.moderate
admins.manage
settings.manage
```

Do not over-engineer granular permissions until required.

## 29. API security

Every sensitive API should follow:

```text
Authenticate
 ↓
Authorize
 ↓
Validate input
 ↓
Check ownership/business rules
 ↓
Execute
 ↓
Return minimum required data
```

Use appropriate status codes and generic user-facing errors.

Never expose raw PostgreSQL errors to users.

## 30. Database transaction safety

Operations such as:

```text
create order
+ create order items
+ update inventory
+ record coupon redemption
```

must be designed for atomicity where appropriate.

Protect against race conditions in:

- stock
- coupon usage
- payments
- duplicate callbacks
- order creation

Use transactions/atomic database operations and unique constraints as appropriate.

## 31. File uploads

If product image uploads are added:

- whitelist file types
- validate actual file content
- limit file size
- generate safe filenames
- prevent path traversal
- reject executable files
- use controlled storage
- consider image reprocessing
- do not trust file extensions

## 32. Security headers

Production should consider:

- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security
- clickjacking protection / `frame-ancestors`

Configure CSP carefully.

## 33. Data minimization

Only send what the admin page requires.

Do not expose:

- full auth metadata unnecessarily
- complete payment gateway payloads unnecessarily
- unrelated customer data
- service secrets

## 34. Performance

Use:

- pagination
- indexed searches
- server-side filtering
- server-side search
- minimal payloads
- appropriate joins
- measured indexes

Do not load all customers/orders into the browser.

Do not add indexes blindly; measure actual queries.

## 35. Bulk operations

Bulk operations require:

- explicit authorization
- limits
- validation
- transaction safety where appropriate
- audit logging
- confirmation UI

Never expose arbitrary SQL-like bulk operations.

## 36. Testing

Before production test:

### Authentication

- unauthenticated
- valid admin
- valid super-admin
- customer attempting admin
- expired session
- logout/relogin

### Authorization

- allowed admin action
- denied super-admin action
- manipulated role
- manipulated user ID
- manipulated resource ID

### Database

- RLS
- foreign keys
- constraints
- duplicate records
- invalid values

### Security

- SQL injection payloads
- XSS payloads
- IDOR/BOLA
- CSRF where applicable
- mass assignment
- brute-force/rate limits
- malicious uploads
- open redirects

### Business logic

- coupon limits
- stock races
- duplicate payments
- duplicate orders
- invalid status transitions

## 37. Development order

### Phase 1

1. Create separate project
2. Configure Next.js
3. Configure Supabase
4. Configure environment variables
5. Establish server/client boundaries

### Phase 2

6. Admin authentication
7. Server-side role verification
8. Authorization utilities
9. Middleware/route protection
10. RLS verification
11. Cloudflare Zero Trust plan
12. Security headers
13. Rate limiting

### Phase 3

14. Admin layout
15. Dashboard
16. Products
17. Orders
18. Customers
19. Coupons
20. Reviews

### Phase 4

21. Audit logs
22. Error handling
23. Structured logging
24. Monitoring
25. Backup/recovery

### Phase 5

26. Pagination/search optimization
27. Analytics
28. Performance tuning

## 38. Customer website isolation

Do not unnecessarily modify:

- customer routes
- customer components
- customer auth
- PhonePe flow
- customer RLS
- customer APIs

Before any shared database change, determine whether it affects the customer application.

## 39. Cloudflare + Supabase defense-in-depth

Final target:

```text
Internet
 ↓
Cloudflare Zero Trust / Access
 ↓
Admin Next.js
 ↓
Supabase Auth
 ↓
RBAC / permissions
 ↓
Server authorization
 ↓
Supabase RLS
 ↓
PostgreSQL constraints
```

Each layer has a distinct responsibility:

| Layer | Responsibility |
|---|---|
| Cloudflare Zero Trust | Restrict who can reach admin |
| Supabase Auth | Identity |
| RBAC | Role/permission |
| Next.js server | Business authorization |
| RLS | Database access |
| PostgreSQL | Data integrity |
| Validation | Input correctness |
| Rate limiting | Abuse reduction |
| Audit logs | Accountability |
| Monitoring | Detection |

## 40. Final production checklist

```text
[ ] Separate admin Next.js project
[ ] Admin authentication
[ ] Authoritative role verification
[ ] Super-admin protection
[ ] Protected routes
[ ] Server-side authorization
[ ] Correct RLS policies
[ ] Service key never reaches browser
[ ] No secrets in Git
[ ] Cloudflare Zero Trust
[ ] MFA for administrators
[ ] Rate limiting
[ ] Security headers
[ ] Input validation
[ ] SQL injection protection
[ ] XSS protection
[ ] IDOR/BOLA protection
[ ] CSRF considerations
[ ] Audit logging
[ ] Safe error handling
[ ] Payment protection
[ ] Coupon abuse protection
[ ] Stock race protection
[ ] Duplicate payment protection
[ ] Pagination
[ ] Search/filtering
[ ] Backup strategy
[ ] Monitoring
[ ] HTTPS
[ ] Security testing
```

## 41. AI handoff rules

Before writing code, the AI must inspect:

- repository
- package.json
- Next.js version
- Supabase setup
- environment variables
- database schema
- existing RLS policies
- existing APIs where relevant

The AI must:

- give complete runnable files
- verify imports
- verify paths
- state where commands run
- separate migration SQL from application code
- avoid destructive changes without approval
- avoid invented APIs/columns
- check client/server boundaries
- check authorization
- check RLS compatibility
- perform a security review before presenting implementation

If something cannot be verified, say so rather than guessing.

## 42. Most important security rule

If the admin frontend is completely compromised, the attacker should still encounter independent barriers:

```text
Cloudflare Access
 ↓
Authentication
 ↓
RBAC
 ↓
Server authorization
 ↓
RLS
 ↓
Database constraints
 ↓
Rate limiting / monitoring
```

Do not rely on a single security control.

## 43. Final implementation philosophy

Build the security architecture first and the dashboard UI second.

Correct sequence:

```text
Separate project
 ↓
Supabase
 ↓
Authentication
 ↓
Role verification
 ↓
Authorization
 ↓
RLS
 ↓
Cloudflare Zero Trust
 ↓
Protected admin shell
 ↓
Security tests
 ↓
Dashboard
 ↓
Products / Orders / Customers / Coupons / Reviews
```

**Do not start by building attractive CRUD screens and add security afterward.**
