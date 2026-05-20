// ============================================================
// MONEY MAKERS PLATFORM — SERVIÇOS SUPABASE
// Importa o que precisares em cada página
// ============================================================

import { supabase } from '@/lib/supabase';
import type {
  Course, Module, ModuleFile, CoursePurchase, CourseProgress,
  Broadcast, BookingSlot, Booking, Trade, Message,
  PlatformEvent, MuseumEntry, Group, GroupMember,
  ChatSession, ChatMessage, Profile,
} from '@/types/database';

// ============================================================
// PROFILES
// ============================================================
export const profileService = {
  getMyProfile: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    if (error) throw error;
    return data as Profile;
  },

  updateProfile: async (updates: Partial<Pick<Profile, 'name' | 'avatar_url'>>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },

  // ADMIN: listar todos os alunos
  getAllStudents: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Profile[];
  },

  // ADMIN: banir/desbanir aluno
  setBan: async (userId: string, isBanned: boolean, reason?: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: isBanned, ban_reason: reason ?? null })
      .eq('id', userId);
    if (error) throw error;
  },

  // ADMIN: mudar role
  setRole: async (userId: string, role: 'free' | 'paid' | 'admin') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    if (error) throw error;
  },
};

// ============================================================
// COURSES
// ============================================================
export const courseService = {
  getPublished: async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Course[];
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Course[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('courses')
      .select('*, modules(*, module_files(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // ADMIN: criar curso
  create: async (course: Partial<Course>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('courses')
      .insert({ ...course, created_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    return data as Course;
  },

  // ADMIN: atualizar curso
  update: async (id: string, updates: Partial<Course>) => {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Course;
  },

  // ADMIN: apagar curso
  delete: async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
  },

  // ADMIN: upload thumbnail
  uploadThumbnail: async (courseId: string, file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${courseId}/thumbnail.${ext}`;
    const { error } = await supabase.storage
      .from('course-thumbnails')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('course-thumbnails').getPublicUrl(path);
    return data.publicUrl;
  },

  // ADMIN: criar módulo
  createModule: async (module: Partial<Module>) => {
    const { data, error } = await supabase
      .from('modules')
      .insert(module)
      .select()
      .single();
    if (error) throw error;
    return data as Module;
  },

  // ADMIN: adicionar ficheiro a módulo
  addModuleFile: async (file: Partial<ModuleFile>) => {
    const { data, error } = await supabase
      .from('module_files')
      .insert(file)
      .select()
      .single();
    if (error) throw error;
    return data as ModuleFile;
  },

  // ADMIN: upload de material (PDF, doc, imagem)
  uploadMaterial: async (moduleId: string, file: File): Promise<string> => {
    const path = `${moduleId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('course-materials')
      .upload(path, file);
    if (error) throw error;
    // Retorna URL assinado (privado, expira em 1h)
    const { data } = await supabase.storage
      .from('course-materials')
      .createSignedUrl(path, 3600);
    return data?.signedUrl ?? '';
  },

  // Verificar se utilizador comprou curso
  hasPurchased: async (courseId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('course_purchases')
      .select('id')
      .eq('course_id', courseId)
      .not('confirmed_at', 'is', null)
      .single();
    return !!data;
  },

  // ADMIN: confirmar compra de aluno
  confirmPurchase: async (userId: string, courseId: string, amountPaid: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('course_purchases')
      .upsert({
        user_id: userId,
        course_id: courseId,
        amount_paid: amountPaid,
        confirmed_by: user?.id,
        confirmed_at: new Date().toISOString(),
      });
    if (error) throw error;

    // Promover aluno a 'paid' automaticamente
    await supabase
      .from('profiles')
      .update({ role: 'paid' })
      .eq('id', userId);
  },

  // Marcar módulo como completo
  markModuleComplete: async (moduleId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('course_progress')
      .upsert({
        user_id: user?.id,
        module_id: moduleId,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    if (error) throw error;
  },

  getProgress: async (courseId: string): Promise<CourseProgress[]> => {
    const { data, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('module_id', courseId); // filtrado por RLS
    if (error) throw error;
    return data as CourseProgress[];
  },
};

// ============================================================
// BROADCASTS / SALA DE SINAIS
// ============================================================
export const broadcastService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Broadcast[];
  },

  // ADMIN: criar broadcast
  create: async (broadcast: Partial<Broadcast>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('broadcasts')
      .insert({ ...broadcast, created_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    return data as Broadcast;
  },

  // ADMIN: apagar broadcast
  delete: async (id: string) => {
    const { error } = await supabase.from('broadcasts').delete().eq('id', id);
    if (error) throw error;
  },

  markRead: async (broadcastId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('broadcast_reads').upsert({
      user_id: user?.id,
      broadcast_id: broadcastId,
    });
  },

  getReadIds: async (): Promise<string[]> => {
    const { data } = await supabase
      .from('broadcast_reads')
      .select('broadcast_id');
    return data?.map((r: any) => r.broadcast_id) ?? [];
  },

  // Supabase Realtime — subscreve a novos broadcasts
  subscribeToNew: (callback: (b: Broadcast) => void) => {
    return supabase
      .channel('broadcasts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'broadcasts',
      }, (payload) => callback(payload.new as Broadcast))
      .subscribe();
  },
};

// ============================================================
// BOOKINGS / RESERVAS
// ============================================================
export const bookingService = {
  getSlots: async () => {
    const { data, error } = await supabase
      .from('booking_slots')
      .select('*')
      .eq('is_active', true)
      .order('date', { ascending: true });
    if (error) throw error;
    return data as BookingSlot[];
  },

  // ADMIN: criar slot
  createSlot: async (slot: Partial<BookingSlot>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('booking_slots')
      .insert({ ...slot, created_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    return data as BookingSlot;
  },

  // ADMIN: editar/apagar slot
  updateSlot: async (id: string, updates: Partial<BookingSlot>) => {
    const { data, error } = await supabase
      .from('booking_slots')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as BookingSlot;
  },

  book: async (slotId: string, notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('bookings')
      .insert({ slot_id: slotId, user_id: user?.id, notes })
      .select()
      .single();
    if (error) throw error;
    return data as Booking;
  },

  getMyBookings: async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, booking_slots(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // ADMIN: ver todas as reservas
  getAllBookings: async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, booking_slots(*), profiles!bookings_user_id_fkey(name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // ADMIN: confirmar pagamento e booking
  confirmBooking: async (bookingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_confirmed: true,
        confirmed_by: user?.id,
      })
      .eq('id', bookingId);
    if (error) throw error;
  },

  cancelBooking: async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
    if (error) throw error;
  },
};

// ============================================================
// TRADES (Trading Journal)
// ============================================================
export const tradeService = {
  getMyTrades: async () => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data as Trade[];
  },

  create: async (trade: Omit<Trade, 'id' | 'user_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('trades')
      .insert({ ...trade, user_id: user?.id })
      .select()
      .single();
    if (error) throw error;
    return data as Trade;
  },

  update: async (id: string, updates: Partial<Trade>) => {
    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Trade;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (error) throw error;
  },

  // ADMIN: ver trades de um aluno específico
  getStudentTrades: async (userId: string) => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data as Trade[];
  },
};

// ============================================================
// MESSAGES
// ============================================================
export const messageService = {
  getConversation: async (otherUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(from_user.eq.${user.id},to_user.eq.${otherUserId}),` +
        `and(from_user.eq.${otherUserId},to_user.eq.${user.id})`
      )
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as Message[];
  },

  send: async (toUserId: string, content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('messages')
      .insert({ from_user: user?.id, to_user: toUserId, content })
      .select()
      .single();
    if (error) throw error;
    return data as Message;
  },

  markRead: async (fromUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('to_user', user?.id)
      .eq('from_user', fromUserId);
  },

  subscribeToConversation: (
    myId: string,
    otherUserId: string,
    callback: (m: Message) => void
  ) => {
    return supabase
      .channel(`messages-${myId}-${otherUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `to_user=eq.${myId}`,
      }, (payload) => callback(payload.new as Message))
      .subscribe();
  },
};

// ============================================================
// EVENTS
// ============================================================
export const eventService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });
    if (error) throw error;
    return data as PlatformEvent[];
  },

  // ADMIN
  create: async (event: Partial<PlatformEvent>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('events')
      .insert({ ...event, created_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    return data as PlatformEvent;
  },

  update: async (id: string, updates: Partial<PlatformEvent>) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as PlatformEvent;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// MUSEUM
// ============================================================
export const museumService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('museum_entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as MuseumEntry[];
  },

  // ADMIN: criar entrada
  create: async (entry: Partial<MuseumEntry>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('museum_entries')
      .insert({ ...entry, created_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    return data as MuseumEntry;
  },

  // ADMIN: upload de imagem do museu
  uploadImage: async (entryId: string, file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${entryId}/image.${ext}`;
    const { error } = await supabase.storage
      .from('museum')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    // signed URL porque o bucket é privado
    const { data } = await supabase.storage
      .from('museum')
      .createSignedUrl(path, 86400); // 24h
    return data?.signedUrl ?? '';
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('museum_entries').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// GROUPS / TURMAS
// ============================================================
export const groupService = {
  getMyGroups: async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*, group_members!inner(user_id)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // ADMIN: criar turma
  create: async (group: Partial<Group>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('groups')
      .insert({ ...group, created_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    return data as Group;
  },

  // ADMIN: adicionar membro
  addMember: async (groupId: string, userId: string) => {
    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: userId });
    if (error && error.code !== '23505') throw error; // ignora duplicado
  },

  // ADMIN: remover membro
  removeMember: async (groupId: string, userId: string) => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  getMembers: async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .select('*, profiles(name, email, avatar_url)')
      .eq('group_id', groupId);
    if (error) throw error;
    return data;
  },
};

// ============================================================
// CHAT IA (Gemini)
// ============================================================
export const chatService = {
  getSessions: async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as ChatSession[];
  },

  createSession: async (label?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user?.id, label })
      .select()
      .single();
    if (error) throw error;
    return data as ChatSession;
  },

  getMessages: async (sessionId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as ChatMessage[];
  },

  saveMessage: async (sessionId: string, role: 'user' | 'assistant', content: string, tokensUsed = 0) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, role, content, tokens_used: tokensUsed })
      .select()
      .single();
    if (error) throw error;
    return data as ChatMessage;
  },

  // Incrementar créditos usados de IA
  incrementAiCredits: async (tokensUsed: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.rpc('increment_ai_credits', {
      user_id: user.id,
      tokens: tokensUsed,
    });
  },

  deleteSession: async (sessionId: string) => {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);
    if (error) throw error;
  },
};
