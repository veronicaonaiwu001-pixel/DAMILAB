import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToolActions } from '@/components/features/ToolActions';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DecodedJWT {
  header: any;
  payload: any;
  signature: string;
  isExpired: boolean;
  expiresAt?: string;
  issuedAt?: string;
}

export default function JWTDecoderTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jwt, setJwt] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    incrementToolUsage('jwt-decoder');
  }, []);

  const decodeJWT = (token: string) => {
    if (!token.trim()) {
      setDecoded(null);
      setError('');
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format - must have 3 parts separated by dots');
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      const signature = parts[2];

      let isExpired = false;
      let expiresAt: string | undefined;
      let issuedAt: string | undefined;

      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        expiresAt = expDate.toISOString();
        isExpired = expDate < new Date();
      }

      if (payload.iat) {
        issuedAt = new Date(payload.iat * 1000).toISOString();
      }

      setDecoded({ header, payload, signature, isExpired, expiresAt, issuedAt });
      setError('');

      if (user) {
        addToHistory(user.id, 'jwt-decoder', 'Decoded JWT token');
      }

      toast.success('JWT decoded successfully');
    } catch (err: any) {
      setError(err.message);
      setDecoded(null);
      toast.error('Failed to decode JWT');
    }
  };

  useEffect(() => {
    decodeJWT(jwt);
  }, [jwt]);

  const exampleJWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  const output = decoded
    ? `HEADER:\n${JSON.stringify(decoded.header, null, 2)}\n\nPAYLOAD:\n${JSON.stringify(
        decoded.payload,
        null,
        2
      )}\n\nSIGNATURE:\n${decoded.signature}\n\nSTATUS:\nExpired: ${decoded.isExpired}\n${
        decoded.expiresAt ? `Expires At: ${decoded.expiresAt}` : ''
      }\n${decoded.issuedAt ? `Issued At: ${decoded.issuedAt}` : ''}`
    : '';

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
              <Key className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">JWT Decoder</h1>
          </div>
          <p className="text-muted-foreground">
            Decode and analyze JSON Web Tokens (JWT) with expiration checking
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">JWT Token</h2>

              <div className="space-y-2">
                <Label htmlFor="jwt">Paste JWT Token</Label>
                <Textarea
                  id="jwt"
                  value={jwt}
                  onChange={(e) => setJwt(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="font-mono text-xs min-h-[150px]"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <Button onClick={() => setJwt(exampleJWT)} variant="outline" className="w-full">
                Use Example JWT
              </Button>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">JWT Structure</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-mono text-primary">Header</span> - Algorithm and token type
                </div>
                <div>
                  <span className="font-mono text-blue-400">Payload</span> - Claims and data
                </div>
                <div>
                  <span className="font-mono text-yellow-400">Signature</span> - Verification
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-muted-foreground">
                    Format: <span className="font-mono text-primary">header</span>.
                    <span className="font-mono text-blue-400">payload</span>.
                    <span className="font-mono text-yellow-400">signature</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {decoded && (
              <>
                <div className="glass-card p-6 space-y-4">
                  <h2 className="font-semibold text-lg">Decoded Information</h2>

                  {decoded.isExpired && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                      ⚠️ This token has expired
                    </div>
                  )}

                  {!decoded.isExpired && decoded.expiresAt && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
                      ✓ Token is valid
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-primary">Header</h3>
                      <pre className="p-3 bg-black/20 rounded-lg text-xs font-mono overflow-x-auto">
                        {JSON.stringify(decoded.header, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-blue-400">Payload</h3>
                      <pre className="p-3 bg-black/20 rounded-lg text-xs font-mono overflow-x-auto">
                        {JSON.stringify(decoded.payload, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-yellow-400">Signature</h3>
                      <pre className="p-3 bg-black/20 rounded-lg text-xs font-mono overflow-x-auto break-all">
                        {decoded.signature}
                      </pre>
                    </div>

                    {(decoded.issuedAt || decoded.expiresAt) && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Timestamps</h3>
                        <div className="space-y-1 text-sm">
                          {decoded.issuedAt && (
                            <div>
                              <span className="text-muted-foreground">Issued:</span>{' '}
                              {new Date(decoded.issuedAt).toLocaleString()}
                            </div>
                          )}
                          {decoded.expiresAt && (
                            <div>
                              <span className="text-muted-foreground">Expires:</span>{' '}
                              {new Date(decoded.expiresAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <ToolActions
                    output={output}
                    onReset={() => setJwt('')}
                    downloadFilename="jwt-decoded.txt"
                    disabled={false}
                  />
                </div>
              </>
            )}

            {!decoded && !error && (
              <div className="glass-card p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Paste a JWT token to decode it</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-4 mt-6 border-l-4 border-primary">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This tool only decodes JWT tokens. It does not verify signatures.
            All decoding happens in your browser - tokens are never sent to any server.
          </p>
        </div>
      </div>
    </div>
  );
}
