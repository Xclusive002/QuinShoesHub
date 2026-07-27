# Quinn Shoes Hub

Quinn Shoes Hub is a polished e-commerce storefront and admin dashboard built with Next.js, Prisma, SQLite, and Tailwind CSS. The project is designed to feel like a modern online shoe shop with a customer-facing storefront, a member account experience, and a simple admin console for managing products and store operations.

## What this project includes

- A public storefront with a landing page, product browsing, and product detail views
- A shop experience with product cards, filters, and product information
- A member account area for profile details, saved products, and order tracking
- An admin dashboard for products, categories, orders, promotions, users, and notifications
- A local SQLite database powered by Prisma for fast local development

## Tech stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Lucide icons

## Quick start

1. Install dependencies
   ```bash
   npm install
   ```

2. Make sure the database is available
   ```bash
   npx prisma db push
   ```

3. Start the app locally
   ```bash
   npm run dev
   ```

4. Open the app in your browser at
   ```text
   http://localhost:3000
   ```

## Site walkthrough

### 1. Browse the storefront

The homepage introduces the shop and gives visitors a quick entry point into the main catalog. From there, the shop page shows products in a clean gallery layout, with room for searches, category navigation, and product details.

### 2. Explore products

Each product card leads to a dedicated product page where visitors can review the item, see images, and browse available sizes and colors. This is the main place for product storytelling and buying intent.

### 3. Create or use a member account

Visitors can open the account area to sign in or create a profile. Once signed in, the account page shows saved items, order history, tracking details, and profile information that can be updated directly.

### 4. Use the cart and account flow

The cart and account areas are designed to support the shopping journey from browsing to order management. The experience is intentionally simple and focused on clarity, making it a strong foundation for a real storefront.

### 5. Manage the store from the admin dashboard

The admin area is available under the admin routes and includes a dashboard overview and sections for:

- Products
- Categories
- Orders
- Promotions
- Users
- Notifications

From the products section, admins can add or edit catalog items, manage stock, and maintain the look of the storefront.

## Project structure

- app/ - main app routes and pages
- components/ - reusable UI pieces such as navigation, storefront sections, and the auth modal
- lib/ - shared logic for auth, products, Prisma, and account helpers
- prisma/ - Prisma schema and database configuration
- public/ - static assets and images

## Database notes

This project uses SQLite by default for local development. The Prisma schema is stored in the prisma folder and the database is written to a local SQLite file in the project.

## Notes for contributors

- The admin and storefront flows are separated into different route groups, which makes it easier to develop and maintain each experience independently.
- The app is intentionally built as a local-first demo, so it is easy to run and test without a cloud database setup.
- If you want to expand the shop, the most natural next steps are adding real checkout flows, richer product media, and a more advanced admin workflow.

## Summary

Quinn Shoes Hub is a compact but complete storefront experience for a modern shoe business. It combines a clean customer experience with enough admin tooling to manage products, categories, and store activity from one local project.
