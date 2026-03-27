// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: "doc",
      id: "intro",
      label: "Introduction",
    },
    {
      type: "category",
      label: "Getting Started",
      items: [
        {
          type: "doc",
          id: "getting-started",
          label: "Installation Guide",
        },
      ],
    },
    {
      type: "category",
      label: "Core Concepts",
      items: [
        {
          type: "doc",
          id: "architecture",
          label: "Architecture",
        },
        {
          type: "doc",
          id: "features",
          label: "Features",
        },
        {
          type: "doc",
          id: "database-design",
          label: "Database Design",
        },
      ],
    },
    {
      type: "category",
      label: "API Documentation",
      items: [
        {
          type: "doc",
          id: "api-reference",
          label: "API Reference",
        },
      ],
    },
    {
      type: "category",
      label: "Security & Deployment",
      items: [
        {
          type: "doc",
          id: "security",
          label: "Security",
        },
        {
          type: "doc",
          id: "deployment",
          label: "Deployment",
        },
      ],
    },
    {
      type: "category",
      label: "User Guides",
      items: [
        {
          type: "doc",
          id: "user-guides/admin-guide",
          label: "Admin Guide",
        },
        {
          type: "doc",
          id: "user-guides/learner-guide",
          label: "Learner Guide",
        },
      ],
    },
  ],
};

export default sidebars;
