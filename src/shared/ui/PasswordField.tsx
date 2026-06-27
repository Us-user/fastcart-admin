import { forwardRef, useState } from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import { useTranslation } from 'react-i18next';

/**
 * Outlined password input with the show/hide eye toggle from the auth mockups.
 * Forwards its ref to the underlying input so it drops into React Hook Form via
 * `{...register('password')}`.
 */
export const PasswordField = forwardRef<HTMLInputElement, TextFieldProps>(function PasswordField(
  { slotProps, ...props },
  ref,
) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      inputRef={ref}
      slotProps={{
        ...slotProps,
        input: {
          ...(typeof slotProps?.input === 'object' ? slotProps.input : {}),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVisible((v) => !v)}
                edge="end"
                tabIndex={-1}
                aria-label={t(visible ? 'auth.hidePassword' : 'auth.showPassword')}
              >
                {visible ? (
                  <VisibilityOffOutlined fontSize="small" />
                ) : (
                  <VisibilityOutlined fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
});
