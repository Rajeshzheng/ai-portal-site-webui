import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSubmitPayment } from './useSubmitPayment';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 支付图标配置
const PAYMENT_METHODS = {
  card: {
    key: 'card',
    icon: '/images/payment/credit-card.svg'
  },
  wechat: {
    key: 'wechat',
    icon: '/images/payment/wechat-pay.svg'
  }
};

export default function SubmitPricingModal({ isOpen, onClose, formData }: SubmitPricingModalProps) {
  const t = useTranslations('Submit');
  const { isProcessing, handlePayment } = useSubmitPayment();

  const benefits = [
    { key: 'feature1' },
    { key: 'feature2' },
    { key: 'feature3' }
  ];

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
          "bg-gradient-to-b from-[#2C2D36] to-[#23242B] text-white border-none shadow-xl",
          // 响应式宽度
          "w-[95vw] max-w-[95vw] sm:max-w-[425px]",
          // 响应式内边距
          "p-4 sm:p-6",
          // 居中对齐
          "mx-auto"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
            {t('pricing.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-4">
          {/* 价格区域 */}
          <div className="text-center space-y-2">
            <div className="relative inline-block">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
                {t('pricing.price')}
              </h3>
              <div className="absolute -top-2 -right-12 sm:-right-16 transform rotate-12">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap">
                  {t('pricing.limitedTime')}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 max-w-[280px] mx-auto">
              {t('pricing.description')}
            </p>
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

          {/* 功能列表 */}
          <div className="space-y-2 sm:space-y-3">
            {benefits.map(({ key }) => (
              <div 
                key={key} 
                className="flex items-center gap-2 sm:gap-3 bg-[#34353E] rounded-lg p-2 sm:p-3 hover:bg-[#3A3B44] transition-colors"
              >
                <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                  <svg 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {t(`pricing.${key}`)}
                </span>
              </div>
            ))}
          </div>

          {/* 支付方式区域 */}
          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
              {t('pricing.securePaymentVia')}
            </p>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3">
                {Object.entries(PAYMENT_METHODS).map(([key, { icon }]) => (
                  <div 
                    key={key}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="bg-white rounded-lg p-2 transition-transform hover:scale-105">
                      <Image
                        src={icon}
                        alt={t(`pricing.paymentMethods.${key}`)}
                        width={36}
                        height={22}
                        className="object-contain sm:w-[40px] sm:h-[25px]"
                        priority
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      {t(`pricing.paymentMethods.${key}`)}
                    </span>
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
              "w-full h-10 sm:h-12",
              "bg-gradient-to-r from-green-400 to-blue-500",
              "hover:from-green-500 hover:to-blue-600",
              "text-white font-bold text-sm sm:text-base",
              "rounded-xl transition-all transform",
              "hover:scale-[1.02]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm sm:text-base">
                  {t('paymentProcessing')}
                </span>
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