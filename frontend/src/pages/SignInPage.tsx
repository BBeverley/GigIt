import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export function SignInPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('dev-token-placeholder');
  const [show, setShow] = useState(false);

  const canSubmit = useMemo(() => token.trim().length > 0, [token]);

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-md items-center p-4 sm:p-6">
        <Card className="w-full rounded-2xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold tracking-tight">GigIt</CardTitle>
              <Badge variant="secondary">Dev sign-in</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              This is a placeholder login. Paste a JWT (or keep the default) to store it in{' '}
              <code className="rounded bg-muted px-1 py-0.5">localStorage</code> as{' '}
              <code className="rounded bg-muted px-1 py-0.5">token</code>.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={show ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  autoComplete="off"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={show ? 'Hide token' : 'Show token'}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">In production this will be replaced with real auth.</p>
            </div>

            <Button
              className="w-full"
              disabled={!canSubmit}
              onClick={() => {
                window.localStorage.setItem('token', token.trim());
                toast.success('Signed in');
                navigate('/', { replace: true });
              }}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

