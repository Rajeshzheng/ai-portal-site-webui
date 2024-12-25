import { useState, useEffect } from 'react';
import logger from '@/lib/logger';
import { useLocale } from 'next-intl';

// 定义表单数据类型
interface SubmitFormData {
  website: string;
  url: string;
}

// 定义用户区域设置类型
interface LocaleSettings {
  locale: string;
  currency: string;
  preferredPaymentMethods: string[];
}

// 根据用户区域和设备支持设置首选支付方式
const getPreferredPaymentMethods = (userLanguage: string): string[] => {
  // 暂时只返回信用卡支付方式
  return ['card'];
};

export function useSubmitPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localeSettings, setLocaleSettings] = useState<LocaleSettings | null>(null);
  const locale = useLocale();

  // 检测用户区域和首选支付方式
  useEffect(() => {
    const detectLocaleSettings = (): LocaleSettings => {
      const userLanguage = navigator.language || 'en';
      
      // 根据用户区域设置首选支付方式
      let preferredPaymentMethods = ['card']; // 默认信用卡支付
      
      // 中国用户优先展示支付宝和微信支付
      if (userLanguage.startsWith('zh')) {
        preferredPaymentMethods = ['alipay', 'wechat_pay', ...preferredPaymentMethods];
      }

      // 设置货币
      const currencyMap: Record<string, string> = {
        'zh': 'cny',
        'zh-CN': 'cny',
        'zh-TW': 'twd',
        'ja': 'jpy',
        'ko': 'krw',
        'en': 'usd',
      };

      return {
        locale: userLanguage,
        currency: currencyMap[userLanguage] || 'usd',
        preferredPaymentMethods,
      };
    };

    setLocaleSettings(detectLocaleSettings());
  }, []);

  const handlePayment = async (formData: SubmitFormData) => {
    try {
      setIsProcessing(true);
      
      logger.payment('Starting payment process', {
        ...formData,
        localeSettings,
        locale,
      });
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': localeSettings?.locale || locale || 'en',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          metadata: {
            website: formData.website,
            url: formData.url,
          },
          localeSettings: {
            ...localeSettings,
            locale,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Payment API response not ok', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error('支付session创建失败');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      logger.error('Payment process failed', {
        error,
        formData,
        localeSettings,
        locale,
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handlePayment,
    localeSettings,
  };
}