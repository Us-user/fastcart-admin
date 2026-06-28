import { useRef, useState } from 'react';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { CircularProgress, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useSnackbar } from '@/shared/lib/useSnackbar';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useDeleteProductImageMutation } from '../productsApi';
import type { ProductImage } from '../types';
import { useUploadProductImages } from '../useUploadProductImages';
import { card, sectionTitle } from './editStyles';

const ACCEPT = 'image/svg+xml,image/png,image/jpeg,image/gif';

interface ProductImagesSectionProps {
  productId: number;
  images: ProductImage[];
}

/**
 * Images section of the edit screen (TRD §8.3): existing images render in a grid
 * with a delete action (`DELETE …/images/{imageId}`); the dropzone uploads new
 * files immediately via multipart `POST …/images`. Each persists on its own —
 * no batched form submit.
 */
export function ProductImagesSection({ productId, images }: ProductImagesSectionProps) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useUploadProductImages();
  const [deleteImage, { isLoading: deleting }] = useDeleteProductImageMutation();
  const [removing, setRemoving] = useState<ProductImage | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      await upload(productId, Array.from(files));
      snackbar.success(t('products.edit.imagesUploaded'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.saveError')));
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      await deleteImage({ productId, imageId: removing.id }).unwrap();
      snackbar.success(t('products.edit.imageDeleted'));
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, t('common.deleteError')));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <section className={card}>
      <h2 className={`mb-4 ${sectionTitle}`}>{t('products.form.images')}</h2>

      <div className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleFiles(e.dataTransfer.files);
          }}
          className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-7 text-center transition-colors hover:border-blue-400 disabled:opacity-60 dark:border-slate-600 dark:hover:border-blue-500"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            {isUploading ? (
              <CircularProgress size={18} />
            ) : (
              <FileUploadOutlinedIcon fontSize="small" />
            )}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-medium text-slate-900 underline dark:text-white">
              {t('catalog.clickToUpload')}
            </span>{' '}
            {t('catalog.orDragAndDrop')}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {t('catalog.uploadFormats')}
          </span>
        </button>

        {images.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t('products.edit.noImages')}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
              >
                {img.url ? (
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
                    <BrokenImageOutlinedIcon />
                  </span>
                )}
                <IconButton
                  size="small"
                  onClick={() => setRemoving(img)}
                  aria-label={t('common.delete')}
                  className="!absolute right-1 top-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                  sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                >
                  <DeleteOutlineIcon fontSize="small" className="text-red-500" />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(removing)}
        title={t('products.edit.deleteImage.title')}
        message={t('products.edit.deleteImage.message')}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setRemoving(null)}
      />
    </section>
  );
}
