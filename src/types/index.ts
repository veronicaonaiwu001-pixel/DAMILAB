import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
  path: string;
}

export interface ToolFavorite {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

export interface ToolHistory {
  id: string;
  user_id: string;
  tool_id: string;
  input_preview?: string;
  used_at: string;
}

export interface ToolAnalytics {
  tool_id: string;
  usage_count: number;
  last_used: string;
  updated_at: string;
}
