import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function PomodoroTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    incrementToolUsage('pomodoro');
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (isBreak) {
      toast.success('Break time is over! Ready for another session?');
      setIsBreak(false);
      setTimeLeft(workMinutes * 60);
    } else {
      setSessions((s) => s + 1);
      toast.success('Work session complete! Time for a break!');
      setIsBreak(true);
      setTimeLeft(breakMinutes * 60);
      
      if (user) {
        addToHistory(user.id, 'pomodoro', `Completed session ${sessions + 1}`);
      }
    }

    // Play notification sound
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: isBreak ? 'Break time over!' : 'Work session complete!',
        icon: '/favicon.ico',
      });
    }
  };

  const toggleTimer = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak
    ? ((breakMinutes * 60 - timeLeft) / (breakMinutes * 60)) * 100
    : ((workMinutes * 60 - timeLeft) / (workMinutes * 60)) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
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
              <Timer className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Pomodoro Timer</h1>
          </div>
          <p className="text-muted-foreground">
            Focus timer with custom work/break cycles for maximum productivity
          </p>
        </div>

        <div className="space-y-6">
          {/* Timer Display */}
          <div className="glass-card p-8">
            <div className="text-center space-y-6">
              <div className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary font-medium">
                {isBreak ? '☕ Break Time' : '💪 Work Session'}
              </div>

              <div className="relative">
                <svg className="w-full h-auto" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-white/10"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={565.48}
                    strokeDashoffset={565.48 - (565.48 * progress) / 100}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl font-bold">{formatTime(timeLeft)}</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={toggleTimer} size="lg" className="gap-2">
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={resetTimer} size="lg" variant="outline" className="gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Settings</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work">Work Duration (minutes)</Label>
                <Input
                  id="work"
                  type="number"
                  min="1"
                  max="60"
                  value={workMinutes}
                  onChange={(e) => {
                    setWorkMinutes(parseInt(e.target.value) || 25);
                    if (!isRunning && !isBreak) {
                      setTimeLeft((parseInt(e.target.value) || 25) * 60);
                    }
                  }}
                  disabled={isRunning}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="break">Break Duration (minutes)</Label>
                <Input
                  id="break"
                  type="number"
                  min="1"
                  max="30"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 5)}
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card p-6">
            <h2 className="font-semibold text-lg mb-4">Session Stats</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{sessions}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{sessions * workMinutes}</div>
                <div className="text-sm text-muted-foreground">Minutes Focused</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">
                  {Math.floor((sessions * workMinutes) / 60)}h {(sessions * workMinutes) % 60}m
                </div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
