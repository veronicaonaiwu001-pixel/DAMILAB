import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Wifi, Mail, Phone, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type QRType = 'text' | 'url' | 'wifi' | 'email';

export default function QRGeneratorTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qrType, setQrType] = useState<QRType>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [size, setSize] = useState(256);

  useEffect(() => {
    incrementToolUsage('qr-generator');
  }, []);

  const getQRValue = (): string => {
    switch (qrType) {
      case 'text':
        return text;
      case 'url':
        return url;
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${ssid};P:${wifiPassword};;`;
      case 'email':
        return `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
      default:
        return '';
    }
  };

  const qrValue = getQRValue();

  const handleDownload = () => {
    const svg = document.getElementById('qr-code') as any;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('QR code downloaded');
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

    if (user) {
      addToHistory(user.id, 'qr-generator', `${qrType}: ${qrValue.substring(0, 50)}`);
    }
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
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">QR Code Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Generate QR codes for text, URLs, WiFi credentials, and email addresses
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <Tabs value={qrType} onValueChange={(v) => setQrType(v as QRType)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="wifi">WiFi</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text">Text Content</Label>
                    <Textarea
                      id="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter any text..."
                      className="min-h-[150px]"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="wifi" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ssid">Network Name (SSID)</Label>
                    <Input
                      id="ssid"
                      value={ssid}
                      onChange={(e) => setSsid(e.target.value)}
                      placeholder="MyWiFiNetwork"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wifi-password">Password</Label>
                    <Input
                      id="wifi-password"
                      type="password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="WiFi password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="encryption">Encryption</Label>
                    <Select value={wifiEncryption} onValueChange={setWifiEncryption}>
                      <SelectTrigger id="encryption">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WPA">WPA/WPA2</SelectItem>
                        <SelectItem value="WEP">WEP</SelectItem>
                        <SelectItem value="nopass">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="someone@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject (Optional)</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email subject"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label htmlFor="size">QR Code Size</Label>
                <Select value={size.toString()} onValueChange={(v) => setSize(parseInt(v))}>
                  <SelectTrigger id="size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">Small (128px)</SelectItem>
                    <SelectItem value="256">Medium (256px)</SelectItem>
                    <SelectItem value="512">Large (512px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="glass-card p-6">
              <h2 className="font-semibold text-lg mb-4">Preview</h2>

              {qrValue ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG
                      id="qr-code"
                      value={qrValue}
                      size={size}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <Button onClick={handleDownload} className="w-full gap-2">
                    <QrCode className="w-4 h-4" />
                    Download QR Code
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[300px] text-center">
                  <div>
                    <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Fill in the details to generate a QR code
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
