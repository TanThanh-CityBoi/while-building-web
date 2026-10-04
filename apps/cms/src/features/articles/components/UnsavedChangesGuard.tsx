import { useEffect, type RefObject } from 'react';
import { useBlocker } from 'react-router';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface UnsavedChangesGuardProps {
  /** There are unsaved changes. */
  when: boolean;
  /** Set to `true` just before a deliberate navigation (after saving or deleting). */
  bypass: RefObject<boolean>;
}

/** Asks before leaving the page (in the app or by closing the tab) with unsaved changes. */
export function UnsavedChangesGuard({ when, bypass }: UnsavedChangesGuardProps) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && !bypass.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!bypass.current) event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when, bypass]);

  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      onClose={() => blocker.reset?.()}
      title="Discard unsaved changes?"
      description="You have changes that haven’t been saved. Leaving now discards them."
      confirmLabel="Discard changes"
      tone="danger"
      onConfirm={() => blocker.proceed?.()}
    />
  );
}
