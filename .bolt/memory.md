# Project memory

## Product intent & audience

- Order reception app for a business (likely restaurant/food service) built with Vite + React + Supabase
- Public visitors check if the business is open and submit orders when reception is open
- Authorized admins manage reception status (open/closed) and persisted config

## Brand personality & voice

- Spanish-language interface (user communicates in Spanish)
- Clear, honest status messaging distinguishes operational states from technical errors

## Visual design & UX direction

- Order review modal ("Revisar pedido") shows business open/closed status
- Error states must be specific (config missing, server error, unexpected data) not generic
- "Enviar pedido" button stays disabled until open status is confirmed
- Admin panel has a toggle switch for reception status
- No design changes during bug fixes — preserve existing visual structure

## Decisions, constraints & rationale

- Stack: Vite + React, Tailwind CSS, Lucide React icons, `@/` import alias
- Backend: Supabase (database, auth, server functions)
- Public visitors query only open/closed status via a public RPC function with anonymous role permissions
- Admin authorization uses `admin_users` table keyed by Supabase user UUID
- Server validates open status on order creation (defense in depth)
- Error reporting now surfaces technical cause in UI + console without exposing secrets
- Config record created idempotently if missing, defaulting to closed reception
- README documents errors and fixes

## Open questions & assumptions

- Exact cause of the original error wasn't reproducible in preview; fix improves diagnostics
- Admin account creation is manual via Supabase Dashboard + SQL insert — no public self-service role assignment
- Assumed `admin_users` table exists with `user_id` column; admin role check performed server-side
- Manual steps for admin onboarding: create user in Auth, copy UUID, insert into `public.admin_users`, navigate to `/admin`