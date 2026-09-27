import { Badge } from '@while-building/ui';
import { cx } from '@while-building/utils';
import { Link, NavLink } from 'react-router';
import { filterByPermission } from '@/auth/permissions';
import { useAuth } from '@/auth/useAuth';
import { ApiStatus } from '@/components/ApiStatus';
import { navigation, type NavItem } from './navigation';
import styles from './Sidebar.module.css';

interface SidebarProps {
  /** Drawer state on small screens (always visible on desktop). */
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { can } = useAuth();
  const items = filterByPermission(navigation, can);

  const renderLink = (item: NavItem, nested = false) => (
    <NavLink
      to={item.to}
      end={item.end}
      className={cx(styles.link, nested && styles.nested)}
      onClick={onNavigate}
    >
      <item.icon className={styles.icon} />
      {item.label}
    </NavLink>
  );

  return (
    <aside className={cx(styles.sidebar, open && styles.open)} id="app-sidebar">
      <Link to="/dashboard" className={styles.brand} onClick={onNavigate}>
        <span className={styles.prompt} aria-hidden="true">
          &gt;_
        </span>
        While Building
        <Badge tone="accent">CMS</Badge>
      </Link>

      <nav aria-label="Main" className={styles.nav}>
        <ul role="list" className={styles.list}>
          {items.map((item) => (
            <li key={item.to}>
              {renderLink(item)}
              {item.children && (
                <ul role="list" className={styles.list}>
                  {item.children.map((child) => (
                    <li key={child.to}>{renderLink(child, true)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <ApiStatus />
      </div>
    </aside>
  );
}
