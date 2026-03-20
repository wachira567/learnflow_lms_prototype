import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  Clock,
  BookOpen,
  ChevronDown,
  X,
} from "lucide-react";
import { courseService } from "../../services/courseService";

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, categoriesData] = await Promise.all([
          courseService.getAllCourses(),
          courseService.getCategories(),
        ]);
        setCourses(coursesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await courseService.getAllCourses({
        search: searchQuery,
        category: selectedCategory,
        level: selectedLevel,
      });
      setCourses(data);
    } catch (error) {
      console.error("Error searching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLevel("");
    courseService.getAllCourses().then(setCourses);
  };

  const levels = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Browse Courses
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Discover your next learning adventure from our collection of
          expert-led courses.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <form
          onSubmit={handleSearch}
          className="flex flex-col lg:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>

          <div
            className={`lg:flex items-center gap-4 ${showFilters ? "flex flex-col" : "hidden"}`}
          >
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full lg:w-48 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full lg:w-40 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full lg:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Active filters */}
        {(selectedCategory || selectedLevel || searchQuery) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Active filters:
            </span>
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="ml-2">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("")}
                  className="ml-2"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedLevel && (
              <span className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full">
                {selectedLevel}
                <button onClick={() => setSelectedLevel("")} className="ml-2">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </motion.div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600 dark:text-slate-400">
          Showing{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {courses.length}
          </span>{" "}
          courses
        </p>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl h-80 animate-pulse"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link to={`/courses/${course.id}`} className="group block h-full">
                <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-medium text-slate-700 dark:text-slate-300 rounded-full">
                        {course.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                        {course.level}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {course.rating}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-500 dark:text-slate-500">
                            {course.duration}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-primary-600">
                        KSh {course.price}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCourses;
