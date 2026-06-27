import { useState } from 'react';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetNewsletterSubscribersQuery } from '../newsletterApi';
import { formatDate } from '@/shared/lib/format';
import { DataState } from '@/shared/ui/DataState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PaginationFooter } from '@/shared/ui/PaginationFooter';

const PAGE_SIZE = 20;

export function NewsletterTab() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useGetNewsletterSubscribersQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
        {isLoading ? (
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={48} className="mb-2" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <EmptyState
            icon={<MailOutlinedIcon fontSize="large" />}
            title={t('newsletter.empty.title')}
            description={t('newsletter.empty.description')}
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('newsletter.columns.email')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('newsletter.columns.subscribedAt')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((sub) => (
                  <TableRow key={sub.id} hover>
                    <TableCell>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {sub.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      {sub.subscribedAt ? formatDate(sub.subscribedAt, locale) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataState>

      {data && data.totalPages > 1 && (
        <PaginationFooter
          page={page}
          pageCount={data.totalPages}
          totalCount={data.totalCount}
          onChange={setPage}
        />
      )}
    </div>
  );
}
