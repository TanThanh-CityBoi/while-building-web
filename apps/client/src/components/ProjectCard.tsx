import type { Project } from '@while-building/types';
import { Badge, TagList } from '@while-building/ui';
import { Link } from 'react-router';
import { stageTone } from '@/lib/projectStage';
import { ExternalLink } from './ExternalLink';
import styles from './ProjectCard.module.css';

type HeadingLevel = 'h2' | 'h3';

interface ProjectCardProps {
  project: Project;
  /** Use `h2` when the grid sits directly under the page's `h1`. */
  headingLevel?: HeadingLevel;
}

export function ProjectCard({ project, headingLevel: Heading = 'h3' }: ProjectCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <Heading className={styles.name}>
          <Link to={`/projects/${project.slug}`} className={styles.link}>
            {project.name}
          </Link>
        </Heading>
        {project.stage && (
          <Badge variant="dot" tone={stageTone[project.stage]}>
            {project.stage}
          </Badge>
        )}
      </div>
      <p className={styles.description}>{project.description}</p>
      <TagList items={project.technologies} label="Technologies" />
      {project.links && project.links.length > 0 && (
        <ul role="list" className={styles.links}>
          {project.links.map((link) => (
            <li key={link.label}>
              <ExternalLink {...link} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

interface ProjectGridProps {
  projects: Project[];
  headingLevel?: HeadingLevel;
}

export function ProjectGrid({ projects, headingLevel }: ProjectGridProps) {
  return (
    <ul role="list" className={styles.grid}>
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
