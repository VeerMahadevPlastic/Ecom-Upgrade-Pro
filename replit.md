# Veer Mahadev Plastic — B2B Wholesale Store

A professional B2B wholesale e-commerce website for **Veer Mahadev Plastic (VMP)**, a biodegradable and plastic food packaging manufacturer.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/vmp-store run dev` — run the storefront (port 18133, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui
- API: Express 5, OpenAPI-first (Orval codegen)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle for API)

## Where things live

- `artifacts/vmp-store/` — React storefront
  - `src/pages/` — Home, Products, ProductDetail, Checkout
  - `src/components/layout/` — Header (search+autocomplete+currency), CartDrawer, Footer, Layout
  - `src/contexts/` — CartContext (localStorage), CurrencyContext (localStorage)
  - `src/lib/pricing.ts` — Tier pricing logic (retail/bulk/10+ cartons/25+ cartons)
  - `src/lib/currency.ts` — INR/USD/GBP/TRY/RUB conversion
- `artifacts/api-server/` — Express API
  - `src/routes/products.ts` — GET /products (search+filter), GET /products/stats, GET /products/search-suggestions, GET /products/:id
  - `src/routes/categories.ts` — GET /categories
  - `src/routes/enquiries.ts` — POST /enquiries (creates enquiry + WhatsApp URL)
- `lib/db/src/schema/` — Drizzle schema (products, enquiries tables)
- `lib/api-spec/openapi.yaml` — OpenAPI 3.1 spec (source of truth)
- `lib/api-client-react/src/generated/` — Orval-generated React Query hooks

## Architecture decisions

- Contract-first: OpenAPI spec → Orval codegen → typed React Query hooks + Zod schemas used server-side
- WhatsApp checkout: No payment processing — enquiry saved to DB, formatted WhatsApp message opened in new tab
- Currency conversion: Client-side only (rates hardcoded in `lib/currency.ts` and `routes/enquiries.ts`)
- Cart: localStorage-persisted, no server-side session required
- Tier pricing: retail=pieceRate, bulk=boxRate÷packingQty, 10+ cartons=3% off, 25+ cartons=5% off

## Product catalog

- 107 products across 8 categories seeded from VMP price list
- Categories: Cornstarch Meal Tray with Lid, Cornstarch Container, Cornstarch Bowl & Cutlery, Biodegradable Glass & Bowl, Meal Tray, Hinged Box & Sauce Cup, Bakery Hinged Box, PET & PP Container

## TODO before going live

- Replace WhatsApp number `919XXXXXXXXX` in `artifacts/api-server/src/routes/enquiries.ts`
- Update currency rates in `lib/api-client-react/src/lib/currency.ts` and `artifacts/api-server/src/routes/enquiries.ts`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After editing API routes, restart the `artifacts/api-server: API Server` workflow to trigger esbuild rebuild
- Google Fonts `@import` must be first line in `index.css` (before Tailwind imports) to avoid PostCSS errors
- `useListProducts` not `useGetProducts`, `useListCategories` not `useGetCategories`, `useGetProduct` not `useGetProductById`, `useSubmitEnquiry` not `useCreateEnquiry` — check generated hooks before using
