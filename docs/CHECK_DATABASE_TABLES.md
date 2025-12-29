# Check What Tables Exist

Run this in Supabase SQL Editor to see what tables you have:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

This will show you all your tables.

## Expected Tables

You should have:
- `profiles`
- `inventory_items`
- `jobs`
- `transactions`
- `kits` (optional)

## If Tables Are Missing

If you don't have these tables, you need to create your initial database schema first before adding multi-tenancy.

Let me know what tables you see and I'll help you create the missing ones.
