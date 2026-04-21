# Green Store Backend (MySQL Mirror)

This folder is a backend-focused mirror of the current project backend.
It keeps the same API route structure and flow, and only changes what is required for MySQL compatibility.

## Structure

- `src/app/api/**/route.ts`: API handlers (mirrored)
- `src/lib/db.ts`: shared MySQL query helper
- `middleware.ts`: API auth gate behavior
- `mysql.sql`: MySQL source-of-truth schema
- `sql/alter_orders_add_payment.sql`: MySQL migration script

## Local run

1. Copy `.env.example` to `.env.local` and fill values.
2. Install deps:
   - `npm install`
3. Initialize DB schema:
   - `npm run db:init`
4. Optional migration script:
   - `npm run db:migrate:orders`
5. Start backend:
   - `npm run dev`

## Notes

- This backend mirror prioritizes parity with the original codebase.
- Database structure must follow `mysql.sql`.
- API contracts are preserved.
