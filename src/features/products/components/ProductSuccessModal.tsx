import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Button, Dialog, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ProductSuccessModalProps {
  open: boolean;
  onGoToProducts: () => void;
  onAddNew: () => void;
  onClose: () => void;
}

/**
 * "Successfully add" modal (TRD §5.3, mockup `03 Message.png`): a centered check
 * badge with a heading and two choices — go to the products list, or add another
 * product (which resets the form).
 */
export function ProductSuccessModal({
  open,
  onGoToProducts,
  onAddNew,
  onClose,
}: ProductSuccessModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <div className="relative flex flex-col items-center px-6 pt-8 pb-6 text-center">
        <IconButton
          onClick={onClose}
          aria-label={t('common.cancel')}
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
          <CheckIcon />
        </span>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('products.form.successTitle')}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('products.form.successMessage')}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="outlined" color="inherit" onClick={onGoToProducts}>
            {t('products.form.goToProducts')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddNew}>
            {t('products.form.addNew')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
