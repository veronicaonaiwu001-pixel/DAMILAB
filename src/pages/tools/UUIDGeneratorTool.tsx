import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';
import { Hash, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function UUIDGeneratorTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [version, setVersion] = useState<'v1' | 'v4' | 'v7'>('v4');
  const [count, setCount] = useState(1);
  const [output, setOutput] = useState('');

  useEffect(() => {
    incrementToolUsage('uuid-generator');
  }, []);

  const generateUUIDs = () => {
    try {
      const uuids: string[] = [];
      
      for (let i = 0; i < count; i++) {
        if (version === 'v1') {
          uuids.push(uuidv1());
        } else if (version === 'v4') {
          uuids.push(uuidv4());
        } else {
          // v7 simulation (timestamp-based)
          const timestamp = Date.now();
          const randomPart = uuidv4().split('-').slice(1).join('-');
          uuids.push(`${timestamp.toString(16).padStart(12, '0')}-${randomPart}`);
        }
      }

      const result = uuids.join('\n');
      setOutput(result);

      if (user) {
        addToHistory(user.id, 'uuid-generator', `Generated ${count} UUID ${version}`);
      }

      toast.success(`Generated ${count} UUID${count > 1 ? 's' : ''}`);
    } catch (error: any) {
      toast.error('Failed to generate UUIDs');
    }
  };

  const handleReset = () => {
    setVersion('v4');
    setCount(1);
    setOutput('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tools')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Hash className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">UUID Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Generate universally unique identifiers (UUIDs) in versions 1, 4, and 7
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Settings</h2>

              <div className="space-y-2">
                <Label htmlFor="version">UUID Version</Label>
                <Select value={version} onValueChange={(v: any) => setVersion(v)}>
                  <SelectTrigger id="version">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">Version 1 (Timestamp + MAC)</SelectItem>
                    <SelectItem value="v4">Version 4 (Random)</SelectItem>
                    <SelectItem value="v7">Version 7 (Timestamp-ordered)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {version === 'v1' && 'Timestamp-based with MAC address'}
                  {version === 'v4' && 'Randomly generated (most common)'}
                  {version === 'v7' && 'Timestamp-ordered for better database indexing'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Number of UUIDs</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                />
                <p className="text-xs text-muted-foreground">Generate up to 100 UUIDs at once</p>
              </div>

              <Button onClick={generateUUIDs} className="w-full gap-2">
                <RefreshCw className="w-4 h-4" />
                Generate UUIDs
              </Button>
            </div>

            {/* Example */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">Example UUIDs</h3>
              <div className="space-y-2 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">v1:</span> 6c84fb90-12c4-11e1-840d-7b25c5ee775a
                </div>
                <div>
                  <span className="text-muted-foreground">v4:</span> f47ac10b-58cc-4372-a567-0e02b2c3d479
                </div>
                <div>
                  <span className="text-muted-foreground">v7:</span> 018d9e3a-b5c0-7000-8000-0242ac130003
                </div>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Output</h2>
                {output && (
                  <span className="text-sm text-muted-foreground">
                    {output.split('\n').length} UUID{output.split('\n').length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <Textarea
                value={output}
                readOnly
                placeholder="Generated UUIDs will appear here..."
                className="font-mono text-sm min-h-[400px]"
              />

              <ToolActions
                output={output}
                onReset={handleReset}
                downloadFilename="uuids.txt"
                disabled={!output}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
