import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '@while-building/utils';
import styles from './Dropdown.module.css';

export interface DropdownItem {
  id: string;
  label: ReactNode;
  onSelect: () => void;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  /** Tooltip explaining why the item is disabled. */
  disabledReason?: string;
}

export interface DropdownSeparator {
  id: string;
  separator: true;
}

export type DropdownEntry = DropdownItem | DropdownSeparator;

export interface DropdownProps {
  /** Accessible name of the trigger and the menu. Include any visible trigger text. */
  label: string;
  /** Content of the trigger button (icon, avatar, text…). */
  trigger: ReactNode;
  triggerClassName?: string;
  /** Non-interactive content above the items, e.g. the signed-in user. */
  header?: ReactNode;
  items: DropdownEntry[];
  align?: 'start' | 'end';
}

const GAP = 6;

function menuItems(menu: HTMLElement | null): HTMLElement[] {
  return Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
}

function focusAt(items: HTMLElement[], index: number) {
  if (items.length === 0) return;
  items[(index + items.length) % items.length]?.focus();
}

/**
 * Menu button following the WAI-ARIA menu pattern: arrow keys, Home/End, Escape and Tab.
 * The menu uses fixed positioning so it isn't clipped by scrolling containers such as tables.
 */
export function Dropdown({
  label,
  trigger,
  triggerClassName,
  header,
  items,
  align = 'end',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Position next to the trigger; flip above it when there's no room below.
  useLayoutEffect(() => {
    const triggerEl = triggerRef.current;
    const popover = popoverRef.current;
    if (!open || !triggerEl || !popover) return;

    const rect = triggerEl.getBoundingClientRect();
    const fitsBelow = rect.bottom + GAP + popover.offsetHeight <= window.innerHeight;
    popover.style.top = fitsBelow ? `${rect.bottom + GAP}px` : '';
    popover.style.bottom = fitsBelow ? '' : `${window.innerHeight - rect.top + GAP}px`;
    popover.style.left = align === 'start' ? `${rect.left}px` : '';
    popover.style.right = align === 'end' ? `${window.innerWidth - rect.right}px` : '';
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    focusAt(menuItems(menuRef.current), 0);

    const close = () => setOpen(false);
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, { capture: true, passive: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, { capture: true });
    };
  }, [open]);

  const closeAndFocusTrigger = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const elements = menuItems(menuRef.current);
    const current = elements.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAt(elements, current + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusAt(elements, current - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusAt(elements, 0);
        break;
      case 'End':
        event.preventDefault();
        focusAt(elements, elements.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        closeAndFocusTrigger();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={cx(styles.trigger, triggerClassName)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
      >
        {trigger}
      </button>

      {open && (
        <div ref={popoverRef} className={styles.popover}>
          {header && <div className={styles.header}>{header}</div>}
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            className={styles.menu}
            onKeyDown={onMenuKeyDown}
          >
            {items.map((entry) =>
              'separator' in entry ? (
                <div key={entry.id} role="separator" className={styles.separator} />
              ) : (
                <button
                  key={entry.id}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  aria-disabled={entry.disabled || undefined}
                  title={entry.disabled ? entry.disabledReason : undefined}
                  className={cx(styles.item, entry.tone === 'danger' && styles.danger)}
                  onClick={() => {
                    if (entry.disabled) return;
                    closeAndFocusTrigger();
                    entry.onSelect();
                  }}
                >
                  {entry.icon && (
                    <span className={styles.itemIcon} aria-hidden="true">
                      {entry.icon}
                    </span>
                  )}
                  {entry.label}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
