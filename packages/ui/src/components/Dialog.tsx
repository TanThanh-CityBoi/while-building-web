import { useEffect, useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '@while-building/utils';
import styles from './Dialog.module.css';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Usually `<DialogBody>` + `<DialogFooter>`, optionally wrapped in a `<form>`. */
  children?: ReactNode;
  size?: 'sm' | 'md';
  /** Set to `false` while an action is pending to block Escape/backdrop/close. */
  dismissible?: boolean;
}

/**
 * Modal dialog on the native `<dialog>` element: focus trapping, Escape handling, top-layer
 * rendering and focus restoration come from the browser. Content is only mounted while open,
 * so forms inside reset every time the dialog opens.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  dismissible = true,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const pointerDownOnBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const requestClose = () => {
    if (dismissible) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={cx(styles.dialog, styles[size])}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        // Escape: keep React state as the source of truth.
        event.preventDefault();
        requestClose();
      }}
      onClose={() => {
        // The browser may still force-close (e.g. repeated Escape); sync state if so.
        if (open) onClose();
      }}
      onPointerDown={(event) => {
        pointerDownOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        // Only a press that starts *and* ends on the backdrop closes (not a text-selection drag).
        if (pointerDownOnBackdrop.current && event.target === event.currentTarget) requestClose();
      }}
    >
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
          </div>
          {children}
          {/* Last in DOM order (but pinned top-right) so `showModal()` focuses the first field,
              or the safe "Cancel" action in confirmations, rather than the close button. */}
          <button
            type="button"
            className={styles.close}
            onClick={requestClose}
            disabled={!dismissible}
            aria-label="Close dialog"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}
    </dialog>
  );
}

export function DialogBody({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cx(styles.body, className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cx(styles.footer, className)} {...props} />;
}
