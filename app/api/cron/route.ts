/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/db/supabase/client';

import crawler from './crawler';

// submit table empty -> stop

// filter status
// isFeature (priority)
// time order

// when crawler is done
// insert web_nav table (tags <- tags[0] or 'other')
// update submit table status

export async function POST(req: NextRequest) {
  try {
    // 获取请求头中的 Authorization
    const authHeader = req.headers.get('Authorization');

    // 检查 Authorization 是否存在并验证 token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header is missing or malformed' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const cronKey = process.env.CRON_AUTH_KEY;
    // 假设这里有一个函数 `verifyToken` 用于验证 token，如果验证失败则抛出错误
    const isValid = cronKey === token;
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const supabase = createClient();

    console.log('supabase connected!');

    const [{ data: categoryList, error: categoryListError }, { data: submitList, error: submitListError }] =
      await Promise.all([
        supabase.from('navigation_category').select(),
        supabase
          .from('submit')
          .select()
          .eq('status', 0)
          .order('is_feature', { ascending: false })
          .order('created_at', { ascending: true }),
      ]);

    console.log('supabase get categoryList succeed!');
    if (categoryListError || !categoryList) {
      return NextResponse.json({ error: 'Category is null' }, { status: 201 });
    }

    if (submitListError || !submitList || !submitList[0]) {
      return NextResponse.json({ error: 'Submit list is null' }, { status: 202 });
    }
    console.log('supabase get submitList succeed!');

    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/cron_callback`;

    const firstSubmitData = submitList[0];
    const res = await crawler({
      url: firstSubmitData.url!,
      tags: categoryList!.map((item) => item.name),
      callback_url: callbackUrl,
      key: cronKey,
    });

    console.log('api get crawler succeed!');

    if (res.code !== 200 || !res.data) {
      throw new Error(res.msg || 'Crawler API返回数据无效');
    }

    // 现在我们确定res.data存在，可以安全地使用它
    const { name, title, description, detail, url, screenshot_data, screenshot_thumbnail_data, tags } = res.data;

    // 更新submit表中的status
    const { error: updateError } = await supabase.from('submit').update({ status: 1 }).eq('id', firstSubmitData.id);

    if (updateError) {
      throw new Error('Failed to update submit status');
    }

    // 插入数据到web_navigation表
    const { error: insertError } = await supabase.from('web_navigation').insert({
      name,
      title,
      content: description,
      detail,
      url,
      image_url: screenshot_data,
      thumbnail_url: screenshot_thumbnail_data,
      collection_time: new Date().toISOString(),
      tag_name: null, // 设置为null
      website_data: null, // 设置为null
      star_rating: 0, // 统一使用0
      category_name: tags && tags.length > 0 ? tags[0] : 'other',
    });

    if (insertError) {
      console.error('Failed to insert data into web_navigation:', insertError);
      throw new Error('Failed to insert data into web_navigation');
    }

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return Response.json({ error });
  }
}
