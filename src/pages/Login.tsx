import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
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
          <div className="h-14 w-14 rounded-2xl shadow-lg overflow-hidden ring-1 ring-black/5">
            <svg
              viewBox="0 0 820 820"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
              aria-label="Oron logo"
              role="img"
            >
              <rect width="820" height="820" fill="url(#paint0_linear_315_6510)" />
              <path
                d="M599.733 343.95C571.289 316.21 537.35 299.789 497.991 294.597C502.971 303 505.819 312.797 505.819 323.273C505.819 332.74 503.467 341.657 499.351 349.509C521.144 354.628 540.345 365.691 556.864 382.772C580.476 407.174 592.291 436.767 592.291 471.572C592.291 506.376 580.476 535.951 556.864 560.353C533.253 584.754 504.275 596.955 469.933 596.955C435.572 596.955 406.594 584.754 382.982 560.353C365.618 542.409 354.667 521.64 350.073 498.083C342.043 501.936 333.039 504.082 323.54 504.082C310.64 504.082 298.66 500.101 288.774 493.313C293.129 534.722 310.218 570.04 340.114 599.193C375.118 633.318 418.391 650.381 469.914 650.381C521.438 650.381 564.692 633.318 599.715 599.193C634.719 565.068 652.23 522.521 652.23 471.572C652.23 420.622 634.737 378.094 599.733 343.95Z"
                fill="white"
              />
              <path
                d="M477.098 193.285C475.04 178.663 460.469 168.333 444.575 170.223C293.239 188.24 176.944 303.092 168.05 443.317C167.113 458.05 179.333 470.673 195.337 471.535C195.907 471.572 196.477 471.59 197.046 471.59C212.297 471.59 225.105 460.637 226.005 446.436C233.263 331.823 328.317 237.942 452.017 223.209C467.929 221.301 479.156 207.908 477.098 193.285Z"
                fill="white"
              />
              <path
                d="M477.411 318.155C475.059 302.945 460.8 292.524 445.585 294.891C370.432 306.504 310.327 364.407 296.032 438.988C293.128 454.105 303.051 468.691 318.192 471.59C319.956 471.92 321.738 472.085 323.465 472.085C336.585 472.085 348.272 462.802 350.844 449.464C360.73 397.945 402.239 357.949 454.129 349.931C469.326 347.583 479.762 333.364 477.411 318.155Z"
                fill="white"
              />
              <path
                d="M464.089 402.605C430.206 403.926 402.882 430.603 400.567 464.178H464.089V402.605Z"
                fill="white"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_315_6510"
                  x1="820"
                  y1="820"
                  x2="618.543"
                  y2="-131.027"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#0E649B" />
                  <stop offset="1" stopColor="#8E44AD" />
                </linearGradient>
              </defs>
            </svg>
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