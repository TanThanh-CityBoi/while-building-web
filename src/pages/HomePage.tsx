import { ArticleList } from '@/components/ArticleCard';
import { ButtonLink } from '@/components/ButtonLink';
import { Container } from '@/components/Container';
import { ProjectGrid } from '@/components/ProjectCard';
import { Section } from '@/components/Section';
import { StatusIndicator, type StatusTone } from '@/components/StatusIndicator';
import { recentArticles } from '@/data/articles';
import { experiments } from '@/data/experiments';
import { featuredProjects } from '@/data/projects';
import { site } from '@/data/site';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { ExperimentStatus } from '@/types/content';
import styles from './HomePage.module.css';

const experimentTone: Record<ExperimentStatus, StatusTone> = {
  running: 'success',
  paused: 'warning',
  planned: 'neutral',
};

export function HomePage() {
  usePageMeta();

  return (
    <Container>
      <section className={styles.hero} aria-labelledby="hero-title">
        <p className={styles.eyebrow}>{'// a personal engineering journal'}</p>
        <h1 id="hero-title" className={styles.title}>
          {site.name}
          <span className={styles.caret} aria-hidden="true" />
        </h1>
        <p className={styles.tagline}>{site.tagline}</p>
        <p className={styles.description}>{site.description}</p>
        <div className={styles.actions}>
          <ButtonLink to="/articles">Read Articles</ButtonLink>
          <ButtonLink to="/projects" variant="secondary">
            Explore Projects
          </ButtonLink>
        </div>
      </section>

      <Section title="Recent Articles" action={{ to: '/articles', label: 'All articles' }}>
        <ArticleList articles={recentArticles} />
      </Section>

      <Section title="Featured Projects" action={{ to: '/projects', label: 'All projects' }}>
        <ProjectGrid projects={featuredProjects} />
      </Section>

      <Section
        title="Current Experiments"
        description="What I'm poking at right now. Some of these will turn into articles; some will break."
      >
        <ul role="list" className={styles.experiments}>
          {experiments.map((experiment) => (
            <li key={experiment.title} className={styles.experiment}>
              <StatusIndicator tone={experimentTone[experiment.status]}>
                {experiment.status}
              </StatusIndicator>
              <div>
                <h3 className={styles.experimentTitle}>{experiment.title}</h3>
                <p className={styles.experimentDescription}>{experiment.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </Container>
  );
}
