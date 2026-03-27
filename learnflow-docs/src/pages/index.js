import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            Get Started 🚀
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs/api-reference"
            style={{marginLeft: '10px'}}>
            API Reference 📚
          </Link>
        </div>
      </div>
    </header>
  );
}

function QuickLinks() {
  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <div className="row">
          <div className="col col--4">
            <div className={styles.quickLinkCard}>
              <div className={styles.quickLinkIcon}>📚</div>
              <Heading as="h3">Documentation</Heading>
              <p>Comprehensive guides and references for LearnFlow LMS</p>
              <Link className="button button--primary button--sm" to="/docs/">
                Browse Docs
              </Link>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.quickLinkCard}>
              <div className={styles.quickLinkIcon}>🚀</div>
              <Heading as="h3">Quick Start</Heading>
              <p>Get LearnFlow running in minutes with Docker Compose</p>
              <Link className="button button--primary button--sm" to="/docs/getting-started">
                Get Started
              </Link>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.quickLinkCard}>
              <div className={styles.quickLinkIcon}>🔧</div>
              <Heading as="h3">API Reference</Heading>
              <p>Complete REST API documentation with examples</p>
              <Link className="button button--primary button--sm" to="/docs/api-reference">
                View API
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  const technologies = [
    {name: 'React', icon: '⚛️', description: 'UI Component Library'},
    {name: 'FastAPI', icon: '⚡', description: 'Modern Python Framework'},
    {name: 'PostgreSQL', icon: '🐘', description: 'Relational Database'},
    {name: 'MongoDB', icon: '🍃', description: 'NoSQL Database'},
    {name: 'Docker', icon: '🐳', description: 'Containerization'},
    {name: 'Tailwind CSS', icon: '🎨', description: 'Utility-first CSS'},
  ];

  return (
    <section className={styles.techStack}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Built with Modern Technologies
        </Heading>
        <div className="row">
          {technologies.map((tech, idx) => (
            <div key={idx} className="col col--2">
              <div className={styles.techCard}>
                <div className={styles.techIcon}>{tech.icon}</div>
                <Heading as="h4">{tech.name}</Heading>
                <p>{tech.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="LearnFlow - A Modern Learning Management System built with React, FastAPI, PostgreSQL, and MongoDB">
      <HomepageHeader />
      <main>
        <QuickLinks />
        <HomepageFeatures />
        <TechStack />
      </main>
    </Layout>
  );
}
