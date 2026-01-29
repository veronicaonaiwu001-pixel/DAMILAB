import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, Zap, Shield, Users } from 'lucide-react';
import * as Icons from 'lucide-react';
import { TOOLS, TOOL_CATEGORIES } from '@/constants/tools';
import { ToolCard } from '@/components/features/ToolCard';
import { ToolCardSkeleton } from '@/components/features/ToolSkeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFavorites, getToolAnalytics } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-lab.jpg';

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const popularTools = TOOLS.slice()
    .sort((a, b) => (analytics.get(b.id) || 0) - (analytics.get(a.id) || 0))
    .slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge variant="secondary" className="gap-2 w-fit">
                <Sparkles className="w-3 h-3" />
                30+ Production-Ready Tools
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="gradient-text">DAMI LAB</span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl">
                  Your Ultimate Toolkit
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                Powerful tools for developers, cybersecurity learners, students, and everyday users.
                Fast, secure, and always free.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2 group" asChild>
                  <Link to="/tools">
                    Explore Tools
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <Link to="/auth">
                    <Sparkles className="w-4 h-4" />
                    Get Started Free
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <img
                src={heroImage}
                alt="DAMI LAB Tools Platform"
                className="rounded-2xl shadow-2xl border border-white/10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 text-center group hover:border-primary/30 transition-all">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Blazing-fast tools optimized for performance and instant results
            </p>
          </div>

          <div className="glass-card p-6 text-center group hover:border-primary/30 transition-all">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Your data stays private with client-side processing and encryption
            </p>
          </div>

          <div className="glass-card p-6 text-center group hover:border-primary/30 transition-all">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Free Forever</h3>
            <p className="text-sm text-muted-foreground">
              All tools completely free with no hidden costs or limits
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Explore by <span className="gradient-text">Category</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {TOOL_CATEGORIES.map((category) => {
            const IconComponent = (Icons as any)[category.icon] || Icons.Wrench;
            return (
              <Link
                key={category.id}
                to={`/tools?category=${category.id}`}
                className="glass-card p-6 text-center group hover:border-primary/30 transition-all hover:scale-105"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${category.color} opacity-80 flex items-center justify-center group-hover:opacity-100 transition-opacity`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-sm">{category.name}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">
            <span className="gradient-text">Popular</span> Tools
          </h2>
          <Button variant="outline" asChild>
            <Link to="/tools">View All</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ToolCardSkeleton key={i} />)
            : popularTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isFavorited={favorites.includes(tool.id)}
                  onFavoriteChange={loadData}
                  usageCount={analytics.get(tool.id)}
                />
              ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">boost your productivity</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers and users who trust DAMI LAB for their daily tasks
            </p>
            <Button size="lg" className="gap-2" asChild>
              <Link to="/tools">
                <Sparkles className="w-5 h-5" />
                Start Using Tools Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
