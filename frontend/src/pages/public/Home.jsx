import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ArrowRight, Sparkles, BookOpen, Users, 
  Target, Zap, Code, Layout, Blocks, GraduationCap, ChevronRight 
} from 'lucide-react';

// Reusable animated counter component
const AnimatedCounter = ({ value, label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-secondary-600">
        {value}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide text-sm">{label}</p>
    </motion.div>
  );
};

// Fade up wrapper
const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const { scrollYProgress } = useScroll();
  const opacityOffset = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const yOffset = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 selection:bg-primary-500/30 overflow-hidden font-sans">
      
      {/* 
        ========================================
        1. HERO SECTION 
        ========================================
      */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-50 dark:opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-secondary-400/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Typography */}
            <motion.div 
              style={{ opacity: opacityOffset, y: yOffset }}
              className="flex flex-col text-center lg:text-left items-center lg:items-start max-w-3xl mx-auto lg:mx-0"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-8 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
                LearnFlow 2.0 Released
                <ChevronRight className="w-4 h-4 ml-1 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-slate-900 dark:text-white"
              >
                Master modern <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  development.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-xl leading-relaxed"
              >
                Stop watching endless tutorials. Start building real projects. 
                Our interactive LMS puts a production-grade development environment directly in your browser.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <Link to="/register" className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all text-lg">
                  Start learning free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/courses" className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5 transition-all text-lg">
                  Explore catalog
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Column: Floating 3D Graphic */}
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 50 }}
              className="relative hidden lg:block h-[500px]"
            >
              {/* Central Primary Card */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-10 right-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 z-20 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <Code className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Active IDE Session</h3>
                    <p className="text-sm text-slate-500">React Server Components</p>
                  </div>
                </div>
                {/* Mock Code Lines */}
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-700 rounded-md"></div>
                  <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-700 rounded-md"></div>
                  <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-700 rounded-md"></div>
                  <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-700 rounded-md"></div>
                </div>
                <div className="mt-6 flex justify-end">
                  <div className="px-4 py-2 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-lg text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
                    Running
                  </div>
                </div>
              </motion.div>

              {/* Background Secondary Floating Card */}
              <motion.div 
                animate={{ y: [10, -10, 10], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -right-10 w-64 bg-slate-50 dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 z-10 backdrop-blur-md"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Course Progress</h4>
                    <p className="text-xs text-slate-500">Advanced JS</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                  />
                </div>
              </motion.div>

              {/* Background Tertiary Floating Card */}
              <motion.div 
                animate={{ y: [5, -5, 5], x: [-5, 5, -5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-0 -left-12 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4 z-30"
              >
                 <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3">
                      <Zap className="w-6 h-6 text-orange-500" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">14 Days</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Coding Streak</span>
                 </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        2. TRUST SCROLLBAR
        ========================================
      */}
      <div className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-8">
            Trusted by developers from
          </p>
          <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Mock Company Logos using text for structural placeholders */}
             {['Stripe', 'Vercel', 'Linear', 'Github', 'Spotify', 'Discord'].map((company, i) => (
               <span key={i} className="text-xl md:text-2xl font-bold text-slate-400 dark:text-slate-600 flex items-center gap-2">
                 <Blocks className="w-6 h-6" /> {company}
               </span>
             ))}
          </div>
        </div>
      </div>

      {/* 
        ========================================
        3. DESIGN BENTO GRID (FEATURES)
        ========================================
      */}
      <section className="py-24 lg:py-32 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <FadeUp className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              Everything you need to ship.
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              We've combined video learning, interactive coding challenges, and career 
              analytics into a single, seamless platform.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            
            {/* Massive Bento Card (Takes up 2 rows, 2 cols on desktop) */}
            <FadeUp delay={0.1} className="md:col-span-2 md:row-span-2 group relative bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-10 overflow-hidden border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:border-primary-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary-400/20 to-secondary-400/20 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700 ease-out" />
              
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                  <Layout className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">An IDE in your browser</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md">
                  Say goodbye to "it works on my machine". We provide containerized environments for every course, ensuring you never waste time configuring a local setup again.
                </p>
              </div>
            </FadeUp>

            {/* Small Bento Card 1 */}
            <FadeUp delay={0.2} className="group relative bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-8 overflow-hidden border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:border-secondary-500/30 transition-all duration-300">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-700">
                  <BookOpen className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Curated Paths</h3>
                  <p className="text-slate-600 dark:text-slate-400">Step-by-step guides from Junior to Senior.</p>
                </div>
              </div>
            </FadeUp>

            {/* Small Bento Card 2 */}
            <FadeUp delay={0.3} className="group relative overflow-hidden rounded-[2rem] p-8 bg-slate-900 dark:bg-black text-white hover:shadow-2xl transition-all duration-300 border border-slate-800">
              {/* Subtle background texture pattern */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-md border border-white/10">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Community Driven</h3>
                  <p className="text-slate-400">Join thousands of engineers in our private Discord.</p>
                </div>
              </div>
            </FadeUp>

            {/* Small Bento Card 3 - Spanning bottom 2 cols on md */}
            <FadeUp delay={0.4} className="md:col-span-2 group relative bg-primary-600 rounded-[2rem] p-8 overflow-hidden shadow-lg hover:shadow-xl hover:shadow-primary-600/20 transition-all duration-300 text-white">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/4 translate-y-1/4 group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between h-full gap-6">
                 <div>
                    <h3 className="text-3xl font-bold mb-3">Earn Certificates</h3>
                    <p className="text-primary-100 text-lg max-w-sm">Pass coding assessments automatically and generate verifiable certificates for your resume.</p>
                 </div>
                 <div className="hidden md:flex w-24 h-24 bg-white/20 rounded-full items-center justify-center backdrop-blur-md border border-white/30 shrink-0">
                    <GraduationCap className="w-10 h-10 text-white" />
                 </div>
              </div>
            </FadeUp>

          </div>
        </div>
      </section>

      {/* 
        ========================================
        4. COUNTERS SECTION
        ========================================
      */}
      <section className="bg-slate-50 dark:bg-slate-800/20 py-24 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedCounter value="250+" label="COURSES" />
            <AnimatedCounter value="45K" label="STUDENTS" />
            <AnimatedCounter value="120" label="EXPERT MENTORS" />
            <AnimatedCounter value="99%" label="SUCCESS RATE" />
          </div>
        </div>
      </section>

      {/* 
        ========================================
        5. BOTTOM CTA
        ========================================
      */}
      <section className="py-32 relative text-center px-4">
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
           <motion.div 
             animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
             className="w-[800px] h-[800px] bg-gradient-to-tr from-primary-600 to-secondary-600 rounded-full blur-[150px] mix-blend-screen opacity-50"
           ></motion.div>
        </div>
        
        <FadeUp className="relative z-10 max-w-4xl mx-auto">
          <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-8 animate-pulse" />
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
            Stop waiting. <br/> Start building.
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Get instant access to over 250+ development courses, interactive labs, and an incredible community.
          </p>
          <Link 
            to="/register" 
            className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 shadow-2xl transition-all"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </FadeUp>
      </section>

    </div>
  );
};

export default Home;
