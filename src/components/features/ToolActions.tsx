import { Copy, Download, Share2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ToolActionsProps {
  output: string;
  onReset?: () => void;
  downloadFilename?: string;
  disabled?: boolean;
}

export function ToolActions({ output, onReset, downloadFilename, disabled }: ToolActionsProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename || 'output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DAMI LAB Output',
          text: output,
        });
        toast.success('Shared successfully');
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handleCopy} disabled={disabled || !output} variant="outline" size="sm" className="gap-2">
        <Copy className="w-4 h-4" />
        Copy
      </Button>
      <Button onClick={handleDownload} disabled={disabled || !output} variant="outline" size="sm" className="gap-2">
        <Download className="w-4 h-4" />
        Download
      </Button>
      <Button onClick={handleShare} disabled={disabled || !output} variant="outline" size="sm" className="gap-2">
        <Share2 className="w-4 h-4" />
        Share
      </Button>
      {onReset && (
        <Button onClick={onReset} variant="outline" size="sm" className="gap-2 ml-auto">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
