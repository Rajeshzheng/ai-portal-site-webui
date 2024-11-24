import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { useSubmitPayment } from './useSubmitPayment';

// 支付图标配置
const PAYMENT_METHODS = {
  card: {
    key: 'card',
    icon: '/images/payment/credit-card.svg',
  },
  wechat: {
    key: 'wechat',
    icon: '/images/payment/wechat-pay.svg',
  },
};

interface SubmitPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    website: string;
    url: string;
  } | null;
}

export default function SubmitPricingModal({ isOpen, onClose, formData }: SubmitPricingModalProps) {
  const t = useTranslations('Submit');
  const { isProcessing, handlePayment } = useSubmitPayment();

  const benefits = [{ key: 'feature1' }, { key: 'feature2' }, { key: 'feature3' }];

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      await handlePayment(formData);
    } catch (error) {
      toast.error(t('paymentError'));
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          // 基础样式
          'border-none bg-gradient-to-b from-[#2C2D36] to-[#23242B] text-white shadow-xl',
          // 响应式宽度
          'w-[95vw] max-w-[95vw] sm:max-w-[425px]',
          // 响应式内边距
          'p-4 sm:p-6',
          // 居中对齐
          'mx-auto',
        )}
      >
        <DialogHeader>
          <DialogTitle className='bg-gradient-to-r from-white to-gray-100 bg-clip-text text-center text-xl font-bold text-transparent sm:text-2xl'>
            {t('pricing.title')}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 px-2 sm:space-y-6 sm:px-4'>
          {/* 价格区域 */}
          <div className='space-y-2 text-center'>
            <div className='relative inline-block'>
              <h3 className='text-3xl font-extrabold text-white sm:text-4xl'>{t('pricing.price')}</h3>
              <div className='absolute -right-12 -top-2 rotate-12 transform sm:-right-16'>
                <span className='whitespace-nowrap rounded-full bg-gradient-to-r from-green-400 to-blue-500 px-2 py-0.5 text-[10px] font-bold text-white'>
                  {t('pricing.limitedTime')}
                </span>
              </div>
            </div>
            <p className='mx-auto max-w-[280px] text-xs text-gray-400 sm:text-sm'>{t('pricing.description')}</p>
          </div>

          {/* 分隔线 */}
          <div className='h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent' />

          {/* 功能列表 */}
          <div className='space-y-2 sm:space-y-3'>
            {benefits.map(({ key }) => (
              <div
                key={key}
                className='flex items-center gap-2 rounded-lg bg-[#34353E] p-2 transition-colors hover:bg-[#3A3B44] sm:gap-3 sm:p-3'
              >
                <span className='flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-500 sm:h-5 sm:w-5'>
                  <svg
                    className='h-2.5 w-2.5 text-white sm:h-3 sm:w-3'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                  </svg>
                </span>
                <span className='text-xs font-medium sm:text-sm'>{t(`pricing.${key}`)}</span>
              </div>
            ))}
          </div>

          {/* 支付方式区域 */}
          <div className='flex flex-col items-center gap-1.5 sm:gap-2'>
            <p className='text-[10px] uppercase tracking-wide text-gray-500 sm:text-xs'>
              {t('pricing.securePaymentVia')}
            </p>
            <div className='flex flex-col items-center gap-3'>
              <div className='flex items-center gap-3 rounded-xl bg-white/10 p-2 backdrop-blur-sm sm:p-3'>
                {Object.entries(PAYMENT_METHODS).map(([key, { icon }]) => (
                  <div key={key} className='flex flex-col items-center gap-1'>
                    <div className='rounded-lg bg-white p-2 transition-transform hover:scale-105'>
                      <Image
                        src={icon}
                        alt={t(`pricing.paymentMethods.${key}`)}
                        width={36}
                        height={22}
                        className='object-contain sm:h-[25px] sm:w-[40px]'
                        priority
                      />
                    </div>
                    <span className='text-[10px] text-gray-400 sm:text-xs'>{t(`pricing.paymentMethods.${key}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className={cn(
              'h-10 w-full sm:h-12',
              'bg-gradient-to-r from-green-400 to-blue-500',
              'hover:from-green-500 hover:to-blue-600',
              'text-sm font-bold text-white sm:text-base',
              'transform rounded-xl transition-all',
              'hover:scale-[1.02]',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isProcessing ? (
              <div className='flex items-center justify-center gap-2'>
                <svg className='h-4 w-4 animate-spin sm:h-5 sm:w-5' viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                <span className='text-sm sm:text-base'>{t('paymentProcessing')}</span>
              </div>
            ) : (
              t('pricing.submitButton')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
