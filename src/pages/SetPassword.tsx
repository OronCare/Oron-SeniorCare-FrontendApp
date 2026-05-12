import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { Button, Card, Input } from '../components/UI';
import { AuthBrandMark } from '../components/auth/AuthBrandMark';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiMessage';

export const SetPassword = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't hard-disable based on local state because browser autofill
  // may not trigger React onChange events (state stays empty).
  const canSubmit = !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      const msg = 'Missing token. Please use the link from your email.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (confirmPassword.length < 8) {
      const msg = 'Confirm password must be at least 8 characters.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (password !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      if (!apiBase) {
        throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
      }

      const res = await fetch(`${apiBase}/auth/password/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      if (!res.ok) {
        let body: any = null;
        try {
          body = await res.json();
        } catch {
          body = null;
        }
        const message =
          body?.message && Array.isArray(body.message) ? body.message.join(', ') : body?.message;
        throw new Error(message || `Failed to set password (HTTP ${res.status})`);
      }

      toast.success('Password set successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to set password');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-brand-600 rounded-b-[100px] opacity-10 transform -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-400 rounded-full opacity-5 blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <AuthBrandMark />
        <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight text-slate-900">
          Set your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Choose a new password to activate your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="py-8 px-4 sm:px-10 shadow-xl border-0 ring-1 ring-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="New password"
                type="password"
                required
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Input
                label="Confirm password"
                type="password"
                required
                icon={Lock}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}
              {!token && (
                <p className="text-sm text-amber-700">
                  Missing token. Please open the set-password link from your email.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={!canSubmit}>
              Set password <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

