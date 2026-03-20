import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Lightbulb, Rocket, Sparkles } from "lucide-react";

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const values = [
    {
      icon: Target,
      title: "Why We Exist",
      description:
        "Education should not be a privilege. It should be a right. We exist to break barriers and open doors that were once closed.",
    },
    {
      icon: Eye,
      title: "What We See",
      description:
        "A world where your potential is not determined by where you were born or what you can afford. A world where you can become anyone you want to be.",
    },
    {
      icon: Heart,
      title: "What Drives Us",
      description:
        "The fire in us comes from knowing that somewhere, right now, someone is changing their life through learning. That someone could be you.",
    },
  ];

  const milestones = [
    { year: "2024", event: "The beginning of something transformative" },
    { year: "Today", event: "You join the journey" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 pt-16">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Why We <span className="gradient-text">Started This</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400">
              We saw a problem. Great education was only for the few. We decided
              to change that. Here is our story.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              The Journey So Far
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Every great story has a beginning. This is ours - and you are part
              of it now.
            </p>
          </motion.div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center space-x-6"
              >
                <div className="w-20 flex-shrink-0">
                  <span className="text-xl font-bold text-primary-600">
                    {milestone.year}
                  </span>
                </div>
                <div className="w-4 h-4 bg-primary-500 rounded-full flex-shrink-0" />
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                  <p className="text-slate-700 dark:text-slate-300">
                    {milestone.event}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promise Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Promise to You
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              This is what you can expect when you join us
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Rocket,
                title: "We Will Challenge You",
                description:
                  "Comfort is where growth dies. We will push you beyond what you thought possible.",
              },
              {
                icon: Lightbulb,
                title: "We Will Inspire You",
                description:
                  "Aha moments await. Be prepared to see the world differently.",
              },
              {
                icon: Sparkles,
                title: "We Will Support You",
                description:
                  "You are never alone. We are with you every step of the way.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
