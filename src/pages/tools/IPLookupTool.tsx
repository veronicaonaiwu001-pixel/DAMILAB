import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface IPInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  timezone: string;
  postal: string;
}

export default function IPLookupTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<IPInfo | null>(null);

  useEffect(() => {
    incrementToolUsage('ip-lookup');
    // Get user's own IP on load
    getUserIP();
  }, []);

  const getUserIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      setIp(data.ip);
    } catch (error) {
      console.error('Failed to get user IP:', error);
    }
  };

  const handleLookup = async () => {
    if (!ip.trim()) {
      toast.error('Please enter an IP address');
      return;
    }

    // Basic IP validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ip)) {
      toast.error('Invalid IP address format');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.reason || 'Failed to lookup IP');
      }

      setInfo({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        loc: `${data.latitude}, ${data.longitude}`,
        org: data.org || 'Unknown',
        timezone: data.timezone,
        postal: data.postal || 'N/A',
      });

      if (user) {
        addToHistory(user.id, 'ip-lookup', ip);
      }

      toast.success('IP information retrieved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to lookup IP');
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tools')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">IP Lookup & Geolocation</h1>
          </div>
          <p className="text-muted-foreground">
            Get geolocation, ASN, and ISP information for any IP address
          </p>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">IP Address</h2>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="ip">Enter IP Address</Label>
                <Input
                  id="ip"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="8.8.8.8"
                  className="font-mono"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleLookup} disabled={loading} className="gap-2 w-full sm:w-auto">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      Lookup
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {info && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">IP Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">IP Address</div>
                  <div className="font-mono font-semibold">{info.ip}</div>
                </div>

                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Location</div>
                  <div className="font-semibold">
                    {info.city}, {info.region}
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Country</div>
                  <div className="font-semibold">{info.country}</div>
                </div>

                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Coordinates</div>
                  <div className="font-mono text-sm">{info.loc}</div>
                </div>

                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Timezone</div>
                  <div className="font-semibold">{info.timezone}</div>
                </div>

                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Postal Code</div>
                  <div className="font-semibold">{info.postal}</div>
                </div>

                <div className="p-4 bg-black/20 rounded-lg md:col-span-2">
                  <div className="text-sm text-muted-foreground mb-1">ISP / Organization</div>
                  <div className="font-semibold">{info.org}</div>
                </div>
              </div>

              {info.loc && (
                <div className="mt-4">
                  <a
                    href={`https://www.google.com/maps?q=${info.loc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View on Google Maps →
                  </a>
                </div>
              )}
            </div>
          )}

          {!info && !loading && (
            <div className="glass-card p-6">
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter an IP address to lookup its information</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
