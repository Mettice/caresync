-- Create storage buckets
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
insert into storage.buckets (id, name, public) values ('profile_images', 'profile_images', true);

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable Row Level Security (RLS)
alter default privileges revoke execute on functions from public;

-- Create custom types
create type user_role as enum ('admin', 'doctor', 'staff', 'patient');
create type appointment_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled');
create type document_type as enum ('medical_record', 'prescription', 'lab_result', 'referral', 'other');

-- [Previous table creation SQL remains the same...]

-- Create function for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create audit logging function
create or replace function audit_log_changes()
returns trigger as $$
begin
    insert into audit_logs (
        user_id,
        entity_type,
        entity_id,
        action,
        changes
    ) values (
        coalesce(auth.uid()::uuid, null),
        TG_TABLE_NAME,
        coalesce(new.id, old.id),
        TG_OP,
        case
            when TG_OP = 'DELETE' then jsonb_build_object('old', row_to_json(old)::jsonb)
            when TG_OP = 'UPDATE' then jsonb_build_object('old', row_to_json(old)::jsonb, 'new', row_to_json(new)::jsonb)
            else jsonb_build_object('new', row_to_json(new)::jsonb)
        end
    );
    return coalesce(new, old);
end;
$$ language plpgsql;

-- Create RLS Policies

-- Clinics policies
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

-- Branches policies
create policy "Branches are viewable by authenticated users"
    on branches for select
    using (auth.role() = 'authenticated');

create policy "Branches are editable by clinic admins"
    on branches for all
    using (auth.role() = 'authenticated' and exists (
        select 1 from users
        where users.auth_id = auth.uid()
        and users.role = 'admin'
    ));

-- Users policies
create policy "Users can view their own profile"
    on users for select
    using (auth.uid() = auth_id);

create policy "Admins can view all users"
    on users for select
    using (exists (
        select 1 from users u
        where u.auth_id = auth.uid()
        and u.role = 'admin'
    ));

create policy "Users can update their own profile"
    on users for update
    using (auth.uid() = auth_id);

-- Patients policies
create policy "Patients can view their own records"
    on patients for select
    using (auth.uid() = auth_id);

create policy "Staff can view patient records in their branch"
    on patients for select
    using (exists (
        select 1 from user_branches ub
        join patient_branches pb on ub.branch_id = pb.branch_id
        where ub.user_id = auth.uid()
        and pb.patient_id = patients.id
    ));

-- Documents policies
create policy "Users can view documents they have access to"
    on documents for select
    using (
        auth.uid() in (
            select u.auth_id from users u
            join user_branches ub on u.id = ub.user_id
            where ub.branch_id = documents.branch_id
        ) or
        auth.uid() = (
            select p.auth_id from patients p
            where p.id = documents.patient_id
        )
    );

create policy "Staff can upload documents"
    on documents for insert
    using (
        exists (
            select 1 from users u
            join user_branches ub on u.id = ub.user_id
            where u.auth_id = auth.uid()
            and ub.branch_id = documents.branch_id
        )
    );

-- Storage policies
create policy "Users can upload their own profile images"
    on storage.objects for insert
    with check (
        bucket_id = 'profile_images' and
        auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Documents are uploadable by authorized staff"
    on storage.objects for insert
    with check (
        bucket_id = 'documents' and
        exists (
            select 1 from users u
            join user_branches ub on u.id = ub.user_id
            where u.auth_id = auth.uid()
            and ub.branch_id = (storage.foldername(name))[1]::uuid
        )
    );

-- Add update triggers for timestamps
create trigger update_clinics_updated_at
    before update on clinics
    for each row
    execute function update_updated_at_column();

create trigger update_branches_updated_at
    before update on branches
    for each row
    execute function update_updated_at_column();

create trigger update_users_updated_at
    before update on users
    for each row
    execute function update_updated_at_column();

create trigger update_patients_updated_at
    before update on patients
    for each row
    execute function update_updated_at_column();

-- Add audit logging triggers
create trigger audit_clinics
    after insert or update or delete on clinics
    for each row execute function audit_log_changes();

create trigger audit_branches
    after insert or update or delete on branches
    for each row execute function audit_log_changes();

create trigger audit_users
    after insert or update or delete on users
    for each row execute function audit_log_changes();

create trigger audit_patients
    after insert or update or delete on patients
    for each row execute function audit_log_changes();

create trigger audit_documents
    after insert or update or delete on documents
    for each row execute function audit_log_changes();

-- Create indexes for better query performance
create index idx_users_auth_id on users(auth_id);
create index idx_patients_auth_id on patients(auth_id);
create index idx_documents_uploaded_by on documents(uploaded_by);
create index idx_forms_submitted_by on forms(submitted_by);
create index idx_audit_logs_user on audit_logs(user_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);

-- Create full-text search indexes
alter table documents add column if not exists fts tsvector
    generated always as (
        setweight(to_tsvector('english', coalesce(filename, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(metadata->>'description', '')), 'B')
    ) stored;

create index documents_fts_idx on documents using gin(fts);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant all on all functions in schema public to authenticated; 