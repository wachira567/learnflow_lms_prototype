import React from "react";
import { motion } from "framer-motion";

const TermsOfService = () => {
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
              Terms of Service
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400">
              <p>
                <strong className="text-slate-900 dark:text-white">Last Updated: {new Date().getFullYear()}</strong>
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">1. Acceptance of Terms</h2>
              <p>
                By accessing and using LearnFlow's online learning platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, you should not use our services.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">2. Use License</h2>
              <p>
                Permission is granted to temporarily use LearnFlow for personal, non-commercial educational purposes only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose; transfer the materials to another person or entity; or attempt to reverse engineer any software contained on the platform.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">3. User Account and Conduct</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to: provide accurate and complete registration information; maintain the security of your password; notify us immediately of any unauthorized use of your account; and refrain from engaging in any conduct that could damage, disable, or impair the functioning of our platform.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">4. Course Content and Intellectual Property</h2>
              <p>
                All course materials, content, and intellectual property available on LearnFlow are owned by us or our licensors. You may not reproduce, distribute, modify, create derivative works from, publicly display, or otherwise exploit any content without prior written consent. Course content is provided for educational purposes only.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">5. Limitation of Liability</h2>
              <p>
                LearnFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the platform. This includes damages for loss of profits, goodwill, data, or other intangible losses, even if we have been advised of the possibility of such damages.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">6. Disclaimer of Warranties</h2>
              <p>
                The platform is provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, regarding the accuracy, reliability, or completeness of the content on this platform. Your use of the platform is at your sole risk.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">7. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless LearnFlow and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to your use of the platform or any violation of these terms.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">8. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Any changes will be effective immediately upon posting on this page. Your continued use of the platform following any changes indicates your acceptance of the new terms.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">9. Termination</h2>
              <p>
                We may terminate or suspend your access to the platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms of Service.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">10. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the appropriate courts.
              </p>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">11. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us through our support channels. We will endeavor to respond to your inquiry within a reasonable timeframe.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
