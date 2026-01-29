import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Eye } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ToolDefinition } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toggleFavorite } from '@/lib/tools';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ToolCardProps {
  tool: ToolDefinition;
  isFavorited?: boolean;
  onFavoriteChange?: () => void;
  usageCount?: number;
}

export function ToolCard({ tool, isFavorited = false, onFavoriteChange, usageCount }: ToolCardProps) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to favorite tools');
      return;
    }

    setLoading(true);
    try {
      const newState = await toggleFavorite(user.id, tool.id);
      setFavorited(newState);
      toast.success(newState ? 'Added to favorites' : 'Removed from favorites');
      onFavoriteChange?.();
    } catch (error: any) {
      toast.error('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;

  return (
    <Link to={tool.path} className="group">
      <div className="glass-card p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] h-full border border-white/10 hover:border-primary/30">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-110 transition-transform">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            disabled={loading}
            className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Star
              className={`w-5 h-5 ${favorited ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
            />
          </Button>
        </div>

        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tool.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          {tool.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {usageCount !== undefined && usageCount > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>{usageCount.toLocaleString()} uses</span>
          </div>
        )}
      </div>
    </Link>
  );
}
