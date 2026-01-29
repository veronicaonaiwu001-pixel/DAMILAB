import { supabase } from './supabase';
import { ToolFavorite, ToolHistory } from '@/types';

export async function toggleFavorite(userId: string, toolId: string): Promise<boolean> {
  // Check if already favorited
  const { data: existing } = await supabase
    .from('tool_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('tool_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('tool_id', toolId);

    if (error) throw error;
    return false;
  } else {
    // Add favorite
    const { error } = await supabase
      .from('tool_favorites')
      .insert({ user_id: userId, tool_id: toolId });

    if (error) throw error;
    return true;
  }
}

export async function getFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('tool_favorites')
    .select('tool_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data?.map((f) => f.tool_id) || [];
}

export async function addToHistory(userId: string, toolId: string, inputPreview?: string) {
  const { error } = await supabase
    .from('tool_history')
    .insert({
      user_id: userId,
      tool_id: toolId,
      input_preview: inputPreview?.substring(0, 100),
    });

  if (error) console.error('Failed to add to history:', error);
}

export async function getHistory(userId: string, limit = 20): Promise<ToolHistory[]> {
  const { data, error } = await supabase
    .from('tool_history')
    .select('*')
    .eq('user_id', userId)
    .order('used_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function incrementToolUsage(toolId: string) {
  const { error } = await supabase.rpc('increment_tool_usage', {
    p_tool_id: toolId,
  });

  if (error) console.error('Failed to increment usage:', error);
}

export async function getToolAnalytics() {
  const { data, error } = await supabase
    .from('tool_analytics')
    .select('*')
    .order('usage_count', { ascending: false });

  if (error) throw error;
  return data || [];
}
