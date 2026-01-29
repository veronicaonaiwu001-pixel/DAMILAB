import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface Header {
  id: string;
  key: string;
  value: string;
}

export default function APITesterTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([{ id: '1', key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    incrementToolUsage('api-tester');
  }, []);

  const addHeader = () => {
    const newId = (headers.length + 1).toString();
    setHeaders([...headers, { id: newId, key: '', value: '' }]);
  };

  const removeHeader = (id: string) => {
    if (headers.length > 1) {
      setHeaders(headers.filter((h) => h.id !== id));
    }
  };

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  };

  const handleSend = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Add protocol if missing
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }

    setLoading(true);
    setResponse('');
    setStatusCode(null);
    setResponseTime(null);

    const startTime = Date.now();

    try {
      // Build headers object
      const headersObj: { [key: string]: string } = {};
      headers.forEach((h) => {
        if (h.key && h.value) {
          headersObj[h.key] = h.value;
        }
      });

      // Build request options
      const options: RequestInit = {
        method,
        headers: headersObj,
      };

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body;
        // Set content-type if not already set
        if (!headersObj['Content-Type'] && !headersObj['content-type']) {
          try {
            JSON.parse(body);
            headersObj['Content-Type'] = 'application/json';
          } catch {
            headersObj['Content-Type'] = 'text/plain';
          }
        }
      }

      const res = await fetch(fullUrl, options);
      const endTime = Date.now();
      const timeTaken = endTime - startTime;

      setStatusCode(res.status);
      setResponseTime(timeTaken);

      // Try to parse as JSON, otherwise return as text
      const contentType = res.headers.get('content-type');
      let responseData;

      if (contentType?.includes('application/json')) {
        responseData = await res.json();
        setResponse(JSON.stringify(responseData, null, 2));
      } else {
        responseData = await res.text();
        setResponse(responseData);
      }

      if (user) {
        addToHistory(user.id, 'api-tester', `${method} ${url}`);
      }

      toast.success(`Request completed in ${timeTaken}ms`);
    } catch (error: any) {
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setResponse(`Error: ${error.message}`);
      toast.error(error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setBody('');
    setResponse('');
    setStatusCode(null);
    setResponseTime(null);
    setHeaders([{ id: '1', key: '', value: '' }]);
  };

  const getStatusColor = () => {
    if (!statusCode) return 'text-muted-foreground';
    if (statusCode >= 200 && statusCode < 300) return 'text-green-400';
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-400';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-400';
    return 'text-red-400';
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
              <Send className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">API Tester</h1>
          </div>
          <p className="text-muted-foreground">
            Test REST APIs with custom headers, request bodies, and view detailed responses
          </p>
        </div>

        <div className="space-y-6">
          {/* Request Configuration */}
          <div className="glass-card p-4 sm:p-6 space-y-4">
            <h2 className="font-semibold text-lg">Request</h2>

            {/* Method & URL */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="w-full sm:w-32">
                <Select value={method} onValueChange={(v: HttpMethod) => setMethod(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="flex-1 font-mono text-sm"
              />
              <Button onClick={handleSend} disabled={loading} className="gap-2 w-full sm:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </Button>
            </div>

            {/* Tabs for Headers & Body */}
            <Tabs defaultValue="headers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>

              <TabsContent value="headers" className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Custom Headers</Label>
                  <Button onClick={addHeader} size="sm" variant="outline" className="gap-1">
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {headers.map((header) => (
                    <div key={header.id} className="flex gap-2">
                      <Input
                        value={header.key}
                        onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                        placeholder="Header name"
                        className="flex-1 text-sm"
                      />
                      <Input
                        value={header.value}
                        onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                        placeholder="Header value"
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={() => removeHeader(header.id)}
                        size="icon"
                        variant="ghost"
                        className="text-red-400 shrink-0"
                        disabled={headers.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="body" className="space-y-3 mt-4">
                <Label htmlFor="body" className="text-sm">Request Body (JSON, XML, etc.)</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={'{\n  "key": "value"\n}'}
                  className="font-mono text-sm min-h-[150px]"
                  disabled={method === 'GET' || method === 'DELETE'}
                />
                {(method === 'GET' || method === 'DELETE') && (
                  <p className="text-xs text-muted-foreground">
                    Request body not supported for {method} method
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Response Section */}
          <div className="glass-card p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-semibold text-lg">Response</h2>
              
              {statusCode !== null && (
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    Status: <span className={`font-bold ${getStatusColor()}`}>{statusCode}</span>
                  </div>
                  {responseTime !== null && (
                    <div>
                      Time: <span className="font-bold text-primary">{responseTime}ms</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Sending request...</p>
                </div>
              </div>
            ) : response ? (
              <>
                <Textarea
                  value={response}
                  readOnly
                  className="font-mono text-xs min-h-[300px] max-h-[500px]"
                />
                <ToolActions
                  output={response}
                  onReset={handleReset}
                  downloadFilename="api-response.json"
                  disabled={false}
                />
              </>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Configure and send a request to see the response</p>
              </div>
            )}
          </div>

          {/* Quick Examples */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="font-semibold mb-3 text-sm">Quick Test APIs</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl('https://jsonplaceholder.typicode.com/posts/1')}
                className="justify-start"
              >
                JSONPlaceholder (GET)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUrl('https://httpbin.org/get');
                  setMethod('GET');
                }}
                className="justify-start"
              >
                HTTPBin Echo (GET)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUrl('https://httpbin.org/post');
                  setMethod('POST');
                  setBody('{"test": "data"}');
                }}
                className="justify-start"
              >
                HTTPBin Echo (POST)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl('https://api.github.com/users/github')}
                className="justify-start"
              >
                GitHub API (GET)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
