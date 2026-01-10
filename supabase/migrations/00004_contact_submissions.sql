-- Migration: Contact Submissions Table
-- Description: Creates a table for storing contact form submissions from both
-- authenticated and unauthenticated users

-- ============================================
-- Contact Submissions Table
-- ============================================

CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'archived')),
    admin_notes TEXT,
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);

-- Updated_at trigger
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (for public contact form)
CREATE POLICY "Anyone can submit contact form"
    ON contact_submissions FOR INSERT
    WITH CHECK (true);

-- Only admins can view contact submissions
CREATE POLICY "Admins can view contact submissions"
    ON contact_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update contact submissions
CREATE POLICY "Admins can update contact submissions"
    ON contact_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can delete contact submissions
CREATE POLICY "Admins can delete contact submissions"
    ON contact_submissions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
