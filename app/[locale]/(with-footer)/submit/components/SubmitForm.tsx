'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { createClient } from '@/db/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from "@/components/ui/button";

import { FORM_PLACEHOLDER, WEBSITE_EXAMPLE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinning from '@/components/Spinning';
import { PROMO_CONFIG } from '../../../../config/promo';

const FormSchema = z.object({
  website: z.string(),
  url: z.string().url(),
});

interface SubmitFormProps {
  className?: string;
  onSubmit?: (data: z.infer<typeof FormSchema>) => void;
}

export default function SubmitForm({ className, onSubmit }: SubmitFormProps) {
  const supabase = createClient();
  const t = useTranslations('Submit');

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      website: '',
      url: '',
    },
  });

  const handleSubmit = async (formData: z.infer<typeof FormSchema>) => {
    if (onSubmit) {
      onSubmit(formData);
      return;
    }

    let errMsg: any = t('networkError');
    try {
      setLoading(true);
      const { error } = await supabase.from('submit').insert({
        name: formData.website,
        url: formData.url,
      });
      if (error) {
        errMsg = error.message;
        throw new Error();
      }
      toast.success(t('success'));
      form.reset();
    } catch (error) {
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(
          'flex flex-col space-y-4 lg:space-y-6',
          className
        )}
      >
        <div className='space-y-4 lg:space-y-5'>
          <FormField
            control={form.control}
            name='website'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-sm font-medium lg:text-base'>
                  {t('website')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='AI Basket'
                    className='h-10 rounded-lg border-[0.5px] bg-dark-bg px-4 text-sm 
                             focus:border-pink-500 focus:ring-1 focus:ring-pink-500
                             lg:h-12 lg:text-base'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-xs lg:text-sm' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='url'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-sm font-medium lg:text-base'>
                  {t('url')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={FORM_PLACEHOLDER}
                    className='h-10 rounded-lg border-[0.5px] bg-dark-bg px-4 text-sm
                             focus:border-pink-500 focus:ring-1 focus:ring-pink-500
                             lg:h-12 lg:text-base'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-xs lg:text-sm' />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className='mt-4 h-10 w-full rounded-lg bg-gradient-to-r from-pink-500 
                     to-purple-500 text-sm font-medium text-white transition-transform 
                     hover:scale-[1.02] lg:h-12 lg:text-base'
        >
          {t('submit')}
        </Button>
      </form>
    </Form>
  );
}
