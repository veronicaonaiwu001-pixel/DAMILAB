import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCode2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import * as prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserPostcss from 'prettier/parser-postcss';
import parserTypescript from 'prettier/parser-typescript';

type Language = 'javascript' | 'typescript' | 'html' | 'css' | 'json';

export default function CodeFormatterTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>('javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    incrementToolUsage('code-formatter');
  }, []);

  const handleFormat = async () => {
    if (!input.trim()) {
      toast.error('Please enter code to format');
      return;
    }

    try {
      let formatted = '';
      const options: any = {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 80,
      };

      switch (language) {
        case 'javascript':
          formatted = await prettier.format(input, {
            ...options,
            parser: 'babel',
            plugins: [parserBabel],
          });
          break;
        case 'typescript':
          formatted = await prettier.format(input, {
            ...options,
            parser: 'typescript',
            plugins: [parserTypescript],
          });
          break;
        case 'html':
          formatted = await prettier.format(input, {
            ...options,
            parser: 'html',
            plugins: [parserHtml],
          });
          break;
        case 'css':
          formatted = await prettier.format(input, {
            ...options,
            parser: 'css',
            plugins: [parserPostcss],
          });
          break;
        case 'json':
          formatted = await prettier.format(input, {
            ...options,
            parser: 'json',
            plugins: [parserBabel],
          });
          break;
      }

      setOutput(formatted);
      if (user) {
        addToHistory(user.id, 'code-formatter', `Formatted ${language}`);
      }
      toast.success('Code formatted successfully');
    } catch (error: any) {
      toast.error('Format error: ' + error.message);
      console.error('Format error:', error);
    }
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
  };

  const examples: { [key in Language]: string } = {
    javascript: `function hello(name){const greeting="Hello, "+name;return greeting}`,
    typescript: `interface User{name:string;age:number}function greet(user:User):void{console.log("Hello, "+user.name)}`,
    html: `<div><h1>Title</h1><p>This is a paragraph</p><button>Click me</button></div>`,
    css: `.button{background-color:blue;color:white;padding:10px;border-radius:5px}`,
    json: `{"name":"John","age":30,"skills":["JavaScript","TypeScript","React"]}`,
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
              <FileCode2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Code Formatter</h1>
          </div>
          <p className="text-muted-foreground">
            Format JavaScript, TypeScript, HTML, CSS, and JSON with automatic beautification
          </p>
        </div>

        <div className="glass-card p-4 sm:p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={(v: Language) => setLanguage(v)}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setInput(examples[language])} variant="outline" size="sm">
              Use Example
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="input">Unformatted Code</Label>
              <Textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your unformatted code here..."
                className="font-mono text-sm min-h-[400px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="output">Formatted Code</Label>
              <Textarea
                id="output"
                value={output}
                readOnly
                placeholder="Formatted code will appear here..."
                className="font-mono text-sm min-h-[400px]"
              />
            </div>
          </div>

          <Button onClick={handleFormat} className="w-full">
            Format Code
          </Button>

          <ToolActions
            output={output}
            onReset={handleReset}
            downloadFilename={`formatted.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language}`}
            disabled={!output}
          />
        </div>
      </div>
    </div>
  );
}
