import { useState } from 'react';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
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

import { useGetContactMessagesQuery } from '../messagesApi';
import { formatDate } from '@/shared/lib/format';
import { DataState } from '@/shared/ui/DataState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PaginationFooter } from '@/shared/ui/PaginationFooter';

const PAGE_SIZE = 20;

export function MessagesTab() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useGetContactMessagesQuery({
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
            icon={<EmailOutlinedIcon fontSize="large" />}
            title={t('messages.empty.title')}
            description={t('messages.empty.description')}
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('messages.columns.name')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('messages.columns.email')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('messages.columns.phone')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('messages.columns.message')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('messages.columns.date')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((msg) => (
                  <TableRow key={msg.id} hover>
                    <TableCell>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {msg.name ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>{msg.email ?? '—'}</TableCell>
                    <TableCell>{msg.phone ?? '—'}</TableCell>
                    <TableCell>
                      <span className="line-clamp-2 max-w-xs text-sm text-slate-600 dark:text-slate-300">
                        {msg.message ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(msg.createdAt, locale)}</TableCell>
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
