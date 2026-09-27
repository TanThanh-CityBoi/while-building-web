import { IconClose, IconMenu } from '@/components/icons';
import { UserMenu } from './UserMenu';
import styles from './Topbar.module.css';

interface TopbarProps {
  navOpen: boolean;
  onToggleNav: () => void;
}

export function Topbar({ navOpen, onToggleNav }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onToggleNav}
        aria-expanded={navOpen}
        aria-controls="app-sidebar"
        aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
      >
        {navOpen ? <IconClose width={20} height={20} /> : <IconMenu width={20} height={20} />}
      </button>
      <span className={styles.title}>While Building CMS</span>
      <div className={styles.end}>
        <UserMenu />
      </div>
    </header>
  );
}
