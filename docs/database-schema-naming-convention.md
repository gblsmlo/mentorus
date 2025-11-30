# Database Schema Naming Convention

## Table & Schema Rules

### Naming Standards
- **Table names**: SINGULAR (e.g., `user`, `resume`, `job`)
- **Schema file names**: SINGULAR (e.g., `user.ts`, `resume.ts`)
- **Export const names**: SINGULAR (e.g., `export const user`)
- **Primary keys**: Use `text` type with `uuidv7()` generator

### Pattern
```typescript
// ✅ CORRECT
export const user = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
})

// ❌ WRONG
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
})
```

### Rationale
1. **Consistency** - Match existing core tables (`user`, `account`, `session`)
2. **Clarity** - Singular names represent individual records
3. **UUID v7** - Better for distributed systems and time-ordered IDs
4. **ORM Convention** - Drizzle and most ORMs expect singular table names

### Checklist Before Creating Schema
- [ ] Table name is singular
- [ ] File name matches table name (singular)
- [ ] Export const name matches table name
- [ ] Primary key uses `text` + `uuidv7()`
- [ ] Foreign keys reference singular table names
- [ ] No duplicate plural/singular versions exist
