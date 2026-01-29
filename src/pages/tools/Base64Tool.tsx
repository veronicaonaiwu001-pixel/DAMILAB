import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Binary, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Base64Tool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    incrementToolUsage('base64-tool');
  }, []);

  const handleEncode = () => {
    try {
      const encoded = btoa(input);
      setOutput(encoded);
      if (user) {
        addToHistory(user.id, 'base64-tool', 'Encoded text');
      }
      toast.success('Text encoded successfully');
    } catch (error: any) {
      toast.error('Failed to encode: ' + error.message);
    }
  };

  const handleDecode = () => {
    try {
      const decoded = atob(input);
      setOutput(decoded);
      if (user) {
        addToHistory(user.id, 'base64-tool', 'Decoded text');
      }
      toast.success('Text decoded successfully');
    } catch (error: any) {
      toast.error('Invalid Base64 string');
    }
  };

  const handleProcess = () => {
    if (!input.trim()) {
      toast.error('Please enter some text');
      return;
    }
    mode === 'encode' ? handleEncode() : handleDecode();
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
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
              <Binary className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Base64 Encoder/Decoder</h1>
          </div>
          <p className="text-muted-foreground">
            Encode text to Base64 or decode Base64 strings back to text
          </p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'encode' | 'decode')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="encode">Encode</TabsTrigger>
              <TabsTrigger value="decode">Decode</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">
                  {mode === 'encode' ? 'Plain Text' : 'Base64 String'}
                </Label>
                <Textarea
                  id="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === 'encode'
                      ? 'Enter text to encode...'
                      : 'Enter Base64 string to decode...'
                  }
                  className={mode === 'decode' ? 'font-mono text-sm' : ''}
                  rows={8}
                />
              </div>

              <Button onClick={handleProcess} className="w-full">
                {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
              </Button>

              <div className="space-y-2">
                <Label htmlFor="output">Output</Label>
                <Textarea
                  id="output"
                  value={output}
                  readOnly
                  placeholder={
                    mode === 'encode'
                      ? 'Base64 encoded result...'
                      : 'Decoded text...'
                  }
                  className={mode === 'encode' ? 'font-mono text-sm' : ''}
                  rows={8}
                />
              </div>

              <ToolActions
                output={output}
                onReset={handleReset}
                downloadFilename={mode === 'encode' ? 'encoded.txt' : 'decoded.txt'}
                disabled={!output}
              />
            </div>
          </Tabs>

          <div className="pt-4 border-t border-white/10">
            <h3 className="font-semibold mb-3">Examples</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground w-16">Text:</span>
                <code className="flex-1">Hello, World!</code>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground w-16">Base64:</span>
                <code className="flex-1 font-mono">SGVsbG8sIFdvcmxkIQ==</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
