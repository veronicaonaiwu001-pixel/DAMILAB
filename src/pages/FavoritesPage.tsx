import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import { getFavorites, toggleFavorite } from '@/lib/tools';
import { TOOLS } from '@/constants/tools';
import { ToolCard } from '@/components/features/ToolCard';
import { ToolCardSkeleton } from '@/components/features/ToolSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadFavorites();
  }, [user, navigate]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const data = await getFavorites(user.id);
      setFavorites(data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const favoriteTools = TOOLS.filter((tool) => favorites.includes(tool.id));

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Favorite</span> Tools
          </h1>
          <p className="text-muted-foreground">
            Quick access to your most-used tools
          </p>
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        ) : favoriteTools.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorited={true}
                onFavoriteChange={loadFavorites}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start favoriting tools to access them quickly
            </p>
            <Button onClick={() => navigate('/tools')}>
              Browse Tools
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
