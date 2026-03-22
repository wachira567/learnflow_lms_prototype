import React from "react";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  return (
    <div className="bg-white dark:bg-slate-900 pt-16">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400">
              <p>
                <strong className="text-slate-900 dark:text-white">Last Updated: {new Date().getFullYear()}</strong>
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">1. Introduction</h2>
              <p>
                This Privacy Policy describes how LearnFlow collects, uses, discloses, and safeguards your information when you use our online learning platform. By accessing or using our services, you agree to the terms outlined herein.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">2. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, including but not limited to: account registration details, profile information, course enrollment data, learning progress, and communication preferences. Additionally, we may automatically collect certain technical information through your use of our platform.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">3. How We Use Your Information</h2>
              <p>
                We use the information we collect to: provide, maintain, and improve our services; process your transactions; communicate with you regarding updates, support, and promotional materials; comply with legal obligations; and protect the rights, safety, and property of our company and users.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">4. Information Sharing and Disclosure</h2>
              <p>
                We may share your information with third-party service providers who assist us in operating our platform, conducting our business, or servicing you. We may also disclose your information when required by law, regulation, or legal process, or when such disclosure is necessary to enforce our terms and policies.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security of your data.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">6. Your Rights</h2>
              <p>
                Subject to applicable laws, you may have the right to access, rectify, erase, or restrict processing of your personal information. You may also have the right to object to processing and the right to data portability. To exercise these rights, please contact our support team.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">7. Changes to This Policy</h2>
              <p>
                We reserve the right to modify this Privacy Policy at any time. Any changes will be effective immediately upon posting the updated policy on our platform. Your continued use of our services following any modifications indicates your acceptance of the revised policy.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">8. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact us through our support channels. We will respond to your inquiry within a reasonable timeframe.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
