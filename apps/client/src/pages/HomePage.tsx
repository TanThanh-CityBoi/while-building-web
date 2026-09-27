import { Badge, ErrorState, LoadingState, PageContainer, type BadgeTone } from '@while-building/ui';
import { ArticleList } from '@/components/ArticleCard';
import { ButtonLink } from '@/components/ButtonLink';
import { ProjectGrid } from '@/components/ProjectCard';
import { Section } from '@/components/Section';
import { useArticles, useProjects } from '@/content/queries';
import { experiments, type ExperimentStatus } from '@/data/experiments';
import { site } from '@/data/site';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from './HomePage.module.css';

const experimentTone: Record<ExperimentStatus, BadgeTone> = {
  running: 'success',
  paused: 'warning',
  planned: 'neutral',
};

const RECENT_ARTICLES = 3;

export function HomePage() {
  usePageMeta();
  const articles = useArticles();
  const projects = useProjects();

  return (
    <PageContainer>
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
        {articles.isPending ? (
          <LoadingState label="Loading articles…" />
        ) : articles.isError ? (
          <ErrorState title="Couldn't load articles" onRetry={() => void articles.refetch()} />
        ) : (
          <ArticleList articles={articles.data.slice(0, RECENT_ARTICLES)} />
        )}
      </Section>

      <Section title="Featured Projects" action={{ to: '/projects', label: 'All projects' }}>
        {projects.isPending ? (
          <LoadingState label="Loading projects…" />
        ) : projects.isError ? (
          <ErrorState title="Couldn't load projects" onRetry={() => void projects.refetch()} />
        ) : (
          <ProjectGrid projects={projects.data.filter((project) => project.featured)} />
        )}
      </Section>

      <Section
        title="Current Experiments"
        description="What I'm poking at right now. Some of these will turn into articles; some will break."
      >
        <ul role="list" className={styles.experiments}>
          {experiments.map((experiment) => (
            <li key={experiment.title} className={styles.experiment}>
              <Badge variant="dot" tone={experimentTone[experiment.status]}>
                {experiment.status}
              </Badge>
              <div>
                <h3 className={styles.experimentTitle}>{experiment.title}</h3>
                <p className={styles.experimentDescription}>{experiment.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </PageContainer>
  );
}
