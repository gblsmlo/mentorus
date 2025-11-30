---
description: Create a new Server Action with validation and auth
---

# Create Server Action Workflow

Follow these steps to create a secure server action.

1. **Determine Location**
   - Path: `src/modules/[module]/actions/[action-name].ts`

2. **Define Validation Schema**
   - Create a Zod schema for input validation.
   - Place schema in `src/modules/[module]/schemas/` if reused, or inline if specific.

3. **Create Action File**
   - Must be `'use server'`.
   - Must validate authentication using `authServer`.
   - Must validate input using Zod.
   - Should use **Repositories** for DB access.

   **Template:**
   ```typescript
   'use server'

   import { z } from 'zod'
   import { authServer } from '@modules/auth/server'
   import { [entity]Repository } from '../repositories/[entity]-repository'
   import { revalidatePath } from 'next/cache'

   const [action]Schema = z.object({
     // Define fields
   })

   export async function [actionName](data: z.infer<typeof [action]Schema>) {
     // 1. Auth Check
     const session = await authServer.getSession()
     if (!session) {
       throw new Error('Unauthorized')
     }

     // 2. Input Validation
     const validated = [action]Schema.parse(data)

     // 3. Logic (via Repository)
     const result = await [entity]Repository.create({
       ...validated,
       userId: session.user.id,
     })

     // 4. Revalidate
     revalidatePath('/[route]')

     return result
   }
   ```