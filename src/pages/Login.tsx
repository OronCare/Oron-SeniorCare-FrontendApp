import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import { getApiErrorMessage } from '../utils/apiMessage';

export const Login = () => {
  const { login, user, isAuthenticated, isAuthReady } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthReady && isAuthenticated && user) {
    const path = user.role === 'facility_admin' ? '/facility-admin' : `/${user.role}`;
    return <Navigate to={path} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      const path = user.role === 'facility_admin' ? '/facility-admin' : `/${user.role}`;
      toast.success('Login successful.');
      navigate(path);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Login failed');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-brand-600 rounded-b-[100px] opacity-10 transform -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-400 rounded-full opacity-5 blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-2 mb-8">
          <div className="p-3 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/30">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            ORON<span className="text-brand-600">Health</span>
          </h2>
        </div>
        <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Care management and operational intelligence
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="py-8 px-4 sm:px-10 shadow-xl border-0 ring-1 ring-slate-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                required
                icon={Mail}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                required
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600" />
                
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-700">
                  
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-brand-600 hover:text-brand-500">
                  
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}>
              
              Sign in <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>);

};