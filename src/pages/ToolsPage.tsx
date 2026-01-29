import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { TOOLS, TOOL_CATEGORIES } from '@/constants/tools';
import { ToolCard } from '@/components/features/ToolCard';
import { ToolCardSkeleton } from '@/components/features/ToolSkeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFavorites, getToolAnalytics } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';

export default function ToolsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [analyticsData, favoritesData] = await Promise.all([
        getToolAnalytics(),
        user ? getFavorites(user.id) : Promise.resolve([]),
      ]);

      const analyticsMap = new Map(analyticsData.map((a) => [a.tool_id, a.usage_count]));
      setAnalytics(analyticsMap);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    const newCategory = categoryId === selectedCategory ? '' : categoryId;
    setSelectedCategory(newCategory);
    setSearchParams(newCategory ? { category: newCategory } : {});
  };

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const selectedCategoryData = TOOL_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">
          All <span className="gradient-text">Tools</span>
        </h1>
        <p className="text-muted-foreground">
          Browse our complete collection of {TOOLS.length} production-ready tools
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tools by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {TOOL_CATEGORIES.map((category) => {
            const IconComponent = (Icons as any)[category.icon] || Icons.Wrench;
            const isSelected = selectedCategory === category.id;
            return (
              <Button
                key={category.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategorySelect(category.id)}
                className="gap-2"
              >
                <IconComponent className="w-4 h-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            <Badge variant="default" className="gap-2">
              {selectedCategoryData?.name}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleCategorySelect(selectedCategory)}
              />
            </Badge>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
        </p>
      </div>

      {/* Tools Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ToolCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTools.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorited={favorites.includes(tool.id)}
              onFavoriteChange={loadData}
              usageCount={analytics.get(tool.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No tools found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filter criteria
          </p>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedCategory('');
            setSearchParams({});
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
