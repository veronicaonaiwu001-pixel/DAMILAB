import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Regex, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function RegexTesterTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    incrementToolUsage('regex-tester');
  }, []);

  useEffect(() => {
    testRegex();
  }, [pattern, testText, flags]);

  const testRegex = () => {
    if (!pattern || !testText) {
      setMatches([]);
      setError('');
      return;
    }

    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join('');
      
      const regex = new RegExp(pattern, flagString);
      const foundMatches = testText.match(regex);
      
      setMatches(foundMatches || []);
      setError('');
      
      if (user && foundMatches) {
        addToHistory(user.id, 'regex-tester', `Pattern: ${pattern}`);
      }
    } catch (err: any) {
      setError(err.message);
      setMatches([]);
    }
  };

  const examples = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: 'URL', pattern: 'https?://[\\w\\-._~:/?#[\\]@!$&\'()*+,;=.]+' },
    { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}' },
    { name: 'Hex Color', pattern: '#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}' },
  ];

  const highlightMatches = () => {
    if (!matches.length) return testText;
    
    let highlighted = testText;
    matches.forEach((match, i) => {
      const color = ['bg-yellow-500/30', 'bg-green-500/30', 'bg-blue-500/30', 'bg-purple-500/30'][i % 4];
      highlighted = highlighted.replace(match, `<mark class="${color} px-1 rounded">${match}</mark>`);
    });
    return highlighted;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
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
              <Regex className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Regex Tester</h1>
          </div>
          <p className="text-muted-foreground">
            Test regular expressions with live matching and highlighting
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Pattern & Test</h2>

              <div className="space-y-2">
                <Label htmlFor="pattern">Regular Expression</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
                    <Input
                      id="pattern"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="Enter regex pattern..."
                      className="px-8 font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={flags.g}
                      onCheckedChange={(checked) => setFlags({ ...flags, g: checked as boolean })}
                    />
                    <span>g (global)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={flags.i}
                      onCheckedChange={(checked) => setFlags({ ...flags, i: checked as boolean })}
                    />
                    <span>i (ignore case)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={flags.m}
                      onCheckedChange={(checked) => setFlags({ ...flags, m: checked as boolean })}
                    />
                    <span>m (multiline)</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="test-text">Test String</Label>
                <Textarea
                  id="test-text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter text to test against..."
                  className="min-h-[200px]"
                />
              </div>

              {!error && testText && (
                <div className="space-y-2">
                  <Label>Highlighted Matches ({matches.length})</Label>
                  <div
                    className="p-4 bg-black/20 rounded-lg border border-white/10 min-h-[100px] whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: highlightMatches() }}
                  />
                </div>
              )}
            </div>

            {matches.length > 0 && (
              <div className="glass-card p-6 space-y-4">
                <h2 className="font-semibold text-lg">Matches ({matches.length})</h2>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {matches.map((match, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                      <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>
                      <code className="flex-1 font-mono text-sm">{match}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(match);
                          toast.success('Match copied');
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold">Quick Examples</h3>
              <div className="space-y-2">
                {examples.map((example) => (
                  <Button
                    key={example.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setPattern(example.pattern)}
                    className="w-full justify-start"
                  >
                    {example.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 space-y-3">
              <h3 className="font-semibold">Common Patterns</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="font-mono">.</code> - Any character
                </div>
                <div>
                  <code className="font-mono">\d</code> - Digit (0-9)
                </div>
                <div>
                  <code className="font-mono">\w</code> - Word character
                </div>
                <div>
                  <code className="font-mono">\s</code> - Whitespace
                </div>
                <div>
                  <code className="font-mono">+</code> - One or more
                </div>
                <div>
                  <code className="font-mono">*</code> - Zero or more
                </div>
                <div>
                  <code className="font-mono">?</code> - Optional
                </div>
                <div>
                  <code className="font-mono">^</code> - Start of string
                </div>
                <div>
                  <code className="font-mono">$</code> - End of string
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
