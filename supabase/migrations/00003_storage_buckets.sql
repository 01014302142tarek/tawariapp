-- ============================================
-- Storage Buckets for TawariApp
-- ============================================

-- Create avatars bucket (public - anyone can view)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create credentials bucket (private - only admins and owner can view)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'credentials',
    'credentials',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- ============================================
-- RLS Policies for Avatars Bucket
-- ============================================

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- RLS Policies for Credentials Bucket
-- ============================================

-- Allow doctors to upload their own credentials
CREATE POLICY "Doctors can upload their own credentials"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'credentials'
    AND EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.doctor_profiles dp ON dp.profile_id = p.id
        WHERE p.user_id = auth.uid()
        AND dp.id::text = (storage.foldername(name))[1]
    )
);

-- Allow doctors to view their own credentials
CREATE POLICY "Doctors can view their own credentials"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'credentials'
    AND (
        -- Doctor can view their own
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.doctor_profiles dp ON dp.profile_id = p.id
            WHERE p.user_id = auth.uid()
            AND dp.id::text = (storage.foldername(name))[1]
        )
        OR
        -- Admins can view all
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
            AND p.role = 'admin'
        )
    )
);

-- Allow doctors to delete their own credentials
CREATE POLICY "Doctors can delete their own credentials"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'credentials'
    AND EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.doctor_profiles dp ON dp.profile_id = p.id
        WHERE p.user_id = auth.uid()
        AND dp.id::text = (storage.foldername(name))[1]
    )
);

-- Allow admins to delete any credentials (for moderation)
CREATE POLICY "Admins can delete any credentials"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'credentials'
    AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
);
