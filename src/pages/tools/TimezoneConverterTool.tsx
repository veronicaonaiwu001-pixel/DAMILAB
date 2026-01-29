import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';

const TIMEZONES = [
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Anchorage', label: 'Anchorage (AKST/AKDT)' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'UTC', label: 'UTC' },
];

export default function TimezoneConverterTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sourceTimezone, setSourceTimezone] = useState('America/New_York');
  const [sourceTime, setSourceTime] = useState('');
  const [targetTimezones, setTargetTimezones] = useState<string[]>(['Europe/London', 'Asia/Tokyo']);

  useEffect(() => {
    incrementToolUsage('timezone-converter');
    // Set current time as default
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    setSourceTime(timeString);
  }, []);

  const convertTime = (time: string, fromTz: string, toTz: string): string => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      const fromTime = date.toLocaleString('en-US', { timeZone: fromTz, timeStyle: 'long' });
      const fromDate = new Date(date.toLocaleString('en-US', { timeZone: fromTz }));
      
      const toTime = fromDate.toLocaleString('en-US', {
        timeZone: toTz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const toDate = fromDate.toLocaleString('en-US', {
        timeZone: toTz,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      return `${toTime} - ${toDate}`;
    } catch {
      return 'Invalid time';
    }
  };

  const addTimezone = () => {
    const available = TIMEZONES.filter((tz) => !targetTimezones.includes(tz.value));
    if (available.length > 0) {
      setTargetTimezones([...targetTimezones, available[0].value]);
    }
  };

  const removeTimezone = (index: number) => {
    setTargetTimezones(targetTimezones.filter((_, i) => i !== index));
  };

  const handleConvert = () => {
    if (user) {
      addToHistory(user.id, 'timezone-converter', `${sourceTime} from ${sourceTimezone}`);
    }
  };

  useEffect(() => {
    if (sourceTime) handleConvert();
  }, [sourceTime, sourceTimezone, targetTimezones]);

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
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Timezone Converter</h1>
          </div>
          <p className="text-muted-foreground">
            Convert time between multiple timezones with DST awareness
          </p>
        </div>

        <div className="space-y-6">
          {/* Source Time */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Source Time</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source-time">Time</Label>
                <Input
                  id="source-time"
                  type="time"
                  value={sourceTime}
                  onChange={(e) => setSourceTime(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source-tz">Timezone</Label>
                <Select value={sourceTimezone} onValueChange={setSourceTimezone}>
                  <SelectTrigger id="source-tz">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Target Timezones */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Converted Times</h2>
              <Button
                onClick={addTimezone}
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={targetTimezones.length >= TIMEZONES.length - 1}
              >
                <Plus className="w-4 h-4" />
                Add Timezone
              </Button>
            </div>

            <div className="space-y-3">
              {targetTimezones.map((tz, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-black/20 rounded-lg">
                  <div className="flex-1">
                    <Select
                      value={tz}
                      onValueChange={(newTz) => {
                        const updated = [...targetTimezones];
                        updated[index] = newTz;
                        setTargetTimezones(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-left sm:text-right flex-1">
                    <div className="text-2xl font-bold">
                      {sourceTime ? convertTime(sourceTime, sourceTimezone, tz).split(' - ')[0] : '--:--'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sourceTime ? convertTime(sourceTime, sourceTimezone, tz).split(' - ')[1] : ''}
                    </div>
                  </div>

                  <Button
                    onClick={() => removeTimezone(index)}
                    size="icon"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {targetTimezones.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Add Timezone" to convert times</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Time Display */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current UTC Time:</span>
              <span className="font-mono font-semibold">
                {new Date().toUTCString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
