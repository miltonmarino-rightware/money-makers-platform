-- ============================================================
-- MONEY MAKERS PLATFORM — ADMIN SETUP
-- Correr DEPOIS de criar a conta do Owen via Supabase Auth
-- (Authentication > Users > Invite user)
--
-- Substitui o email abaixo pelo email real do Owen
-- ============================================================

-- Promover utilizador existente a admin
-- SUBSTITUI 'owen@moneymakers.com' pelo email real do Owen
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'owen@moneymakers.com';

-- Verificar se funcionou
SELECT id, name, email, role FROM public.profiles WHERE role = 'admin';
