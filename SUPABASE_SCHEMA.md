# Supabase Database Schema

This schema is reconstructed from the TypeScript types in
`src/lib/supabase/types.ts`.

```sql
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Pages table
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- references auth.users(id)
  title TEXT DEFAULT 'Untitled' NOT NULL,
  content JSONB,
  icon TEXT,
  cover_image TEXT,
  parent_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0 NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- references auth.users(id)
  name TEXT NOT NULL,
  color TEXT DEFAULT 'default' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Page Tags (Many-to-Many junction)
CREATE TABLE public.page_tags (
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (page_id, tag_id)
);

-- Enabling Row Level Security (Recommended)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_tags ENABLE ROW LEVEL SECURITY;
```

## How to extract directly from Supabase

To get the exact, live schema from your Supabase project, follow these steps:

### Method 1: Using Supabase CLI (Recommended for development)

This method initializes a local Supabase environment and links it to your live
project.

1. **Login to Supabase**:
   ```bash
   npx supabase login
   ```

2. **Initialize Supabase (if not already done)**:
   ```bash
   npx supabase init
   ```

3. **Link your project**: Use your Project ID (`kskjyymgvpldcfnpgewh`):
   ```bash
   npx supabase link --project-ref kskjyymgvpldcfnpgewh
   ```
   _You will be prompted for your **Database Password**._

4. **Pull the schema**: This generates migrations based on your live database
   state:
   ```bash
   npx supabase db pull
   ```

### Method 2: One-liner SQL Dump

If you just want a single `.sql` file with the schema:

1. **Run the dump command**:
   ```bash
   npx supabase db dump --project-ref kskjyymgvpldcfnpgewh --schema-only > live_schema.sql
   ```
   _This will also ask for your Database Password._

### Method 3: Supabase Dashboard (No CLI needed)

1. Go to the
   [Supabase Dashboard](https://supabase.com/dashboard/project/kskjyymgvpldcfnpgewh).
2. Navigate to **Project Settings** -> **API**.
3. Scroll down to the **Tables** or **Data Dictionary** sections to see SQL
   definitions.
4. Alternatively, use the **SQL Editor** and run:
   ```sql
   select table_name, column_name, data_type 
   from information_schema.columns 
   where table_schema = 'public';
   ```
