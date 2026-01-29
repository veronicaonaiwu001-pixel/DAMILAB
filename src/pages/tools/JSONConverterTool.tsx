import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileJson, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import yaml from 'js-yaml';

type Format = 'json' | 'yaml' | 'xml';

export default function JSONConverterTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fromFormat, setFromFormat] = useState<Format>('json');
  const [toFormat, setToFormat] = useState<Format>('yaml');

  useEffect(() => {
    incrementToolUsage('json-converter');
  }, []);

  const jsonToXml = (obj: any, rootName: string = 'root'): string => {
    const buildXml = (data: any, name: string): string => {
      if (data === null || data === undefined) {
        return `<${name}/>`;
      }
      if (typeof data !== 'object') {
        return `<${name}>${String(data)}</${name}>`;
      }
      if (Array.isArray(data)) {
        return data.map(item => buildXml(item, 'item')).join('');
      }
      const children = Object.entries(data)
        .map(([key, value]) => buildXml(value, key))
        .join('');
      return `<${name}>${children}</${name}>`;
    };
    return `<?xml version="1.0" encoding="UTF-8"?>\n${buildXml(obj, rootName)}`;
  };

  const xmlToJson = (xmlString: string): any => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    const parseNode = (node: any): any => {
      if (node.nodeType === 3) return node.nodeValue;
      
      const obj: any = {};
      if (node.attributes && node.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let i = 0; i < node.attributes.length; i++) {
          obj['@attributes'][node.attributes[i].name] = node.attributes[i].value;
        }
      }
      
      if (node.hasChildNodes()) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          const nodeName = child.nodeName;
          
          if (child.nodeType === 3) {
            const text = child.nodeValue?.trim();
            if (text) return text;
          } else {
            if (obj[nodeName]) {
              if (!Array.isArray(obj[nodeName])) {
                obj[nodeName] = [obj[nodeName]];
              }
              obj[nodeName].push(parseNode(child));
            } else {
              obj[nodeName] = parseNode(child);
            }
          }
        }
      }
      return obj;
    };
    
    return parseNode(xmlDoc.documentElement);
  };

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error('Please enter some content to convert');
      return;
    }

    try {
      let intermediateData: any;

      // Parse input
      if (fromFormat === 'json') {
        intermediateData = JSON.parse(input);
      } else if (fromFormat === 'yaml') {
        intermediateData = yaml.load(input);
      } else {
        intermediateData = xmlToJson(input);
      }

      // Convert to output format
      let result: string;
      if (toFormat === 'json') {
        result = JSON.stringify(intermediateData, null, 2);
      } else if (toFormat === 'yaml') {
        result = yaml.dump(intermediateData, { indent: 2 });
      } else {
        result = jsonToXml(intermediateData);
      }

      setOutput(result);
      if (user) {
        addToHistory(user.id, 'json-converter', `${fromFormat.toUpperCase()} → ${toFormat.toUpperCase()}`);
      }
      toast.success('Converted successfully');
    } catch (error: any) {
      toast.error('Conversion failed: ' + error.message);
      console.error('Conversion error:', error);
    }
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
  };

  const exampleData = {
    json: '{\n  "name": "John Doe",\n  "age": 30,\n  "skills": ["JavaScript", "Python"]\n}',
    yaml: 'name: John Doe\nage: 30\nskills:\n  - JavaScript\n  - Python',
    xml: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <name>John Doe</name>\n  <age>30</age>\n  <skills>\n    <item>JavaScript</item>\n    <item>Python</item>\n  </skills>\n</root>',
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
              <FileJson className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">JSON ↔ YAML ↔ XML Converter</h1>
          </div>
          <p className="text-muted-foreground">
            Convert between JSON, YAML, and XML formats with validation
          </p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="from-format">From</Label>
              <Select value={fromFormat} onValueChange={(v: Format) => setFromFormat(v)}>
                <SelectTrigger id="from-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <div className="text-2xl">→</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-format">To</Label>
              <Select value={toFormat} onValueChange={(v: Format) => setToFormat(v)}>
                <SelectTrigger id="to-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="input">Input ({fromFormat.toUpperCase()})</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput(exampleData[fromFormat])}
                >
                  Use Example
                </Button>
              </div>
              <Textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter ${fromFormat.toUpperCase()} here...`}
                className="font-mono text-sm min-h-[400px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="output">Output ({toFormat.toUpperCase()})</Label>
              <Textarea
                id="output"
                value={output}
                readOnly
                placeholder={`Converted ${toFormat.toUpperCase()} will appear here...`}
                className="font-mono text-sm min-h-[400px]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConvert} className="flex-1">
              Convert {fromFormat.toUpperCase()} → {toFormat.toUpperCase()}
            </Button>
          </div>

          <ToolActions
            output={output}
            onReset={handleReset}
            downloadFilename={`converted.${toFormat}`}
            disabled={!output}
          />
        </div>
      </div>
    </div>
  );
}
