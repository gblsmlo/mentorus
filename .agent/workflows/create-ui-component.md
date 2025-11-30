---
description: Create a new UI Component (Shadcn/Radix compatible)
---

# Create UI Component Workflow

Follow these steps to create a reusable UI component.

1. **Determine Type**
   - **Primitive**: Reusable base component (e.g., Button, Input). Place in `src/components/ui`.
   - **Module Component**: Specific to a feature. Place in `src/modules/[module]/components`.

2. **Client vs Server**
   - Use `'use client'` only if using hooks (useState, useEffect) or event listeners.
   - Prefer Server Components for data fetching.

3. **Create Component File**
   - Use `kebab-case` for filenames (e.g., `user-card.tsx`).
   - Use `PascalCase` for component names (e.g., `UserCard`).
   - Export named function.

   **Template:**
   ```tsx
   import { cn } from '@lib/utils'

   interface [Name]Props extends React.HTMLAttributes<HTMLDivElement> {
     // Add props
   }

   export function [Name]({ className, ...props }: [Name]Props) {
     return (
       <div className={cn('base-styles', className)} {...props}>
         {/* Content */}
       </div>
     )
   }
   ```

4. **Shadcn Integration**
   - If wrapping a Shadcn component, ensure it accepts `className` and uses `cn()` utility.