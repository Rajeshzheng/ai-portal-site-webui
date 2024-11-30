'use client';

import { useState } from 'react';
import { z } from 'zod';
import SubmitForm from '../SubmitForm';
import SubmitPricingModal from './SubmitPricingModal';

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
    setFormData(data);
    setIsModalOpen(true);
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