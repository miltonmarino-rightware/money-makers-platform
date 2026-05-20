// ============================================================
// MONEY MAKERS PLATFORM — TIPOS DO SUPABASE
// Gerado manualmente para corresponder ao schema SQL
// ============================================================

export type UserRole = 'free' | 'paid' | 'admin';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  is_banned: boolean;
  ban_reason: string | null;
  ai_credits_used: number;
  ai_credits_limit: number;
  ai_subscription: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  is_free: boolean;
  is_published: boolean;
  category: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
}

export interface ModuleFile {
  id: string;
  module_id: string;
  name: string;
  file_type: 'video' | 'pdf' | 'image' | 'doc' | 'other';
  storage_path: string | null;
  drive_url: string | null;
  is_downloadable: boolean;
  position: number;
  created_at: string;
}

export interface CoursePurchase {
  id: string;
  user_id: string;
  course_id: string;
  amount_paid: number;
  payment_method: string;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  course_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export type BroadcastType = 'signal' | 'news' | 'alert';
export type BroadcastTarget = 'all' | 'paid' | 'group';
export type Priority = 'normal' | 'high' | 'urgent';

export interface Broadcast {
  id: string;
  title: string;
  content: string;
  type: BroadcastType;
  priority: Priority;
  target: BroadcastTarget;
  target_group_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface BookingSlot {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  duration_minutes: number;
  meeting_link: string | null;
  max_participants: number | null;
  is_group: boolean;
  price: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  slot_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_confirmed: boolean;
  confirmed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  pair: string;
  type: 'buy' | 'sell';
  result: 'win' | 'loss' | 'breakeven';
  pips: number | null;
  lot_size: number | null;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  from_user: string;
  to_user: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface PlatformEvent {
  id: string;
  title: string;
  description: string | null;
  type: 'challenge' | 'event' | 'campaign' | 'session';
  status: 'upcoming' | 'active' | 'ended';
  start_date: string;
  end_date: string | null;
  prize: string | null;
  target: 'all' | 'paid';
  created_by: string | null;
  created_at: string;
}

export interface MuseumEntry {
  id: string;
  title: string;
  description: string | null;
  pair: string | null;
  result_pips: number | null;
  image_url: string | null;
  video_url: string | null;
  category: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  label: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used: number;
  created_at: string;
}

// Para o createClient<Database>
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      courses: { Row: Course; Insert: Partial<Course>; Update: Partial<Course> };
      modules: { Row: Module; Insert: Partial<Module>; Update: Partial<Module> };
      module_files: { Row: ModuleFile; Insert: Partial<ModuleFile>; Update: Partial<ModuleFile> };
      course_purchases: { Row: CoursePurchase; Insert: Partial<CoursePurchase>; Update: Partial<CoursePurchase> };
      course_progress: { Row: CourseProgress; Insert: Partial<CourseProgress>; Update: Partial<CourseProgress> };
      groups: { Row: Group; Insert: Partial<Group>; Update: Partial<Group> };
      group_members: { Row: GroupMember; Insert: Partial<GroupMember>; Update: Partial<GroupMember> };
      broadcasts: { Row: Broadcast; Insert: Partial<Broadcast>; Update: Partial<Broadcast> };
      broadcast_reads: { Row: { user_id: string; broadcast_id: string; read_at: string }; Insert: any; Update: any };
      booking_slots: { Row: BookingSlot; Insert: Partial<BookingSlot>; Update: Partial<BookingSlot> };
      bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> };
      trades: { Row: Trade; Insert: Partial<Trade>; Update: Partial<Trade> };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> };
      events: { Row: PlatformEvent; Insert: Partial<PlatformEvent>; Update: Partial<PlatformEvent> };
      museum_entries: { Row: MuseumEntry; Insert: Partial<MuseumEntry>; Update: Partial<MuseumEntry> };
      chat_sessions: { Row: ChatSession; Insert: Partial<ChatSession>; Update: Partial<ChatSession> };
      chat_messages: { Row: ChatMessage; Insert: Partial<ChatMessage>; Update: Partial<ChatMessage> };
    };
  };
};
