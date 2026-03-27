import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "📚 Course Management",
    description: (
      <>
        Create, edit, and manage courses with ease. Support for video and text
        lessons, course categories, difficulty levels, and comprehensive lesson
        management.
      </>
    ),
  },
  {
    title: "👥 User Management",
    description: (
      <>
        Role-based access control with Admin and Learner roles. Manage users,
        track progress, and maintain security with comprehensive audit logging.
      </>
    ),
  },
  {
    title: "📊 Analytics & Reporting",
    description: (
      <>
        Comprehensive analytics dashboard with enrollment trends, user growth,
        category distribution, and detailed reports for courses and students.
      </>
    ),
  },
  {
    title: "💬 Discussions & Messaging",
    description: (
      <>
        Course discussions with voting system, private messaging between
        learners and instructors, and real-time communication features.
      </>
    ),
  },
  {
    title: "🏆 Leaderboards",
    description: (
      <>
        Course leaderboards ranked by completion percentage and time spent.
        Track top performers and motivate learners with competitive rankings.
      </>
    ),
  },
  {
    title: "🔒 Security First",
    description: (
      <>
        JWT authentication, bcrypt password hashing, rate limiting, input
        validation, and comprehensive audit logging for security and compliance.
      </>
    ),
  },
];

function Feature({ title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className={styles.featureCard}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className={styles.featuresTitle}>
          Key Features
        </Heading>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
