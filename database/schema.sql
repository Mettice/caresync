-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable Row Level Security (RLS)
alter default privileges revoke execute on functions from public;

-- Create custom types
create type user_role as enum ('admin', 'doctor', 'staff', 'patient');
create type appointment_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled');
create type document_type as enum ('medical_record', 'prescription', 'lab_result', 'referral', 'other');

-- Clinics table (parent organizations)
create table clinics (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    address text,
    phone text,
    email text,
    logo_url text,
    settings jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Branches table (individual locations)
create table branches (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references clinics(id) on delete cascade,
    name text not null,
    address text,
    phone text,
    email text,
    settings jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Users table (staff, doctors, admins)
create table users (
    id uuid primary key default uuid_generate_v4(),
    auth_id uuid unique not null,
    role user_role not null,
    email text unique not null,
    first_name text,
    last_name text,
    phone text,
    profile_image text,
    specialization text,
    settings jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- User-Branch assignments
create table user_branches (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete cascade,
    branch_id uuid references branches(id) on delete cascade,
    created_at timestamp with time zone default now(),
    unique(user_id, branch_id)
);

-- Patients table
create table patients (
    id uuid primary key default uuid_generate_v4(),
    auth_id uuid unique,
    email text unique not null,
    first_name text not null,
    last_name text not null,
    date_of_birth date,
    gender text,
    phone text,
    address text,
    emergency_contact jsonb,
    medical_history jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Patient-Branch relationships
create table patient_branches (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id) on delete cascade,
    branch_id uuid references branches(id) on delete cascade,
    created_at timestamp with time zone default now(),
    unique(patient_id, branch_id)
);

-- Appointments table
create table appointments (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id) on delete cascade,
    branch_id uuid references branches(id) on delete cascade,
    doctor_id uuid references users(id) on delete set null,
    status appointment_status default 'scheduled',
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Documents table
create table documents (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id) on delete cascade,
    branch_id uuid references branches(id) on delete cascade,
    uploaded_by uuid references users(id) on delete set null,
    doc_type document_type not null,
    filename text not null,
    file_path text not null,
    content_type text,
    file_size bigint,
    metadata jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Forms table
create table forms (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id) on delete cascade,
    branch_id uuid references branches(id) on delete cascade,
    submitted_by uuid references users(id) on delete set null,
    form_type text not null,
    form_data jsonb not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Reminders table
create table reminders (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id) on delete cascade,
    branch_id uuid references branches(id) on delete cascade,
    created_by uuid references users(id) on delete set null,
    reminder_date timestamp with time zone not null,
    title text not null,
    description text,
    status text default 'pending',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Email accounts table
create table email_accounts (
    id uuid primary key default uuid_generate_v4(),
    branch_id uuid references branches(id) on delete cascade,
    email text not null,
    smtp_host text not null,
    smtp_port integer not null,
    smtp_user text not null,
    smtp_password text not null,
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Email templates table
create table email_templates (
    id uuid primary key default uuid_generate_v4(),
    branch_id uuid references branches(id) on delete cascade,
    created_by uuid references users(id) on delete set null,
    name text not null,
    subject text not null,
    body text not null,
    variables jsonb default '[]',
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Chat history table
create table chat_history (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id) on delete cascade,
    branch_id uuid references branches(id) on delete cascade,
    sender_id uuid references users(id) on delete set null,
    message text not null,
    message_type text default 'text',
    metadata jsonb default '{}',
    created_at timestamp with time zone default now()
);

-- Audit log table
create table audit_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete set null,
    entity_type text not null,
    entity_id uuid not null,
    action text not null,
    changes jsonb not null,
    created_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index idx_branches_clinic on branches(clinic_id);
create index idx_user_branches_branch on user_branches(branch_id);
create index idx_user_branches_user on user_branches(user_id);
create index idx_patient_branches_branch on patient_branches(branch_id);
create index idx_patient_branches_patient on patient_branches(patient_id);
create index idx_appointments_branch on appointments(branch_id);
create index idx_appointments_patient on appointments(patient_id);
create index idx_appointments_doctor on appointments(doctor_id);
create index idx_documents_patient on documents(patient_id);
create index idx_documents_branch on documents(branch_id);
create index idx_forms_patient on forms(patient_id);
create index idx_forms_branch on forms(branch_id);
create index idx_chat_history_patient on chat_history(patient_id);
create index idx_chat_history_branch on chat_history(branch_id);

-- Enable Row Level Security (RLS)
alter table clinics enable row level security;
alter table branches enable row level security;
alter table users enable row level security;
alter table user_branches enable row level security;
alter table patients enable row level security;
alter table patient_branches enable row level security;
alter table appointments enable row level security;
alter table documents enable row level security;
alter table forms enable row level security;
alter table reminders enable row level security;
alter table email_accounts enable row level security;
alter table email_templates enable row level security;
alter table chat_history enable row level security;
alter table audit_logs enable row level security;

-- Create RLS policies (example for clinics)
create policy "Clinics are viewable by authenticated users"
    on clinics for select
    using (auth.role() = 'authenticated');

create policy "Clinics are editable by admins only"
    on clinics for all
    using (auth.role() = 'authenticated' and exists (
        select 1 from users
        where users.auth_id = auth.uid()
        and users.role = 'admin'
    )); 