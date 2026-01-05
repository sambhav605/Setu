# Database Migrations

This directory contains SQL migration scripts for the Setu (Nepal Justice Weaver) platform.

## Directory Structure

```
database/
└── migrations/
    ├── README.md                      # This file
    ├── 001_create_chat_tables.sql    # Chat persistence schema
    └── [future migrations...]
```

## How to Apply Migrations

### Option 1: Via Supabase Dashboard (Recommended)

1. **Login to your Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste SQL**
   - Open the migration file (e.g., `001_create_chat_tables.sql`)
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press `Ctrl+Enter`
   - Wait for success message

5. **Verify**
   - Go to "Table Editor" in the left sidebar
   - You should see:
     - `chat_conversations`
     - `chat_messages`

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run migration
supabase db push --file database/migrations/001_create_chat_tables.sql
```

### Option 3: Via Python Script

```python
from supabase import create_client
import os

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(supabase_url, supabase_key)

# Read SQL file
with open("database/migrations/001_create_chat_tables.sql", "r") as f:
    sql = f.read()

# Execute (Note: Supabase Python client doesn't support raw SQL directly,
# so use the dashboard method instead)
```

## Migration Files

### 001_create_chat_tables.sql

**Purpose**: Creates the database schema for chat persistence

**What it creates**:
- `chat_conversations` table - Stores conversation metadata
- `chat_messages` table - Stores individual messages
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Automatic timestamp update trigger

**Tables Created**:

#### `chat_conversations`
| Column      | Type        | Description                              |
|-------------|-------------|------------------------------------------|
| id          | UUID        | Primary key (auto-generated)             |
| user_id     | UUID        | Foreign key to auth.users(id)            |
| title       | TEXT        | Conversation title                       |
| created_at  | TIMESTAMPTZ | Creation timestamp                       |
| updated_at  | TIMESTAMPTZ | Last update timestamp (auto-updated)     |

#### `chat_messages`
| Column          | Type        | Description                              |
|-----------------|-------------|------------------------------------------|
| id              | UUID        | Primary key (auto-generated)             |
| conversation_id | UUID        | Foreign key to chat_conversations(id)    |
| role            | TEXT        | 'user' or 'assistant'                    |
| content         | TEXT        | Message content                          |
| timestamp       | TIMESTAMPTZ | Message timestamp                        |
| metadata        | JSONB       | Optional metadata (sources, tokens, etc.)|

**Security Features**:
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own conversations
- ✅ Cascade delete (deleting user → deletes conversations → deletes messages)
- ✅ Check constraints on role field

## Verification

After running the migration, verify it worked:

### Check Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('chat_conversations', 'chat_messages');
```

Expected output:
```
table_name
------------------
chat_conversations
chat_messages
```

### Check Indexes

```sql
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('chat_conversations', 'chat_messages');
```

### Check RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('chat_conversations', 'chat_messages');
```

Expected output:
```
tablename            | rowsecurity
---------------------+-------------
chat_conversations   | t
chat_messages        | t
```

### Test Insert (Optional)

```sql
-- Insert a test conversation (replace with your user ID from auth.users)
INSERT INTO public.chat_conversations (user_id, title)
VALUES ('your-user-id-here', 'Test Conversation')
RETURNING *;

-- Get the conversation ID from the result above, then:
INSERT INTO public.chat_messages (conversation_id, role, content)
VALUES
    ('conversation-id-here', 'user', 'Test user message'),
    ('conversation-id-here', 'assistant', 'Test assistant response')
RETURNING *;
```

## Rollback (If Needed)

To remove the chat tables:

```sql
-- Drop tables (cascade will remove dependent objects)
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_conversations CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS public.update_conversation_updated_at() CASCADE;
```

## Integration with Production

When ready to integrate with the production database:

1. **Run the migration on production Supabase**
   ```bash
   # Use the same SQL file on production instance
   # Just run 001_create_chat_tables.sql in production SQL Editor
   ```

2. **Update .env with production credentials**
   ```env
   SUPABASE_URL=https://production-project-id.supabase.co
   SUPABASE_ANON_KEY=production_anon_key
   SUPABASE_SERVICE_ROLE_KEY=production_service_role_key
   ```

3. **No code changes needed**
   - The API routes automatically use environment variables
   - Same table structure works identically

## Troubleshooting

### Error: "permission denied for schema public"
**Solution**: Make sure you're using the `service_role` key, not the `anon` key

### Error: "relation already exists"
**Solution**: Tables already exist. Either drop them first or skip re-running migration

### Error: "function uuid_generate_v4() does not exist"
**Solution**: Run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` first

### RLS blocking queries in SQL Editor
**Solution**: In SQL Editor, queries run as the service role and bypass RLS. If testing RLS, use the API routes instead.

## Future Migrations

When adding new migrations:
1. Create a new file: `002_migration_name.sql`
2. Follow the same structure
3. Document changes in this README
4. Always include rollback instructions

## Support

For questions or issues:
- Check the main project README
- Review Supabase documentation: https://supabase.com/docs
- Contact the development team
