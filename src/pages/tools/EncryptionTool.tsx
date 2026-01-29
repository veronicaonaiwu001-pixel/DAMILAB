import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

type Mode = 'encrypt' | 'decrypt';
type Algorithm = 'aes' | 'des' | 'rabbit' | 'rc4';

export default function EncryptionTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('encrypt');
  const [algorithm, setAlgorithm] = useState<Algorithm>('aes');
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    incrementToolUsage('encryption-tool');
  }, []);

  const handleProcess = () => {
    if (!input.trim()) {
      toast.error('Please enter text to process');
      return;
    }

    if (!key.trim()) {
      toast.error('Please enter an encryption key');
      return;
    }

    try {
      let result = '';

      if (mode === 'encrypt') {
        switch (algorithm) {
          case 'aes':
            result = CryptoJS.AES.encrypt(input, key).toString();
            break;
          case 'des':
            result = CryptoJS.DES.encrypt(input, key).toString();
            break;
          case 'rabbit':
            result = CryptoJS.Rabbit.encrypt(input, key).toString();
            break;
          case 'rc4':
            result = CryptoJS.RC4.encrypt(input, key).toString();
            break;
        }
      } else {
        switch (algorithm) {
          case 'aes':
            result = CryptoJS.AES.decrypt(input, key).toString(CryptoJS.enc.Utf8);
            break;
          case 'des':
            result = CryptoJS.DES.decrypt(input, key).toString(CryptoJS.enc.Utf8);
            break;
          case 'rabbit':
            result = CryptoJS.Rabbit.decrypt(input, key).toString(CryptoJS.enc.Utf8);
            break;
          case 'rc4':
            result = CryptoJS.RC4.decrypt(input, key).toString(CryptoJS.enc.Utf8);
            break;
        }

        if (!result) {
          throw new Error('Decryption failed - wrong key or corrupted data');
        }
      }

      setOutput(result);
      if (user) {
        addToHistory(user.id, 'encryption-tool', `${mode} with ${algorithm.toUpperCase()}`);
      }
      toast.success(`${mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
      console.error('Encryption error:', error);
    }
  };

  const handleReset = () => {
    setInput('');
    setKey('');
    setOutput('');
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let randomKey = '';
    for (let i = 0; i < 32; i++) {
      randomKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setKey(randomKey);
    toast.success('Random key generated');
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
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Encryption/Decryption Tool</h1>
          </div>
          <p className="text-muted-foreground">
            Encrypt and decrypt text using AES, DES, Rabbit, and RC4 algorithms
          </p>
        </div>

        <div className="glass-card p-4 sm:p-6 md:p-8 space-y-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
              <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="algorithm">Algorithm</Label>
                  <Select value={algorithm} onValueChange={(v: Algorithm) => setAlgorithm(v)}>
                    <SelectTrigger id="algorithm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aes">AES (Advanced Encryption Standard)</SelectItem>
                      <SelectItem value="des">DES (Data Encryption Standard)</SelectItem>
                      <SelectItem value="rabbit">Rabbit (Stream Cipher)</SelectItem>
                      <SelectItem value="rc4">RC4 (Rivest Cipher 4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key">Encryption Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="key"
                      type="password"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder="Enter your secret key..."
                      className="flex-1"
                    />
                    <Button onClick={generateRandomKey} variant="outline" size="icon">
                      🔑
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="input">
                    {mode === 'encrypt' ? 'Plain Text' : 'Encrypted Text'}
                  </Label>
                  <Textarea
                    id="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      mode === 'encrypt'
                        ? 'Enter text to encrypt...'
                        : 'Enter encrypted text to decrypt...'
                    }
                    className={mode === 'decrypt' ? 'font-mono text-xs' : ''}
                    rows={12}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="output">
                    {mode === 'encrypt' ? 'Encrypted Output' : 'Decrypted Output'}
                  </Label>
                  <Textarea
                    id="output"
                    value={output}
                    readOnly
                    placeholder={
                      mode === 'encrypt'
                        ? 'Encrypted result will appear here...'
                        : 'Decrypted result will appear here...'
                    }
                    className={mode === 'encrypt' ? 'font-mono text-xs' : ''}
                    rows={12}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleProcess} className="flex-1">
                  {mode === 'encrypt' ? 'Encrypt Text' : 'Decrypt Text'}
                </Button>
              </div>

              <ToolActions
                output={output}
                onReset={handleReset}
                downloadFilename={mode === 'encrypt' ? 'encrypted.txt' : 'decrypted.txt'}
                disabled={!output}
              />
            </div>
          </Tabs>
        </div>

        {/* Security Warning */}
        <div className="glass-card p-4 mt-6 border-l-4 border-yellow-500">
          <h3 className="font-semibold mb-2 text-yellow-400">⚠️ Security Notice</h3>
          <p className="text-sm text-muted-foreground">
            <strong>Important:</strong> This is a client-side encryption tool for basic use. For sensitive data,
            use industry-standard encryption with proper key management. Never share your encryption keys.
            The key is required for decryption - if lost, data cannot be recovered.
          </p>
        </div>
      </div>
    </div>
  );
}
