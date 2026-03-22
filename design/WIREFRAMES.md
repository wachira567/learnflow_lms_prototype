# LearnFlow LMS - Design Wireframes

This document contains low-fidelity wireframes illustrating the main screens and user flows for the LearnFlow Learning Management System.

---

## 1. Public Pages

### 1.1 Home Page (Landing Page)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Home  Courses  Features  About  Contact   [Login] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              Welcome to LearnFlow                           │
│         Your Gateway to Online Learning                    │
│                                                             │
│    [Browse Courses]           [Register Free]              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Featured Courses                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   [Image]   │  │   [Image]   │  │   [Image]   │         │
│  │  Course 1   │  │  Course 2   │  │  Course 3   │         │
│  │  ★★★★☆     │  │  ★★★★★     │  │  ★★★★☆     │         │
│  │  Beginner   │  │  Intermediate│  │  Advanced   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Features                                                  │
│  📚 500+ Courses    👥 10k+ Students    🎯 95% Completion  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                           [Footer]                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Course Catalog (Browse)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Home  Courses  Features  About  Contact   [User]  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search courses...              [Category ▼] [Level ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  All Courses (42)                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   [Image]   │  │   [Image]   │  │   [Image]   │         │
│  │  Python 101 │  │  React JS   │  │  Data Science│         │
│  │             │  │             │  │              │         │
│  │  ⏱ 4 hours │  │  ⏱ 6 hours  │  │  ⏱ 8 hours   │         │
│  │  Beginner   │  │  Intermediate│  │  Advanced    │         │
│  │  ★★★★☆     │  │  ★★★★★     │  │  ★★★★☆      │         │
│  │  120 enrolled│ │  340 enrolled│ │  89 enrolled  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  [1] [2] [3] ... [Next →]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Pages

### 2.1 Login Page

```
┌─────────────────────────────────────────────────────────────┐
│                           ← Back                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Welcome Back                             │
│                                                             │
│  Email                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ user@example.com                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Password                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ••••••••                                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ ] Remember me              [Forgot Password?]           │
│                                                             │
│  [                    Login                               ] │
│                                                             │
│  ─────────────────── OR ───────────────────                │
│                                                             │
│  [  Continue with Google  ]                                │
│                                                             │
│  Don't have an account? [Register]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Registration Page

```
┌─────────────────────────────────────────────────────────────┐
│                           ← Back                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Create Account                           │
│                                                             │
│  First Name                    Last Name                    │
│  ┌────────────────────┐    ┌────────────────────┐          │
│  │ John               │    │ Doe                │          │
│  └────────────────────┘    └────────────────────┘          │
│                                                             │
│  Email                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ john@example.com                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Password (min 8 chars, uppercase, lowercase, number)    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ••••••••                                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  I want to:                                                │
│  (•) Learn new skills      ( ) Teach courses              │
│                                                             │
│  [ ] I agree to Terms & Privacy Policy                     │
│                                                             │
│  [                   Register                             ] │
│                                                             │
│  Already have an account? [Login]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Learner Dashboard

### 3.1 Learner Dashboard Home

```
┌─────────────────────────────────────────────────────────────┐
│  [≡]  LearnFlow        🔍  [🔔] [🌙] [Avatar ▼]           │
├──────────────┬──────────────────────────────────────────────┤
│              │  Welcome back, John!                          │
│  Dashboard   │                                              │
│  My Learning │  Continue Learning                           │
│  Browse      │  ┌────────────────────────────────────────┐  │
│  Profile     │  │ [Course Banner]                        │  │
│              │  │ Python Fundamentals                    │  │
│              │  │ ████████░░░░░░░░░  40%                │  │
│              │  │ 4/10 lessons completed                  │  │
│              │  │ [        Continue        ]              │  │
│              │  └────────────────────────────────────────┘  │
│              │                                              │
│              │  My Courses (3)                             │
│              │  ┌──────┐ ┌──────┐ ┌──────┐                │
│              │  │Course│ │Course│ │Course│                │
│              │  │  60% │ │ 100% │ │  20% │                │
│              │  └──────┘ └──────┘ └──────┘                │
│              │                                              │
│              │  Recent Activity                             │
│              │  • Completed "Variables" - Python 101       │
│              │  • Enrolled in "React Basics"               │
│              │  • Started "Data Science Intro"             │
└──────────────┴──────────────────────────────────────────────┘
```

### 3.2 Course Details Page

```
┌─────────────────────────────────────────────────────────────┐
│  [←]  Browse / Python Fundamentals          [Enrolled ✓]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Banner Image]                                            │
│                                                             │
│  Python Fundamentals                                        │
│  ⭐⭐⭐⭐⭐ (124 reviews)  |  342 students  |  4 hours      │
│  Created by: Admin                                          │
│                                                             │
│  ┌────────────────────┐                                     │
│  │   [Enroll Now]    │  [Share]  [Wishlist]                │
│  └────────────────────┘                                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Overview] [Curriculum] [Reviews] [Discussion]             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  About This Course                                          │
│  Learn Python from scratch. This comprehensive course       │
│  covers variables, data types, functions, and more...       │
│                                                             │
│  What You'll Learn                                          │
│  ✓ Python basics and syntax                                 │
│  ✓ Data structures                                          │
│  ✓ Object-oriented programming                              │
│  ✓ File handling                                            │
│                                                             │
│  Course Curriculum (10 lessons)                            │
│  1. Introduction           [10 min] [✓ Completed]           │
│  2. Variables              [15 min] [✓ Completed]           │
│  3. Data Types             [20 min] [🔄 In Progress]        │
│  4. Operators              [15 min] [○ Not Started]         │
│  ...                                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Lesson Viewer

```
┌─────────────────────────────────────────────────────────────┐
│  [←]  Python Fundamentals  /  Lesson 3: Data Types          │
├─────────────────────────────────────────────────────────────┤
│  Course Content                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              [Video Player]                         │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │ Lesson 3: Data Types │  │ ○ Mark Complete ✓         │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                             │
│  Description                                               │
│  In this lesson, you'll learn about Python data types      │
│  including strings, integers, floats, booleans, and lists. │
│                                                             │
│  [📝 Notes] [📎 Resources] [💬 Discussion]                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ◀ Previous: Variables          Next: Operators ▶          │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 My Learning Page

```
┌─────────────────────────────────────────────────────────────┐
│  [≡]  LearnFlow        🔍  [🔔] [🌙] [Avatar ▼]           │
├──────────────┬──────────────────────────────────────────────┤
│              │  My Learning                                 │
│  Dashboard   │                                              │
│  My Learning │  [All] [In Progress] [Completed]            │
│  Browse      │                                              │
│  Profile     │  ┌────────────────────────────────────────┐  │
│              │  │ [Banner]  Python Fundamentals        │  │
│              │  │           4/10 lessons • 40%          │  │
│              │  │  ████████░░░░░░░░░░                    │  │
│              │  │  [Continue Learning →]               │  │
│              │  └────────────────────────────────────────┘  │
│              │                                              │
│              │  ┌────────────────────────────────────────┐  │
│              │  │ [Banner]  React Basics               │  │
│              │  │           8/8 lessons • 100%          │  │
│              │  │  ██████████████████████                │  │
│              │  │  [View Certificate →]                 │  │
│              │  └────────────────────────────────────────┘  │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 4. Admin Dashboard

### 4.1 Admin Dashboard Home

```
┌─────────────────────────────────────────────────────────────┐
│  [≡]  LearnFlow        🔍  [🔔] [🌙] [Admin ▼]            │
├──────────────┬──────────────────────────────────────────────┤
│              │  Dashboard                                   │
│  📊 Dashboard│                                              │
│  📚 Courses  │  Welcome back, Admin!                        │
│  📖 Lessons  │                                              │
│  👥 Users    │  ┌────────┐ ┌────────┐ ┌────────┐          │
│  📈 Analytics│  │ 156    │ │ 42     │ │ 89%    │          │
│  📋 Audit    │  │ Users  │ │Courses │ │Completion│         │
│              │  └────────┘ └────────┘ └────────┘          │
│              │                                              │
│              │  Recent Enrollments              [View All] │
│              │  • John Doe enrolled in Python 101           │
│              │  • Jane Smith enrolled in React Basics       │
│              │  • Bob Wilson enrolled in Data Science       │
│              │                                              │
│              │  Course Performance              [View All] │
│              │  Python Fundamentals - 342 students          │
│              │  React Basics - 256 students                 │
│              │  Web Development - 189 students              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 4.2 Course Management (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│  [≡]  LearnFlow        🔍  [🔔] [🌙] [Admin ▼]            │
├──────────────┬──────────────────────────────────────────────┤
│              │  Course Management          [+ Add Course] │
│  📊 Dashboard│                                              │
│  📚 Courses  │  [Search...] [Category ▼] [Level ▼]        │
│  📖 Lessons  │                                              │
│  👥 Users    │  ┌────────────────────────────────────────┐  │
│  📈 Analytics│  │ Course        │ Category │ Students │  │
│  📋 Audit    │  ├────────────────────────────────────────┤  │
│              │  │ Python 101    │ Tech     │ 342    [⋮]│  │
│              │  │ React Basics │ Tech     │ 256    [⋮]│  │
│              │  │ Data Science │ Data     │ 189    [⋮]│  │
│              │  │ UI/UX Design │ Design   │ 145    [⋮]│  │
│              │  └────────────────────────────────────────┘  │
│              │                                              │
│              │  [1] [2] [3] ... [Next →]                   │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 4.3 Create/Edit Course Modal

```
┌─────────────────────────────────────────────────────────────┐
│                    Create New Course                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Course Title *                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Introduction to Python                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Description *                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │ Learn Python from scratch...                         │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Category *              Level *                           │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ Technology     ▼│    │ Beginner       ▼│              │
│  └──────────────────┘    └──────────────────┘              │
│                                                             │
│  Duration *                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 4 hours                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Thumbnail URL                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ https://...                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancel]                              [Create Course]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 User Management (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│  [≡]  LearnFlow        🔍  [🔔] [🌙] [Admin ▼]            │
├──────────────┬──────────────────────────────────────────────┤
│              │  User Management                              │
│  📊 Dashboard│                                              │
│  📚 Courses  │  [Search by name/email...] [Role ▼] [Status] │
│  📖 Lessons  │                                              │
│  👥 Users    │  ┌────────────────────────────────────────┐  │
│  📈 Analytics│  │ User      │ Email    │ Role │ Status │  │
│  📋 Audit    │  ├────────────────────────────────────────┤  │
│              │  │ John Doe  │ john@... │Learn │Active │  │
│              │  │ Jane Smith│ jane@... │Admin │Active │  │
│              │  │ Bob W.    │ bob@...  │Learn │Blocked│  │
│              │  └────────────────────────────────────────┘  │
│              │                                              │
│              │  [1] [2] [3] ... [Next →]                   │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 4.5 Analytics Page (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│  [≡]  LearnFlow        🔍  [🔔] [🌙] [Admin ▼]            │
├──────────────┬──────────────────────────────────────────────┤
│              │  Analytics                                    │
│  📊 Dashboard│  [📊 Stats] [📈 Reports] [📋 Audit Logs]  │
│  📚 Courses  │                                              │
│  📖 Lessons  │  ┌────────────────────────────────────────┐  │
│  👥 Users    │  │        Enrollment Trends (30 days)     │  │
│  📈 Analytics│  │     📈                                  │  │
│  📋 Audit    │  │    📈 📈                                │  │
│              │  │   📈 📈 📈                              │  │
│              │  │  📈 📈 📈 📈                             │  │
│              │  └────────────────────────────────────────┘  │
│              │                                              │
│              │  Category Distribution                      │
│              │  Tech ████████████░░░░░ 45%                │
│              │  Design ██████░░░░░░░░░░ 24%                │
│              │  Business ████░░░░░░░░░░░ 16%               │
│              │  Other ██░░░░░░░░░░░░░░░ 15%                │
│              │                                              │
│              │  Top Courses                                  │
│              │  1. Python Fundamentals - 342 enrollments   │
│              │  2. React Basics - 256 enrollments           │
│              │  3. Web Development - 189 enrollments         │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 4.6 Audit Logs (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│  [≡]  LearnFlow        🔍  [🔔] [🌙] [Admin ▼]            │
├──────────────┬──────────────────────────────────────────────┤
│              │  Audit Logs                      [Export]   │
│  📊 Dashboard│                                              │
│  📚 Courses  │  [Search...] [Action ▼] [Date Range]       │
│  📖 Lessons  │                                              │
│  👥 Users    │  ┌────────────────────────────────────────┐  │
│  📈 Analytics│  │ User      │ Action    │ Resource │Time │  │
│  📋 Audit    │  ├────────────────────────────────────────┤  │
│              │  │ John Doe  │ LOGIN     │ /auth   │Now  │  │
│              │  │ Admin     │ CREATE    │ Course  │5m   │  │
│              │  │ Jane S.   │ ENROLL    │ Course1 │10m  │  │
│              │  │ John Doe  │ COMPLETE  │ Lesson  │15m  │  │
│              │  │ Admin     │ UPDATE    │ User    │20m  │  │
│              │  └────────────────────────────────────────┘  │
│              │                                              │
│              │  [1] [2] [3] ... [Next →]                   │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 5. User Flows

### 5.1 Learner Registration Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Home    │───▶│ Register │───▶│ Verify   │───▶│ Dashboard│
│  Page    │    │ Form     │    │ Email    │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                  │
                                                  ▼
                                          ┌──────────┐
                                          │ Browse   │───▶ Enroll
                                          │ Courses  │
                                          └──────────┘
```

### 5.2 Course Creation Flow (Admin)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Dashboard│───▶│ Create   │───▶│ Add      │───▶│ Publish  │
│          │    │ Course   │    │ Lessons  │    │ Course   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 5.3 Learning Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Browse   │───▶│ Course   │───▶│ Enroll   │───▶│ Complete │
│ Courses  │    │ Details  │    │          │    │ Lessons  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                       │
                                                       ▼
                                               ┌──────────┐
                                               │ View     │
                                               │ Certificate
                                               └──────────┘
```

---

## 6. Color Scheme

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Blue | `#3B82F6` | Buttons, links, accents |
| Primary Dark | `#1E40AF` | Hover states, headers |
| Success Green | `#10B981` | Completion, success states |
| Warning Yellow | `#F59E0B` | Warnings, in-progress |
| Danger Red | `#EF4444` | Errors, delete actions |
| Background Light | `#F9FAFB` | Light mode background |
| Background Dark | `#111827` | Dark mode background |
| Text Primary | `#111827` | Main text |
| Text Secondary | `#6B7280` | Secondary text |

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | < 640px | Phones |
| Tablet | 640px - 1024px | Tablets |
| Desktop | > 1024px | Laptops/Desktops |

---

## 8. Design Principles Applied

1. **Clarity**: Clear hierarchy with consistent typography
2. **Feedback**: Interactive elements provide visual feedback
3. **Consistency**: Same patterns across all pages
4. **Accessibility**: Sufficient contrast, readable fonts
5. **Simplicity**: Minimal unnecessary elements
6. **User-Centric**: Focus on key actions and information

---

*This wireframe document was created to guide the implementation of the LearnFlow LMS. The actual implementation may vary slightly based on technical requirements.*
