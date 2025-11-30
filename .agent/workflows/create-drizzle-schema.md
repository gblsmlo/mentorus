---
description: Create a new Drizzle ORM schema following project conventions
---

# Create Drizzle Schema Workflow

Follow these steps to create a new database table schema.

1. **Naming Convention Check**
   - File name must be **SINGULAR** (e.g., `product.ts`, not `products.ts`).
   - Table name must be **SINGULAR** (e.g., `pgTable('product', ...)`).
   - Export name must be **SINGULAR** (e.g., `export const product`).

2. **Create Schema File**
   - Location: `src/infra/db/schemas/[entity].ts`
   - Use `uuidv7` for primary keys.
   - Use `text` type for the ID.
   - Include standard audit fields if needed (`createdAt`, `updatedAt`).

   **Template:**
   ```typescript
   import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
   import { uuidv7 } from 'uuidv7'

   export const [entity] = pgTable('[entity]', {
     id: text('id')
       .primaryKey()
       .$defaultFn(() => uuidv7()),
     
     // Add your columns here
     name: text('name').notNull(),
     
     createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
     updatedAt: timestamp('updated_at', { withTimezone: true })
       .$onUpdate(() => new Date())
       .notNull(),
   })
   ```

3. **Export Schema**
   - Add export to `src/infra/db/schemas.ts`:
     ```typescript
     export * from './schemas/[entity]'
     ```

4. **Generate Migration**
   - Run: `pnpm db:generate`
   - Verify the migration file is created in `src/infra/db/migrations`.

5. **Apply Migration**
   - Run: `pnpm db:migrate`
