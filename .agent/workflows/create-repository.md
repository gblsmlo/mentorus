---
description: Create a new Repository to encapsulate database logic
---

# Create Repository Workflow

Follow these steps to create a new repository.

1. **Determine Location**
   - Path: `src/modules/[module]/repositories/[entity]-repository.ts`
   - If `repositories` folder doesn't exist, create it.

2. **Create Repository File**
   - Class name: `[Entity]Repository`
   - Methods should be descriptive (e.g., `findById`, `create`, `updateStatus`).
   - Use Drizzle `db` instance.

   **Template:**
   ```typescript
   import { db } from '@infra/db/client'
   import { [entity] } from '@infra/db/schemas'
   import { eq } from 'drizzle-orm'

   export class [Entity]Repository {
     async findById(id: string) {
       return await db.query.[entity].findFirst({
         where: eq([entity].id, id),
       })
     }

     async create(data: typeof [entity].$inferInsert) {
       const [created] = await db.insert([entity]).values(data).returning()
       return created
     }

     // Add other methods
   }

   export const [entity]Repository = new [Entity]Repository()
   ```

3. **Usage Rule**
   - Server Actions should call Repositories, NOT `db` directly.