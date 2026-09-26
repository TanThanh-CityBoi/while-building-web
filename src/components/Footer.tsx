import { site, socialLinks } from '@/data/site';
import { ApiStatus } from './ApiStatus';
import { Container } from './Container';
import { ExternalLink } from './ExternalLink';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.identity}>
          <p className={styles.name}>{site.name}</p>
          <p className={styles.tagline}>{site.tagline}</p>
        </div>
        <ul role="list" className={styles.links} aria-label="Elsewhere">
          {socialLinks.map((link) => (
            <li key={link.label}>
              <ExternalLink {...link} />
            </li>
          ))}
        </ul>
        <div className={styles.meta}>
          <span>
            © {year} {site.name}
          </span>
          <ApiStatus />
        </div>
      </Container>
    </footer>
  );
}
