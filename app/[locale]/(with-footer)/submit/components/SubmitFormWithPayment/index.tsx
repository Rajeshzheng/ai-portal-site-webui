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
        className="mx-3 mb-5 flex h-[449px] flex-col justify-between rounded-[12px] bg-[#2C2D36] px-3 py-5 lg:h-[557px] lg:w-[444px] lg:p-8"
      />
      <SubmitPricingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
      />
    </>
  );
}