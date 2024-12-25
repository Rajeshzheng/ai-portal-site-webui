import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import logger from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
});

// 获取用户区域和货币信息
async function getLocaleSettings(req: Request) {
  // 从请求头获取用户区域信息
  const acceptLanguage = req.headers.get('accept-language');
  const locale = acceptLanguage?.split(',')[0] || 'en';

  // 简单的区域-货币映射
  const currencyMap: Record<string, string> = {
    zh: 'cny', // 中国用户使用人民币
    'zh-CN': 'cny',
    'zh-TW': 'twd',
    ja: 'jpy',
    ko: 'krw',
    en: 'usd',
    // 可以添加更多映射
  };

  // 对于中国用户默认使用人民币
  const isChineseUser = locale.startsWith('zh');

  return {
    locale: locale.substring(0, 2), // 取主要语言代码
    currency: isChineseUser ? 'cny' : currencyMap[locale] || 'usd', // 默认使用 USD
  };
}

export async function POST(req: Request) {
  try {
    const { priceId, metadata, localeSettings } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: '缺少价格ID' }, { status: 400 });
    }

    // 获取当前语言
    const locale = localeSettings?.locale || 'en';

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/submit/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/submit`,
      metadata: {
        website: metadata.website,
        url: metadata.url,
        locale,
      },
      currency: localeSettings?.currency || 'usd',
    };

    console.log('Creating checkout session with params:', {
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/submit/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/submit`,
      locale,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    });

    const session = await stripe.checkout.sessions.create(params);

    logger.api('Checkout session created successfully', {
      sessionId: session.id,
      sessionUrl: session.url,
      paymentStatus: session.payment_status,
      locale,
      currency: localeSettings?.currency || 'usd',
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
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
