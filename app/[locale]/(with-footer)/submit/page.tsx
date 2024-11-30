import React from 'react';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import Faq from '@/components/Faq';

import SubmitFormWithPayment from './components/SubmitFormWithPayment';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.submit',
  });

  return {
    title: t('title'),
  };
}

export default function Page() {
  const t = useTranslations('Submit');

  return (
    <div className='mx-auto w-full px-4 lg:max-w-pc lg:px-0'>
      <div className='my-6 flex flex-col items-center space-y-2 text-center lg:my-10 lg:space-y-3'>
        <h1 className='text-3xl font-bold lg:text-5xl'>{t('title')}</h1>
        <h2 className='text-xs font-medium text-gray-400 lg:text-sm'>
          {t('subTitle')}
        </h2>
      </div>

      <div className='flex justify-center'>
        <SubmitFormWithPayment />
      </div>

      <div className='mt-8 lg:mt-12'>
        <Faq />
      </div>
    </div>
  );
}
