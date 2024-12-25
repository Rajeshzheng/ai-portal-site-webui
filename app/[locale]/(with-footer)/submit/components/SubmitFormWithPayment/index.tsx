'use client';

import { useState } from 'react';
import { z } from 'zod';
import SubmitForm from '../SubmitForm';
import SubmitPricingModal from './SubmitPricingModal';
import { createClient } from '@/db/supabase/client';
import { toast } from 'sonner';

// 确保与 SubmitForm 使用相同的表单数据类型
interface FormData {
  website: string;
  url: string;
}

export default function SubmitFormWithPayment() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  // 处理表单提交
  const handleSubmit = (data: FormData) => {
    // 保存数据到数据库
    const saveData = async () => {
      const { error } = await createClient().from('submit').insert({
        name: data.website,
        url: data.url,
        status: 0, // 设置为待处理状态
      });
      if (error) {
        throw new Error('Failed to save data');
      }
    };

    saveData().then(() => {
      setFormData(data);
      setIsModalOpen(true);
    }).catch((error) => {
      console.error(error);
      toast.error('Failed to save data');
    });
  };

  return (
    <>
      <SubmitForm 
        onSubmit={handleSubmit}
        className="w-full max-w-[444px] rounded-xl bg-[#2C2D36] p-4 shadow-lg lg:p-8"
      />
      <SubmitPricingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
      />
    </>
  );
}