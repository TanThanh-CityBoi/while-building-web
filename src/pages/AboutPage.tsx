import { Container } from '@/components/Container';
import { ExternalLink } from '@/components/ExternalLink';
import { PageHeader } from '@/components/PageHeader';
import { Section } from '@/components/Section';
import { TagList } from '@/components/Tag';
import { currentlyLearning, engineeringInterests, technologies } from '@/data/about';
import { site, socialLinks } from '@/data/site';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from './AboutPage.module.css';

export function AboutPage() {
  usePageMeta({
    title: 'About',
    description: `About ${site.name} — a personal engineering journal.`,
  });

  return (
    <Container>
      <PageHeader eyebrow="~/about" title="About" />

      <div className={styles.intro}>
        <p>
          {site.name} is my personal engineering journal — a place to document the things I build,
          the experiments I run, the problems I solve, and the lessons I learn along the way.
          Including the things that break.
        </p>
        {/* TODO: replace with a real introduction. */}
        <p className={styles.placeholder}>
          [Placeholder] A short introduction: who I am, what I work on, and what I care about as an
          engineer.
        </p>
      </div>

      <div className={styles.sections}>
        <Section title="Engineering Interests">
          <ul className={styles.list}>
            {engineeringInterests.map((interest) => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </Section>

        <Section title="Currently Learning">
          <ul className={styles.list}>
            {currentlyLearning.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </Section>

        <Section title="Technologies">
          <TagList items={technologies} label="Technologies" />
        </Section>

        <Section title="Links">
          <ul role="list" className={styles.links}>
            {socialLinks.map((link) => (
              <li key={link.label}>
                <ExternalLink {...link} />
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </Container>
  );
}
