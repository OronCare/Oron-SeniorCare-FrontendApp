import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(selectedRole);
      setIsLoading(false);
      const path =
      selectedRole === 'facility_admin' ?
      '/facility-admin' :
      `/${selectedRole}`;
      navigate(path);
    }, 800);
  };
  const roleDisplay = {
    owner: 'Platform Owner',
    facility_admin: 'Facility Admin',
    admin: 'Branch Admin',
    staff: 'Staff'
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
            {/* Demo Role Selector */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3">
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(roleDisplay) as Role[]).map((role) =>
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${selectedRole === role ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>
                  
                    {roleDisplay[role]}
                  </button>
                )}
              </div>
            </div>

            <Input
              label="Email address"
              type="email"
              required
              icon={Mail}
              placeholder="Enter your email"
              defaultValue={`${selectedRole}@oron.com`} />
            

            <Input
              label="Password"
              type="password"
              required
              icon={Lock}
              placeholder="••••••••"
              defaultValue="password123" />
            

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