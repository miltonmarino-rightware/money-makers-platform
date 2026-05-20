-- ============================================================
-- MONEY MAKERS PLATFORM — ROW LEVEL SECURITY (RLS)
-- Colar no Supabase SQL Editor DEPOIS do 01-schema.sql
-- ============================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.museum_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_paid()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('paid', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_banned()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_banned FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
-- Cada utilizador vê o seu próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Admin vê todos os perfis
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (is_admin());

-- Utilizador atualiza o seu próprio perfil (não pode mudar role)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Admin atualiza qualquer perfil (incluindo role, ban)
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (is_admin());

-- ============================================================
-- COURSES
-- ============================================================
-- Todos veem cursos publicados
CREATE POLICY "courses_select_published" ON public.courses
  FOR SELECT USING (is_published = TRUE);

-- Admin vê todos (publicados e não)
CREATE POLICY "courses_select_admin" ON public.courses
  FOR SELECT USING (is_admin());

-- Só admin cria/edita/apaga cursos
CREATE POLICY "courses_insert_admin" ON public.courses
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "courses_update_admin" ON public.courses
  FOR UPDATE USING (is_admin());

CREATE POLICY "courses_delete_admin" ON public.courses
  FOR DELETE USING (is_admin());

-- ============================================================
-- MODULES
-- ============================================================
-- Módulos visíveis se curso publicado E utilizador pagou o curso
CREATE POLICY "modules_select_paid" ON public.modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = modules.course_id
      AND c.is_published = TRUE
      AND (
        is_admin()
        OR EXISTS (
          SELECT 1 FROM public.course_purchases cp
          WHERE cp.course_id = c.id AND cp.user_id = auth.uid() AND cp.confirmed_at IS NOT NULL
        )
        OR c.is_free = TRUE
      )
    )
  );

CREATE POLICY "modules_all_admin" ON public.modules
  FOR ALL USING (is_admin());

-- ============================================================
-- MODULE FILES
-- ============================================================
CREATE POLICY "module_files_select" ON public.module_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_files.module_id
      AND (
        is_admin()
        OR EXISTS (
          SELECT 1 FROM public.course_purchases cp
          WHERE cp.course_id = c.id AND cp.user_id = auth.uid() AND cp.confirmed_at IS NOT NULL
        )
        OR c.is_free = TRUE
      )
    )
  );

CREATE POLICY "module_files_all_admin" ON public.module_files
  FOR ALL USING (is_admin());

-- ============================================================
-- COURSE PURCHASES
-- ============================================================
CREATE POLICY "purchases_select_own" ON public.course_purchases
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "purchases_insert_admin" ON public.course_purchases
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "purchases_update_admin" ON public.course_purchases
  FOR UPDATE USING (is_admin());

-- ============================================================
-- COURSE PROGRESS
-- ============================================================
CREATE POLICY "progress_select_own" ON public.course_progress
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "progress_insert_own" ON public.course_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "progress_update_own" ON public.course_progress
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- GROUPS
-- ============================================================
-- Paid members veem grupos dos cursos que compraram
CREATE POLICY "groups_select_paid" ON public.groups
  FOR SELECT USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "groups_all_admin" ON public.groups
  FOR ALL USING (is_admin());

-- ============================================================
-- GROUP MEMBERS
-- ============================================================
CREATE POLICY "group_members_select" ON public.group_members
  FOR SELECT USING (
    user_id = auth.uid() OR is_admin()
  );

CREATE POLICY "group_members_all_admin" ON public.group_members
  FOR ALL USING (is_admin());

-- ============================================================
-- BROADCASTS / SINAIS
-- ============================================================
-- Paid vê todos | Free vê só 'news' (não sinais)
CREATE POLICY "broadcasts_select_paid" ON public.broadcasts
  FOR SELECT USING (
    is_admin()
    OR (is_paid() AND NOT is_banned())
    OR (
      NOT is_paid()
      AND type = 'news'
      AND target = 'all'
      AND NOT is_banned()
    )
  );

CREATE POLICY "broadcasts_all_admin" ON public.broadcasts
  FOR ALL USING (is_admin());

-- ============================================================
-- BROADCAST READS
-- ============================================================
CREATE POLICY "broadcast_reads_own" ON public.broadcast_reads
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- BOOKING SLOTS
-- ============================================================
-- Todos os membros (free e paid) veem slots disponíveis
CREATE POLICY "slots_select_members" ON public.booking_slots
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND is_active = TRUE AND NOT is_banned()
  );

CREATE POLICY "slots_all_admin" ON public.booking_slots
  FOR ALL USING (is_admin());

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT WITH CHECK (user_id = auth.uid() AND NOT is_banned());

CREATE POLICY "bookings_update_admin" ON public.bookings
  FOR UPDATE USING (is_admin());

-- ============================================================
-- TRADES
-- ============================================================
-- Só paid members têm Trading Journal
CREATE POLICY "trades_select_own" ON public.trades
  FOR SELECT USING (user_id = auth.uid() AND is_paid());

CREATE POLICY "trades_insert_own" ON public.trades
  FOR INSERT WITH CHECK (user_id = auth.uid() AND is_paid() AND NOT is_banned());

CREATE POLICY "trades_update_own" ON public.trades
  FOR UPDATE USING (user_id = auth.uid() AND is_paid());

CREATE POLICY "trades_delete_own" ON public.trades
  FOR DELETE USING (user_id = auth.uid() AND is_paid());

-- Admin vê todos os trades
CREATE POLICY "trades_admin" ON public.trades
  FOR ALL USING (is_admin());

-- ============================================================
-- MESSAGES
-- ============================================================
-- Só paid members e admin podem enviar/receber mensagens
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (
    (from_user = auth.uid() OR to_user = auth.uid())
    AND (is_paid() OR is_admin())
  );

CREATE POLICY "messages_insert_paid" ON public.messages
  FOR INSERT WITH CHECK (
    from_user = auth.uid()
    AND (is_paid() OR is_admin())
    AND NOT is_banned()
  );

CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE USING (to_user = auth.uid());

-- ============================================================
-- EVENTS
-- ============================================================
CREATE POLICY "events_select_paid" ON public.events
  FOR SELECT USING (
    NOT is_banned()
    AND (
      is_admin()
      OR (target = 'paid' AND is_paid())
      OR target = 'all'
    )
  );

CREATE POLICY "events_all_admin" ON public.events
  FOR ALL USING (is_admin());

-- ============================================================
-- MUSEUM
-- ============================================================
-- Paid vê tudo | Free vê só 1 entrada (a mais recente)
CREATE POLICY "museum_select_paid" ON public.museum_entries
  FOR SELECT USING (
    is_admin()
    OR (is_paid() AND NOT is_banned())
    OR (
      NOT is_paid()
      AND id = (SELECT id FROM public.museum_entries ORDER BY created_at DESC LIMIT 1)
    )
  );

CREATE POLICY "museum_all_admin" ON public.museum_entries
  FOR ALL USING (is_admin());

-- ============================================================
-- CHAT SESSIONS & MESSAGES
-- ============================================================
CREATE POLICY "chat_sessions_own" ON public.chat_sessions
  FOR ALL USING (user_id = auth.uid() AND NOT is_banned());

CREATE POLICY "chat_messages_own" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = chat_messages.session_id AND cs.user_id = auth.uid()
    )
    AND NOT is_banned()
  );
