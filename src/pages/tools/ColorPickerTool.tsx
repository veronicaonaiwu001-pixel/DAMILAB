import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, ArrowLeft, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function ColorPickerTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [color, setColor] = useState('#a855f7');
  const [hex, setHex] = useState('#a855f7');
  const [rgb, setRgb] = useState({ r: 168, g: 85, b: 247 });
  const [hsl, setHsl] = useState({ h: 277, s: 91, l: 65 });
  const [palette, setPalette] = useState<string[]>([]);

  useEffect(() => {
    incrementToolUsage('color-picker');
  }, []);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const updateColor = (newColor: string) => {
    setColor(newColor);
    setHex(newColor);
    const rgbVal = hexToRgb(newColor);
    setRgb(rgbVal);
    setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
    
    if (user) {
      addToHistory(user.id, 'color-picker', newColor);
    }
  };

  const generatePalette = () => {
    const baseRgb = hexToRgb(color);
    const colors: string[] = [color];

    // Generate complementary colors
    const complementary = `#${(0xffffff - parseInt(color.slice(1), 16)).toString(16).padStart(6, '0')}`;
    colors.push(complementary);

    // Generate analogous colors
    for (let i = 1; i <= 3; i++) {
      const angle = (hsl.h + (30 * i)) % 360;
      const newColor = hslToHex(angle, hsl.s, hsl.l);
      colors.push(newColor);
    }

    setPalette(colors);
    toast.success('Palette generated');
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const randomColor = () => {
    const random = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    updateColor(random);
  };

  const outputText = `HEX: ${hex}\nRGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nHSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)\n\nPalette:\n${palette.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;

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
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Color Picker & Palette Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Pick colors and generate palettes in HEX, RGB, and HSL formats
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Color Picker</h2>

              <div className="space-y-4">
                <div 
                  className="w-full h-48 rounded-lg border-4 border-white/20 cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                  onClick={() => document.getElementById('color-input')?.click()}
                />

                <input
                  id="color-input"
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(e.target.value)}
                  className="sr-only"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => document.getElementById('color-input')?.click()}>
                    Pick Color
                  </Button>
                  <Button onClick={randomColor} variant="outline" className="gap-2">
                    <Shuffle className="w-4 h-4" />
                    Random
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="space-y-2">
                  <Label htmlFor="hex">HEX</Label>
                  <Input
                    id="hex"
                    value={hex}
                    onChange={(e) => {
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                        setHex(e.target.value);
                        if (e.target.value.length === 7) updateColor(e.target.value);
                      }
                    }}
                    className="font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="r">R</Label>
                    <Input
                      id="r"
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.r}
                      readOnly
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="g">G</Label>
                    <Input
                      id="g"
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.g}
                      readOnly
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b">B</Label>
                    <Input
                      id="b"
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.b}
                      readOnly
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="h">H</Label>
                    <Input
                      id="h"
                      type="number"
                      min="0"
                      max="360"
                      value={hsl.h}
                      readOnly
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s">S%</Label>
                    <Input
                      id="s"
                      type="number"
                      min="0"
                      max="100"
                      value={hsl.s}
                      readOnly
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l">L%</Label>
                    <Input
                      id="l"
                      type="number"
                      min="0"
                      max="100"
                      value={hsl.l}
                      readOnly
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Color Palette</h2>
                <Button onClick={generatePalette} size="sm" className="gap-2">
                  <Palette className="w-4 h-4" />
                  Generate
                </Button>
              </div>

              {palette.length > 0 ? (
                <div className="space-y-3">
                  {palette.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-lg border-2 border-white/20"
                        style={{ backgroundColor: c }}
                      />
                      <div className="flex-1">
                        <div className="font-mono text-sm">{c}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(c);
                            toast.success('Color copied');
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Generate" to create a color palette</p>
                </div>
              )}

              <ToolActions
                output={outputText}
                onReset={() => setPalette([])}
                downloadFilename="colors.txt"
                disabled={palette.length === 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
