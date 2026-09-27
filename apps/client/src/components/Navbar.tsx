import { PageContainer } from '@while-building/ui';
import { Link, NavLink } from 'react-router';
import { site } from '@/data/site';
import styles from './Navbar.module.css';

const navItems = [
  { to: '/articles', label: 'Articles' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
];

export function Navbar() {
  return (
    <header className={styles.header}>
      <PageContainer className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.prompt} aria-hidden="true">
            &gt;_
          </span>
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul role="list" className={styles.links}>
            {navItems.map((item) => (
              <li key={item.to}>
                {/* NavLink sets aria-current="page" on the active route (including
                    detail pages below it); the CSS keys off it. */}
                <NavLink to={item.to} className={styles.link}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </PageContainer>
    </header>
  );
}
