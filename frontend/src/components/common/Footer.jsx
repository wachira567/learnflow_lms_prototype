import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">LearnFlow</span>
            </Link>
            <p className="text-slate-400 text-sm text-center md:text-left max-w-xs">
              Start learning today. Level up your skills and unlock your potential!
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link
              to="/about"
              className="text-slate-400 hover:text-primary-400 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-slate-400 hover:text-primary-400 transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/privacy"
              className="text-slate-400 hover:text-primary-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-slate-400 hover:text-primary-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-slate-500">
            © {currentYear} LearnFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
