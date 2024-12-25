import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';

type Props = {
  params: { locale: string };
  searchParams: { session_id?: string };
};

export default function SuccessPage({ params: { locale }, searchParams }: Props) {
  const t = useTranslations('SubmitSuccess');

  return (
    <div className="mx-auto w-full px-4 pb-10 lg:max-w-pc lg:px-0">
      {/* 标题部分 */}
      <div className="my-6 flex flex-col items-center space-y-2 text-center lg:my-10 lg:space-y-3">
        <h1 className="text-3xl font-bold lg:text-5xl">{t('title')}</h1>
        <h2 className="text-xs font-medium text-gray-400 lg:text-sm">
          {t('subTitle')}
        </h2>
      </div>

      {/* 成功卡片部分 */}
      <div className="flex justify-center">
        <Card className="w-full max-w-[444px] rounded-xl bg-[#2C2D36] p-4 shadow-lg lg:p-8">
          <CardContent className="pt-6">
            <div className="mb-4 flex justify-center">
              <Icons.checkCircle className="h-12 w-12 text-green-500" />
            </div>
            
            <h1 className="mb-2 text-center text-xl font-medium">
              {t('message')}
            </h1>
            <p className="text-center text-sm text-gray-400">
              {t('description')}
            </p>
          </CardContent>

          <CardFooter className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href={`/${locale}`}>{t('backHome')}</Link>
            </Button>
            <Button asChild>
              <Link href={`/${locale}/submit`}>{t('submitAnother')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}