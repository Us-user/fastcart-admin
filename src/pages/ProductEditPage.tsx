import { useParams } from 'react-router-dom';

import { ProductEditForm } from '@/features/products/components/ProductEditForm';
import { useGetProductQuery } from '@/features/products/productsApi';
import { DataState } from '@/shared/ui/DataState';

/** Edit product route (`/products/:id/edit`) (TRD §5.3, §8.3). */
export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data, isLoading, isError, refetch } = useGetProductQuery(productId, {
    skip: !Number.isFinite(productId),
  });

  return (
    <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
      {data && <ProductEditForm key={data.id} detail={data} />}
    </DataState>
  );
}
