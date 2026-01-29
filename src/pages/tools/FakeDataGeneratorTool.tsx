import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const FIRST_NAMES = {
  male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'],
};

const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const STREETS = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Ave', 'Park Pl', 'Highland Dr', 'Lake View'];

const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin', 'Jacksonville', 'Columbus', 'San Francisco', 'Indianapolis', 'Seattle'];

const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com', 'test.com'];

interface FakeData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  age: number;
}

export default function FakeDataGeneratorTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gender, setGender] = useState<'male' | 'female' | 'random'>('random');
  const [count, setCount] = useState(1);
  const [data, setData] = useState<FakeData[]>([]);

  useEffect(() => {
    incrementToolUsage('fake-data-generator');
  }, []);

  const random = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateData = () => {
    const generated: FakeData[] = [];

    for (let i = 0; i < count; i++) {
      const selectedGender = gender === 'random' ? random(['male', 'female'] as const) : gender;
      const firstName = random(FIRST_NAMES[selectedGender]);
      const lastName = random(LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@${random(DOMAINS)}`;
      const phone = `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
      const streetNumber = Math.floor(Math.random() * 9999) + 1;
      const address = `${streetNumber} ${random(STREETS)}`;
      const city = random(CITIES);
      const zipCode = (Math.floor(Math.random() * 90000) + 10000).toString();
      const age = Math.floor(Math.random() * 60) + 18;

      generated.push({ name, email, phone, address, city, zipCode, age });
    }

    setData(generated);
    if (user) {
      addToHistory(user.id, 'fake-data-generator', `Generated ${count} records`);
    }
    toast.success(`Generated ${count} fake data record${count > 1 ? 's' : ''}`);
  };

  const output = data
    .map((d, i) => `Record ${i + 1}:\nName: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nAddress: ${d.address}, ${d.city} ${d.zipCode}\nAge: ${d.age}`)
    .join('\n\n');

  const downloadCSV = () => {
    const csv = [
      'Name,Email,Phone,Address,City,Zip Code,Age',
      ...data.map((d) => `"${d.name}","${d.email}","${d.phone}","${d.address}","${d.city}","${d.zipCode}",${d.age}`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fake-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

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
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Fake Data Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Generate fake names, addresses, and personal data for testing purposes
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Settings</h2>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Number of Records</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>

              <Button onClick={generateData} className="w-full">
                Generate Data
              </Button>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">Export Options</h3>
              <div className="space-y-2">
                <Button
                  onClick={downloadCSV}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={data.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Download as CSV
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Generated Data ({data.length})</h2>

              {data.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {data.map((person, i) => (
                    <div key={i} className="p-4 bg-black/20 rounded-lg space-y-1 text-sm">
                      <div className="font-semibold text-primary">{person.name}</div>
                      <div className="text-muted-foreground">{person.email}</div>
                      <div className="text-muted-foreground">{person.phone}</div>
                      <div className="text-muted-foreground">
                        {person.address}, {person.city} {person.zipCode}
                      </div>
                      <div className="text-muted-foreground">Age: {person.age}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Generate Data" to create fake data</p>
                </div>
              )}

              <ToolActions
                output={output}
                onReset={() => setData([])}
                downloadFilename="fake-data.txt"
                disabled={data.length === 0}
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-4 mt-6 border-l-4 border-yellow-500">
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This data is completely fake and randomly generated for testing purposes only.
            Do not use for any illegal or unethical activities.
          </p>
        </div>
      </div>
    </div>
  );
}
