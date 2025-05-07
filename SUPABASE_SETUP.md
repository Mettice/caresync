# Supabase Setup Guide for CareSync

This guide provides instructions for setting up Supabase as the backend for CareSync.

## 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com/)
2. Sign up for a free account
3. Create a new project

## 2. Configure Database Tables

Create the following tables in your Supabase database:

### Intake Forms Table

```sql
CREATE TABLE intake_forms (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  reason_for_visit TEXT,
  preferred_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Reminders Table

```sql
CREATE TABLE reminders (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  patient_email TEXT NOT NULL,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 3. Set Up Row Level Security (Optional but Recommended)

Add RLS policies to secure your tables:

### For Intake Forms

```sql
-- Enable RLS
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can insert intake forms" 
ON intake_forms FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policy for viewing intake forms
CREATE POLICY "Users can view their own intake forms" 
ON intake_forms FOR SELECT 
TO authenticated 
USING (true);
```

### For Reminders

```sql
-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own reminders
CREATE POLICY "Users can manage their own reminders" 
ON reminders 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid());
```

## 4. Configure Environment Variables

Add your Supabase URL and anon key to your `.env` file:

```
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings.

## 5. Authentication (Optional)

If you want to add authentication:

1. Configure auth providers in the Supabase dashboard
2. Update the frontend to include login/signup functionality

## Testing the Setup

1. Submit a form through the Intake Form component
2. Create a reminder through the Reminder Form component
3. Check the Supabase dashboard to confirm that the data is being stored correctly 