import React from 'react';

export type AuthPageHeaderProps = {
  /** Small caps line above the title */
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
};

/**
 * Prominent title block for secondary auth flows (forgot password, OTP, set password).
 */
export const AuthPageHeader = ({ eyebrow = 'Oron SeniorCare', title, description }: AuthPageHeaderProps) => (
  <header className="mb-10 text-center sm:mx-auto sm:max-w-xl">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-600">{eyebrow}</p>
    <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
    {description != null && <div className="mt-4 text-base leading-relaxed text-slate-600">{description}</div>}
  </header>
);
