import type { WebNavigation } from '@/db/supabase/types';

import WebNavCard from './WebNavCard';

export default function WebNavCardList({ dataList }: { dataList: any[] }) {
  if (!dataList || dataList.length === 0) {
    return null;
  }

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4'>
      {dataList.map((item) => (
        <WebNavCard key={item.id} {...item} />
      ))}
    </div>
  );
}
