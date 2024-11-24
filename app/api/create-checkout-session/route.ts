import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import logger from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// 获取用户区域和货币信息
async function getLocaleSettings(req: Request) {
  // 从请求头获取用户区域信息
  const acceptLanguage = req.headers.get('accept-language');
  const locale = acceptLanguage?.split(',')[0] || 'en';
  
  // 简单的区域-货币映射
  const currencyMap: Record<string, string> = {
    'zh': 'cny', // 中国用户使用人民币
    'zh-CN': 'cny',
    'zh-TW': 'twd',
    'ja': 'jpy',
    'ko': 'krw',
    'en': 'usd',
    // 可以添加更多映射
  };

  // 对于中国用户默认使用人民币
  const isChineseUser = locale.startsWith('zh');
  
  return {
    locale: locale.substring(0, 2), // 取主要语言代码
    currency: isChineseUser ? 'cny' : (currencyMap[locale] || 'usd'), // 默认使用 USD
  };
}

export async function POST(req: Request) {
  try {
    const { priceId, metadata } = await req.json();
    
    logger.api('Creating Stripe checkout session', { 
      priceId, 
      metadata,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      stripeKeyExists: !!process.env.STRIPE_SECRET_KEY 
    });

    // 验证必要配置
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.error('Stripe secret key is missing');
      throw new Error('Stripe configuration is missing');
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      logger.error('Site URL is missing');
      throw new Error('Site URL configuration is missing');
    }

    if (!priceId) {
      logger.error('Price ID is missing');
      throw new Error('Price ID is required');
    }

    // 获取本地化设置
    const { locale, currency } = await getLocaleSettings(req);

    // 根据地区决定支付方式
    const payment_method_types = ['card'];
    if (locale === 'zh') {
      payment_method_types.push('wechat_pay');
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/submit?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/submit?canceled=true`,
      metadata: {
        ...metadata,
        submission_type: 'ai_tool'
      },
      // 支持多种支付方式
      payment_method_types,
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session',
        },
        wechat_pay: {
          client: 'web',
        },
      },
      // 本地化设置
      locale: locale as Stripe.Checkout.SessionCreateParams.Locale,
      currency: currency,
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: false,
      },
      custom_fields: [
        {
          key: 'remarks',
          label: { type: 'custom', custom: '备注信息' },
          type: 'text',
          optional: true,
        },
      ],
    }).catch(error => {
      logger.error('Stripe API error', {
        error,
        errorMessage: error.message,
        errorType: error.type,
        errorCode: error.code,
        errorDeclineCode: error.decline_code,
      });
      throw error;
    });

    logger.api('Checkout session created successfully', { 
      sessionId: session.id,
      sessionUrl: session.url,
      paymentStatus: session.payment_status,
      locale,
      currency,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    logger.error('Failed to create checkout session', {
      error,
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
    });

    return NextResponse.json(
      { 
        error: '支付session创建失败',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
} 