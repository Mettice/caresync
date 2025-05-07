-- Users table policies
create policy "Users can insert their own profile"
    on users for insert
    with check (auth.uid() = auth_id);

create policy "Users can view their own profile"
    on users for select
    using (auth.uid() = auth_id);

create policy "Users can update their own profile"
    on users for update
    using (auth.uid() = auth_id);

create policy "Admins can view all users"
    on users for select
    using (
        exists (
            select 1 from users u
            where u.auth_id = auth.uid()
            and u.role = 'admin'
        )
    );

create policy "Admins can update all users"
    on users for update
    using (
        exists (
            select 1 from users u
            where u.auth_id = auth.uid()
            and u.role = 'admin'
        )
    );

-- Allow public registration
create policy "Enable insert for registration"
    on users for insert
    with check (true);

-- User Branches policies
create policy "Users can view their own branch assignments"
    on user_branches for select
    using (
        exists (
            select 1 from users
            where users.id = user_branches.user_id
            and users.auth_id = auth.uid()
        )
    );

create policy "Admins can manage user branch assignments"
    on user_branches for all
    using (
        exists (
            select 1 from users
            where users.auth_id = auth.uid()
            and users.role = 'admin'
        )
    );

-- Patient Branches policies
create policy "Users can view patient branch assignments"
    on patient_branches for select
    using (
        exists (
            select 1 from user_branches ub
            join users u on u.id = ub.user_id
            where u.auth_id = auth.uid()
            and ub.branch_id = patient_branches.branch_id
        )
    );

create policy "Staff can manage patient branch assignments"
    on patient_branches for all
    using (
        exists (
            select 1 from users
            where users.auth_id = auth.uid()
            and users.role in ('admin', 'staff', 'doctor')
        )
    );

-- Storage policies
create policy "Avatar images are publicly accessible"
    on storage.objects for select
    using ( bucket_id = 'profile_images' );

create policy "Anyone can upload an avatar"
    on storage.objects for insert
    with check (
        bucket_id = 'profile_images'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

create policy "Anyone can update their own avatar"
    on storage.objects for update
    using (
        bucket_id = 'profile_images'
        and (storage.foldername(name))[1] = auth.uid()::text
    ); 