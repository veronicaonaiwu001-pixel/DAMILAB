import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import { getToolAnalytics } from '@/lib/tools';
import { TOOLS } from '@/constants/tools';
import { ToolAnalytics } from '@/types';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<ToolAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getToolAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalUsage = analytics.reduce((sum, item) => sum + item.usage_count, 0);
  const activeTools = analytics.filter((a) => a.usage_count > 0).length;

  const topTools = analytics.slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Analytics</span> Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor tool usage and platform statistics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground">Total Usage</h3>
            </div>
            <p className="text-3xl font-bold">{totalUsage.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Tool invocations</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground">Active Tools</h3>
            </div>
            <p className="text-3xl font-bold">{activeTools}</p>
            <p className="text-xs text-muted-foreground mt-1">Out of {TOOLS.length} total</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-semibold text-sm text-muted-foreground">Avg. Per Tool</h3>
            </div>
            <p className="text-3xl font-bold">
              {activeTools > 0 ? Math.round(totalUsage / activeTools).toLocaleString() : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Uses per active tool</p>
          </div>
        </div>

        {/* Top Tools Table */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6">Top Tools by Usage</h2>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : topTools.length > 0 ? (
            <div className="space-y-2">
              {topTools.map((item, index) => {
                const tool = TOOLS.find((t) => t.id === item.tool_id);
                if (!tool) return null;

                const percentage = totalUsage > 0 ? (item.usage_count / totalUsage) * 100 : 0;

                return (
                  <div
                    key={item.tool_id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{tool.description}</p>
                      <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <p className="text-2xl font-bold">{item.usage_count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No usage data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
