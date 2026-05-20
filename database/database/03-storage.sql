-- ============================================================
-- MONEY MAKERS PLATFORM — STORAGE BUCKETS
-- Colar no Supabase SQL Editor DEPOIS do 02-rls-policies.sql
-- ============================================================

-- Bucket: avatars (fotos de perfil)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', TRUE,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket: course-thumbnails (capas de cursos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails', 'course-thumbnails', TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket: course-materials (PDFs, docs, imagens de módulos — NÃO vídeos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials', 'course-materials', FALSE,
  52428800, -- 50MB por ficheiro
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/markdown', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Bucket: museum (imagens do museu de análises)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'museum', 'museum', FALSE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- AVATARS: qualquer membro autenticado pode ver; só o próprio atualiza
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- COURSE THUMBNAILS: público (marketing)
CREATE POLICY "thumbnails_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY "thumbnails_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-thumbnails' AND is_admin()
  );

CREATE POLICY "thumbnails_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'course-thumbnails' AND is_admin()
  );

CREATE POLICY "thumbnails_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'course-thumbnails' AND is_admin()
  );

-- COURSE MATERIALS: só paid members que compraram o curso
CREATE POLICY "materials_select_paid" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-materials'
    AND (
      is_admin()
      OR (
        is_paid()
        AND NOT is_banned()
      )
    )
  );

CREATE POLICY "materials_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-materials' AND is_admin()
  );

CREATE POLICY "materials_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'course-materials' AND is_admin()
  );

-- MUSEUM: só paid members
CREATE POLICY "museum_select_paid" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'museum'
    AND (is_admin() OR (is_paid() AND NOT is_banned()))
  );

CREATE POLICY "museum_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'museum' AND is_admin()
  );

CREATE POLICY "museum_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'museum' AND is_admin()
  );
