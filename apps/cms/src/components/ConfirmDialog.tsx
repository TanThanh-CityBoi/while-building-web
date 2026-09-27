import { getErrorMessage } from '@while-building/api-client';
import { Alert, Button, Dialog, DialogBody, DialogFooter } from '@while-building/ui';
import { useState, type ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  tone?: 'default' | 'danger';
  /** May be async; the dialog stays open (and shows the error) if it rejects. */
  onConfirm: () => Promise<unknown> | void;
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  tone = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const close = () => {
    setError(null);
    onClose();
  };

  const confirm = async () => {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (caught) {
      setError(caught);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} title={title} size="sm" dismissible={!pending}>
      {(description || error !== null) && (
        <DialogBody>
          {description && <p>{description}</p>}
          {error !== null && <Alert tone="danger">{getErrorMessage(error)}</Alert>}
        </DialogBody>
      )}
      <DialogFooter>
        <Button variant="secondary" onClick={close} disabled={pending}>
          Cancel
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={() => void confirm()}
          loading={pending}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
