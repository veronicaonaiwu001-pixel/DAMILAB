import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export default function BugFixerTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    incrementToolUsage('bug-fixer');
  }, []);

  const handleFix = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tools', {
        body: {
          mode: 'fix',
          code: code,
          error: errorMessage,
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
          addToHistory(user.id, 'bug-fixer', code.substring(0, 50));
        }
        toast.success('Bug fix generated successfully');
      } else {
        throw new Error('No response from AI');
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error(error.message || 'Failed to fix code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setErrorMessage('');
    setOutput('');
  };

  const exampleCode = `function divide(a, b) {
  return a / b;
}

console.log(divide(10, 0));`;

  const exampleError = `TypeError: Division by zero`;

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
              <Bug className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">AI Bug Fixer</h1>
          </div>
          <p className="text-muted-foreground">
            Submit buggy code and error messages to get corrected versions with explanations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Input</h2>

              <div className="space-y-2">
                <Label htmlFor="code">Buggy Code</Label>
                <Textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your buggy code here..."
                  className="font-mono text-sm min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="error">Error Message (Optional)</Label>
                <Textarea
                  id="error"
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="Paste error message or stack trace..."
                  className="font-mono text-sm h-24"
                />
              </div>

              <Button onClick={handleFix} className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Bug...
                  </>
                ) : (
                  <>
                    <Bug className="w-4 h-4" />
                    Fix Bug
                  </>
                )}
              </Button>
            </div>

            {/* Example */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">Example</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Code:</p>
                  <pre className="text-xs font-mono bg-black/20 p-3 rounded-lg overflow-x-auto">
                    {exampleCode}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Error:</p>
                  <pre className="text-xs font-mono bg-red-500/10 p-2 rounded-lg">
                    {exampleError}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCode(exampleCode);
                    setErrorMessage(exampleError);
                  }}
                >
                  Use Example
                </Button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Fixed Code & Explanation</h2>

              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing and fixing the bug...</p>
                  </div>
                </div>
              ) : (
                <Textarea
                  value={output}
                  readOnly
                  placeholder="Fixed code and explanation will appear here..."
                  className="text-sm min-h-[400px] font-mono"
                />
              )}

              <ToolActions
                output={output}
                onReset={handleReset}
                downloadFilename="fixed-code.txt"
                disabled={!output || loading}
              />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="glass-card p-4 mt-6 border-l-4 border-primary">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> AI-generated fixes should be reviewed and tested. Always understand the suggested changes before applying them to production code. Powered by Damini Codesphere.
          </p>
        </div>
      </div>
    </div>
  );
}
