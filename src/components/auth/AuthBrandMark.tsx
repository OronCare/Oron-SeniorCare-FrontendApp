import React from 'react';

/** Logo + wordmark used on unauthenticated auth screens (login, set password). */
export const AuthBrandMark = () => (
  <div className="flex justify-center items-center gap-2 mb-8">
    <div className="h-14 w-14 rounded-2xl shadow-lg overflow-hidden ring-1 ring-black/5 shrink-0 bg-white">
      <img src="/oron-logo.svg" alt="Oron" className="h-full w-full object-cover" width={56} height={56} />
    </div>
    <p className="text-3xl font-bold text-slate-900 tracking-tight m-0">
      ORON<span className="text-brand-600">Health</span>
    </p>
  </div>
);
