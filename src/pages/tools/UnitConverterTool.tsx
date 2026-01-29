import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';

const CONVERSIONS = {
  length: {
    units: ['Meters', 'Kilometers', 'Centimeters', 'Millimeters', 'Miles', 'Yards', 'Feet', 'Inches'],
    toBase: { Meters: 1, Kilometers: 1000, Centimeters: 0.01, Millimeters: 0.001, Miles: 1609.34, Yards: 0.9144, Feet: 0.3048, Inches: 0.0254 },
  },
  weight: {
    units: ['Kilograms', 'Grams', 'Milligrams', 'Pounds', 'Ounces', 'Tons'],
    toBase: { Kilograms: 1, Grams: 0.001, Milligrams: 0.000001, Pounds: 0.453592, Ounces: 0.0283495, Tons: 1000 },
  },
  temperature: {
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    convert: (value: number, from: string, to: string) => {
      let celsius = value;
      if (from === 'Fahrenheit') celsius = (value - 32) * 5/9;
      if (from === 'Kelvin') celsius = value - 273.15;

      if (to === 'Fahrenheit') return celsius * 9/5 + 32;
      if (to === 'Kelvin') return celsius + 273.15;
      return celsius;
    },
  },
  speed: {
    units: ['Meters/sec', 'Kilometers/hr', 'Miles/hr', 'Feet/sec', 'Knots'],
    toBase: { 'Meters/sec': 1, 'Kilometers/hr': 0.277778, 'Miles/hr': 0.44704, 'Feet/sec': 0.3048, Knots: 0.514444 },
  },
  storage: {
    units: ['Bytes', 'Kilobytes', 'Megabytes', 'Gigabytes', 'Terabytes'],
    toBase: { Bytes: 1, Kilobytes: 1024, Megabytes: 1048576, Gigabytes: 1073741824, Terabytes: 1099511627776 },
  },
};

type Category = keyof typeof CONVERSIONS;

export default function UnitConverterTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState<Category>('length');
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('Meters');
  const [toUnit, setToUnit] = useState('Feet');
  const [result, setResult] = useState('');

  useEffect(() => {
    incrementToolUsage('unit-converter');
  }, []);

  useEffect(() => {
    const config = CONVERSIONS[category];
    setFromUnit(config.units[0]);
    setToUnit(config.units[1]);
  }, [category]);

  useEffect(() => {
    convert();
  }, [value, fromUnit, toUnit, category]);

  const convert = () => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      setResult('');
      return;
    }

    const config = CONVERSIONS[category];

    if (category === 'temperature') {
      const converted = config.convert(num, fromUnit, toUnit);
      setResult(converted.toFixed(4));
    } else {
      const toBase = config.toBase[fromUnit as keyof typeof config.toBase];
      const fromBase = config.toBase[toUnit as keyof typeof config.toBase];
      const converted = (num * toBase) / fromBase;
      setResult(converted.toFixed(6));
    }

    if (user && num !== 0) {
      addToHistory(user.id, 'unit-converter', `${value} ${fromUnit} to ${toUnit}`);
    }
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
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
              <ArrowLeftRight className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Unit Converter</h1>
          </div>
          <p className="text-muted-foreground">
            Convert between units of length, weight, temperature, speed, and storage
          </p>
        </div>

        <div className="glass-card p-4 sm:p-6 md:p-8 space-y-6">
          <Tabs value={category} onValueChange={(v) => setCategory(v as Category)}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1">
              <TabsTrigger value="length">Length</TabsTrigger>
              <TabsTrigger value="weight">Weight</TabsTrigger>
              <TabsTrigger value="temperature">Temp</TabsTrigger>
              <TabsTrigger value="speed">Speed</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="from-unit">From</Label>
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger id="from-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONVERSIONS[category].units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={swap} size="icon" variant="outline">
                <ArrowLeftRight className="w-4 h-4" />
              </Button>

              <div className="space-y-2">
                <Label htmlFor="to-unit">To</Label>
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger id="to-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONVERSIONS[category].units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {result && (
              <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Result</div>
                  <div className="text-4xl font-bold text-primary mb-1">{result}</div>
                  <div className="text-muted-foreground">{toUnit}</div>
                </div>
              </div>
            )}

            {!result && value && (
              <div className="text-center py-8 text-muted-foreground">
                Enter a valid number to convert
              </div>
            )}
          </div>

          {/* Quick Reference */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="font-semibold mb-3 text-sm">Quick Reference</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {category === 'length' && (
                <>
                  <div>1 mile = 1.609 km</div>
                  <div>1 inch = 2.54 cm</div>
                  <div>1 yard = 0.914 m</div>
                  <div>1 foot = 30.48 cm</div>
                </>
              )}
              {category === 'weight' && (
                <>
                  <div>1 kg = 2.205 lbs</div>
                  <div>1 lb = 16 oz</div>
                  <div>1 ton = 1000 kg</div>
                  <div>1 oz = 28.35 g</div>
                </>
              )}
              {category === 'temperature' && (
                <>
                  <div>Water freezes: 0°C = 32°F</div>
                  <div>Water boils: 100°C = 212°F</div>
                  <div>Body temp: 37°C = 98.6°F</div>
                  <div>Absolute zero: -273.15°C</div>
                </>
              )}
              {category === 'speed' && (
                <>
                  <div>1 m/s = 3.6 km/h</div>
                  <div>1 mph = 1.609 km/h</div>
                  <div>1 knot = 1.852 km/h</div>
                  <div>Speed of sound ≈ 343 m/s</div>
                </>
              )}
              {category === 'storage' && (
                <>
                  <div>1 KB = 1024 Bytes</div>
                  <div>1 MB = 1024 KB</div>
                  <div>1 GB = 1024 MB</div>
                  <div>1 TB = 1024 GB</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
