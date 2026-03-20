import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  Globe,
  Smartphone,
  MessageCircle,
  Download,
} from "lucide-react";

const Features = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const mainFeatures = [
    {
      icon: BookOpen,
      title: "Courses That Actually Matter",
      description:
        "Stop wasting time on content that does not help you. Our courses are designed to give you skills that transform your life.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Learn From The Best",
      description:
        "Our instructors are not just teachers - they are practitioners who have walked the path you want to take.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Award,
      title: "Proof of Your Growth",
      description:
        "Certificates that open doors. Show the world what you are capable of achieving.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: TrendingUp,
      title: "See Your Transformation",
      description:
        "Watch yourself evolve. Our tracking shows you exactly how far you have come and where you are going.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Zap,
      title: "Learning That Engages",
      description:
        "No more passive watching. Get hands-on with quizzes, projects, and challenges that build real skills.",
      color: "from-rose-500 to-red-500",
    },
    {
      icon: Shield,
      title: "Learn Once, Keep Forever",
      description:
        "Pay once and these skills are yours forever. Return to them anytime, anywhere.",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  const additionalFeatures = [
    {
      icon: Clock,
      title: "Self-Paced Learning",
      description: "Study on your schedule",
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Courses in 10+ languages",
    },
    { icon: Smartphone, title: "Mobile App", description: "Learn on the go" },
    {
      icon: MessageCircle,
      title: "Community Forums",
      description: "Connect with peers",
    },
    {
      icon: Download,
      title: "Offline Access",
      description: "Download and watch offline",
    },
    {
      icon: Award,
      title: "Shareable Certificates",
      description: "Share on LinkedIn",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 pt-16">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Powerful Features for{" "}
              <span className="gradient-text">Modern Learners</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400">
              Everything you need to succeed. Nothing you do not. Discover why
              learners choose LearnFlow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Learn Anywhere, <span className="gradient-text">Anytime</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Our platform is designed to fit your lifestyle. Whether you are
                commuting, on a lunch break, or relaxing at home, LearnFlow is
                always accessible.
              </p>
              <ul className="space-y-4">
                {[
                  "Mobile apps for iOS and Android",
                  "Download courses for offline viewing",
                  "Sync progress across all devices",
                  "Resume where you left off",
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-success-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop"
                  alt="Learning on mobile"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Available on
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      iOS & Android
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              More Great Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Everything you need for a complete learning experience
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-start space-x-4 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
