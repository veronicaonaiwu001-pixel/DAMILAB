import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export default function CodeExplainerTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [context, setContext] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    incrementToolUsage('code-explainer');
  }, []);

  const handleExplain = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to explain');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tools', {
        body: {
          mode: 'explain',
          code: code,
          prompt: context,
        },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500;
            const textContent = await error.context?.text();
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
          } catch {
            errorMessage = `${error.message || 'Failed to read response'}`;
          }
        }
        throw new Error(errorMessage);
      }

      if (data?.success && data?.result) {
        setOutput(data.result);
        if (user) {
          addToHistory(user.id, 'code-explainer', code.substring(0, 50));
        }
        toast.success('Code explained successfully');
      } else {
        throw new Error('No response from AI');
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error(error.message || 'Failed to explain code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setContext('');
    setOutput('');
  };

  const exampleCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;

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
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">AI Code Explainer</h1>
          </div>
          <p className="text-muted-foreground">
            Get line-by-line explanations of any code snippet powered by Damini Codesphere
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Input</h2>

              <div className="space-y-2">
                <Label htmlFor="code">Code to Explain</Label>
                <Textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="font-mono text-sm min-h-[300px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="E.g., 'Explain for beginners' or 'Focus on time complexity'"
                  className="text-sm h-20"
                />
              </div>

              <Button onClick={handleExplain} className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Explaining...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Explain Code
                  </>
                )}
              </Button>
            </div>

            {/* Example */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">Example Code</h3>
              <pre className="text-xs font-mono bg-black/20 p-3 rounded-lg overflow-x-auto">
                {exampleCode}
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCode(exampleCode)}
                className="mt-3"
              >
                Use Example
              </Button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Explanation</h2>

              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing code...</p>
                  </div>
                </div>
              ) : (
                <Textarea
                  value={output}
                  readOnly
                  placeholder="AI explanation will appear here..."
                  className="text-sm min-h-[400px]"
                />
              )}

              <ToolActions
                output={output}
                onReset={handleReset}
                downloadFilename="code-explanation.txt"
                disabled={!output || loading}
              />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="glass-card p-4 mt-6 border-l-4 border-primary">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> AI explanations are generated automatically and should be verified for accuracy.
            This tool is powered by Damini Codesphere.
          </p>
        </div>
      </div>
    </div>
  );
}
