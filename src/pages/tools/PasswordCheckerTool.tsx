import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Check, X, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  feedback: string[];
  entropy: number;
}

export default function PasswordCheckerTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    incrementToolUsage('password-checker');
  }, []);

  useEffect(() => {
    if (password) {
      analyzePassword(password);
    } else {
      setStrength(null);
    }
  }, [password]);

  const analyzePassword = (pwd: string) => {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (pwd.length >= 8) score += 20;
    else feedback.push('Use at least 8 characters');

    if (pwd.length >= 12) score += 10;
    if (pwd.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(pwd)) score += 15;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(pwd)) score += 15;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(pwd)) score += 15;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(pwd)) score += 15;
    else feedback.push('Include special characters (!@#$%^&*)');

    // Patterns check
    if (/(.)\1{2,}/.test(pwd)) {
      score -= 10;
      feedback.push('Avoid repeated characters');
    }

    if (/^[0-9]+$/.test(pwd)) {
      score -= 20;
      feedback.push('Don\'t use only numbers');
    }

    if (/^[a-zA-Z]+$/.test(pwd)) {
      score -= 10;
      feedback.push('Mix letters with numbers and symbols');
    }

    // Common patterns
    const commonPatterns = ['123', '234', 'abc', 'qwerty', 'password', 'admin'];
    if (commonPatterns.some(pattern => pwd.toLowerCase().includes(pattern))) {
      score -= 15;
      feedback.push('Avoid common words and sequences');
    }

    // Calculate entropy (rough estimate)
    let charsetSize = 0;
    if (/[a-z]/.test(pwd)) charsetSize += 26;
    if (/[A-Z]/.test(pwd)) charsetSize += 26;
    if (/[0-9]/.test(pwd)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) charsetSize += 32;

    const entropy = pwd.length * Math.log2(charsetSize);

    // Normalize score
    score = Math.max(0, Math.min(100, score));

    let label = '';
    let color = '';

    if (score < 40) {
      label = 'Weak';
      color = 'text-red-500';
    } else if (score < 60) {
      label = 'Fair';
      color = 'text-orange-500';
    } else if (score < 80) {
      label = 'Good';
      color = 'text-yellow-500';
    } else {
      label = 'Strong';
      color = 'text-green-500';
    }

    if (feedback.length === 0) {
      feedback.push('Your password looks great!');
    }

    setStrength({
      score,
      label,
      color,
      feedback,
      entropy: Math.round(entropy),
    });

    if (user && score > 0) {
      addToHistory(user.id, 'password-checker', `Strength: ${label}`);
    }
  };

  const handleReset = () => {
    setPassword('');
    setStrength(null);
  };

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
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
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Password Strength Checker</h1>
          </div>
          <p className="text-muted-foreground">
            Test your password strength with entropy scoring and get improvement suggestions
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card p-8 space-y-6">
          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="password">Enter Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type your password here..."
                className="pr-24 text-lg"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your password is never sent to any server - all checks happen in your browser
            </p>
          </div>

          {/* Strength Meter */}
          {strength && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Password Strength</span>
                  <span className={`text-lg font-bold ${strength.color}`}>{strength.label}</span>
                </div>
                <Progress value={strength.score} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Score: {strength.score}/100</span>
                  <span className="text-muted-foreground">Entropy: {strength.entropy} bits</span>
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="font-semibold">Requirements</h3>
                <div className="space-y-2">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {req.met ? (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Suggestions
                </h3>
                <ul className="space-y-2">
                  {strength.feedback.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={handleReset} variant="outline" className="w-full">
                Reset
              </Button>
            </>
          )}

          {!strength && (
            <div className="text-center py-12 text-muted-foreground">
              <KeyRound className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Enter a password to check its strength</p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="glass-card p-4 mt-6 border-l-4 border-primary">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Privacy & Security
          </h3>
          <p className="text-sm text-muted-foreground">
            This tool performs all checks locally in your browser. Your password is never transmitted
            over the network or stored anywhere. For maximum security, use a unique password for each
            account and consider using a password manager.
          </p>
        </div>
      </div>
    </div>
  );
}
