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

    if (res.code === 200) {
      // 打印爬虫返回的数据，确保每个字段都存在
      console.log('Crawler API returned data:', res);

      // 从 res.data 中提取字段
      const { name, title, description, detail, screenshot_data, screenshot_thumbnail_data, tags } = res.data;

      // 打印每个字段以确保它们有值
      console.log('Name:', name);
      console.log('Title:', title);
      console.log('Description:', description);
      console.log('Detail:', detail);
      console.log('Tags:', tags);
      console.log('Screenshot URL:', screenshot_data);
      console.log('Thumbnail URL:', screenshot_thumbnail_data);

      // 确保 title、description 和其他字段不为空，必要时提供默认值
      const insertResult = await supabase.from('web_navigation').insert({
        name: name || 'Unnamed', // 使用返回的 name
        url: firstSubmitData.url,
        title: title || 'Untitled', // 使用返回的 title
        content: description || 'No content available', // 使用返回的 description 作为 content
        detail: detail || 'No detail available', // 使用返回的 detail
        tag_name: tags?.join(', ') || '', // 将 tags 转换为逗号分隔的字符串插入 tag_name
        thumbnail_url: screenshot_thumbnail_data || null, // 使用返回的缩略图 URL
        image_url: screenshot_data || null, // 使用返回的图片 URL
        collection_time: new Date().toISOString(),
        category_name: 'Uncategorized', // 如果返回了 category_name 则使用它
      });

      if (insertResult.error) {
        console.error('Failed to insert data into web_navigation:', insertResult.error);
        return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
      }

      // 更新 submit 表的 status 字段为 1
      const updateResult = await supabase.from('submit').update({ status: 1 }).eq('id', firstSubmitData.id);

      if (updateResult.error) {
        console.error('Failed to update submit status:', updateResult.error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }

      console.log('Data successfully inserted and status updated');
      return NextResponse.json({ message: 'Success' });
    } else {
      throw new Error(res.msg);
    }
  } catch (error) {
    return Response.json({ error });
  }
}
