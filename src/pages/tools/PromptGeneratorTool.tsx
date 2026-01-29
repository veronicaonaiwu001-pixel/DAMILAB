import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Loader2, ArrowLeft } from 'lucide-react';
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

const PROMPT_TYPES = {
  dev: 'Development & Coding',
  writing: 'Content Writing',
  business: 'Business & Marketing',
  research: 'Research & Analysis',
  creative: 'Creative & Design',
};

export default function PromptGeneratorTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [promptType, setPromptType] = useState('dev');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    incrementToolUsage('prompt-generator');
  }, []);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please describe what you need');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tools', {
        body: {
          mode: 'generate-prompt',
          prompt: `Create an optimized AI prompt for ${PROMPT_TYPES[promptType as keyof typeof PROMPT_TYPES]}: ${description}`,
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
          addToHistory(user.id, 'prompt-generator', description.substring(0, 50));
        }
        toast.success('Prompt generated successfully');
      } else {
        throw new Error('No response from AI');
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error(error.message || 'Failed to generate prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setOutput('');
  };

  const examples = [
    'Create a REST API for a task management app',
    'Write a blog post about sustainable living',
    'Generate marketing copy for a fitness app',
    'Analyze customer feedback sentiment',
  ];

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
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">AI Prompt Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Generate optimized prompts for AI models based on your requirements
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Input</h2>

              <div className="space-y-2">
                <Label htmlFor="type">Prompt Type</Label>
                <Select value={promptType} onValueChange={setPromptType}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROMPT_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">What do you need?</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you want to achieve with AI..."
                  className="min-h-[200px]"
                />
              </div>

              <Button onClick={handleGenerate} className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    Generate Prompt
                  </>
                )}
              </Button>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">Examples</h3>
              <div className="space-y-2">
                {examples.map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setDescription(example)}
                    className="w-full justify-start text-left h-auto py-2"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Optimized Prompt</h2>

              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Generating optimized prompt...</p>
                  </div>
                </div>
              ) : (
                <Textarea
                  value={output}
                  readOnly
                  placeholder="Your optimized prompt will appear here..."
                  className="text-sm min-h-[400px]"
                />
              )}

              <ToolActions
                output={output}
                onReset={handleReset}
                downloadFilename="prompt.txt"
                disabled={!output || loading}
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-4 mt-6 border-l-4 border-primary">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> The more specific your description, the better the generated prompt will be.
            Include details about tone, format, length, and target audience. Powered by Damini Codesphere.
          </p>
        </div>
      </div>
    </div>
  );
}
