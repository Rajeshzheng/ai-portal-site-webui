'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const t = useTranslations('Auth');

  if (status === 'loading') {
    return (
      <div className="h-9 w-20 animate-pulse rounded-md bg-white/20" />
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-white">
          {session.user?.name}
        </span>
        <button
          onClick={() => signOut()}
          className="rounded-md border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/20"
        >
          {t('signOut')}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="rounded-md border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/20"
    >
      {t('signIn')}
    </button>
  );
}
