import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { useSubmitPayment } from './useSubmitPayment';

// 支付方式配置
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

  // 功能列表
  const benefits = [
    { key: 'feature1' }, // 24小时内上线
    { key: 'feature2' }, // 优先展示
    { key: 'feature3' }, // 增加流量和曝光
  ];

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      await handlePayment(formData);
    } catch (error) {
      toast.error(t('pricing.paymentError'));
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
          'mx-auto'
        )}
      >
        {/* 标题区域 */}
        <div className='space-y-2 text-center'>
          <DialogTitle className='text-lg font-bold lg:text-xl'>
            {t('pricing.title')}
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-400 lg:text-base'>
            {t('pricing.description')}
          </DialogDescription>
        </div>

        {/* 价格区域 */}
        <div className='relative mt-4 text-center lg:mt-6'>
          <span className='text-2xl font-bold lg:text-3xl'>{t('pricing.price')}</span>
          <span 
            className='absolute -right-3 -top-1 rotate-12 rounded-full 
                     bg-gradient-to-r from-pink-500 to-purple-500 
                     px-2 py-1 text-xs font-medium lg:text-sm'
          >
            {t('pricing.limitedTime')}
          </span>
        </div>

        {/* 功能列表 */}
        <div className='mt-4 space-y-2 lg:mt-6 lg:space-y-3'>
          {benefits.map(({ key }) => (
            <div
              key={key}
              className='flex items-center gap-3 rounded-lg bg-[#34353E] 
                         p-3 transition-colors hover:bg-[#3A3B44]'
            >
              <Check className='h-5 w-5 text-green-500' />
              <span className='text-sm lg:text-base'>{t(`pricing.${key}`)}</span>
            </div>
          ))}
        </div>

        {/* 支付方式区域 */}
        <div className='mt-4 space-y-2 lg:mt-6'>
          <p className='text-center text-xs uppercase tracking-wide 
                       text-gray-500 lg:text-sm'>
            {t('pricing.securePaymentVia')}
          </p>
          <div className='flex justify-center gap-4'>
            {Object.entries(PAYMENT_METHODS).map(([key, { icon }]) => (
              <div key={key} className='flex flex-col items-center gap-1'>
                <div className='rounded-lg bg-white p-2 transition-transform 
                               hover:scale-105'>
                  <Image
                    src={icon}
                    alt={t(`pricing.paymentMethods.${key}`)}
                    width={32}
                    height={20}
                    className='h-5 w-8 object-contain lg:h-6 lg:w-10'
                    priority
                  />
                </div>
                <span className='text-xs text-gray-400 lg:text-sm'>
                  {t(`pricing.paymentMethods.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 提交按钮 */}
        <Button
          className='mt-6 h-10 w-full rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 
                    text-sm font-medium text-white transition-transform hover:scale-[1.02] 
                    disabled:opacity-50 lg:h-12 lg:text-base'
          onClick={handleSubmit}
          disabled={isProcessing}
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
              <span className='text-sm sm:text-base'>{t('pricing.paymentProcessing')}</span>
            </div>
          ) : (
            t('pricing.submitButton')
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
