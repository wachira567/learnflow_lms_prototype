---
sidebar_position: 1
---

# Admin Guide

This guide covers how to use LearnFlow as an administrator.

## Getting Started as Admin

### Accessing Admin Dashboard

1. **Login** with admin credentials at http://localhost:3000/login
2. You'll be redirected to the **Admin Dashboard** at http://localhost:3000/admin
3. The dashboard shows platform statistics and quick actions

### Admin Dashboard Overview

The admin dashboard displays:

- **Total Users**: Number of registered users
- **Total Courses**: Number of courses created
- **Total Enrollments**: Number of course enrollments
- **Active Users**: Users with active enrollments
- **Published Courses**: Courses visible to learners

## Course Management

### Creating a Course

1. Navigate to **Admin > Courses** (http://localhost:3000/admin/courses)
2. Click **"Add Course"** button
3. Fill in the course details:
   - **Title**: Course name
   - **Description**: Course description
   - **Category**: Select from Programming, Design, Marketing, Business, Data Science
   - **Level**: Select from Beginner, Intermediate, Advanced
   - **Duration**: Estimated duration (e.g., "4 hours")
   - **Thumbnail URL**: Course thumbnail image URL
   - **Banner URL**: Course banner image URL
4. Click **"Create Course"**

### Editing a Course

1. Navigate to **Admin > Courses**
2. Find the course in the list
3. Click the **edit icon** (pencil)
4. Update the course details
5. Click **"Save Changes"**

### Deleting a Course

1. Navigate to **Admin > Courses**
2. Find the course in the list
3. Click the **delete icon** (trash)
4. Confirm deletion

> **Warning**: Deleting a course will also delete all associated lessons and enrollments.

### Publishing a Course

1. Navigate to **Admin > Courses**
2. Find the course in the list
3. Click the **publish toggle** to make it visible to learners
4. Published courses appear in the learner's course catalog

## Lesson Management

### Adding Lessons to a Course

1. Navigate to **Admin > Courses**
2. Click on a course title to open lesson management
3. Click **"Add Lesson"** button
4. Fill in lesson details:
   - **Title**: Lesson name
   - **Type**: Select "Video" or "Text"
   - **Duration**: Estimated duration (e.g., "15 minutes")
   - **Content**: Video URL or text content
   - **Notes**: Additional notes for learners
5. Click **"Create Lesson"**

### Editing a Lesson

1. Navigate to **Admin > Courses**
2. Click on a course title
3. Find the lesson in the list
4. Click the **edit icon**
5. Update lesson details
6. Click **"Save Changes"**

### Deleting a Lesson

1. Navigate to **Admin > Courses**
2. Click on a course title
3. Find the lesson in the list
4. Click the **delete icon**
5. Confirm deletion

### Lesson Order

Lessons are displayed in the order they were created. To reorder lessons:

1. Delete and recreate lessons in the desired order
2. Or update the lesson order in MongoDB directly

## User Management

### Viewing Users

1. Navigate to **Admin > Users** (http://localhost:3000/admin/users)
2. View all registered users
3. Filter by role (learner/admin)
4. Search by email or name

### User Details

Click on a user to view:

- **Profile Information**: Name, email, role
- **Enrollment Statistics**: Courses enrolled, completed
- **Activity**: Last login, account creation date
- **Status**: Active/Blocked

### Changing User Role

1. Navigate to **Admin > Users**
2. Find the user in the list
3. Click the **role dropdown**
4. Select new role (learner/admin)
5. Confirm the change

> **Note**: You cannot change your own role.

### Blocking/Unblocking Users

1. Navigate to **Admin > Users**
2. Find the user in the list
3. Click the **block/unblock button**
4. Confirm the action

**Blocked users:**

- Cannot log in
- Cannot access any features
- Cannot send messages

## Analytics & Reporting

### Platform Analytics

1. Navigate to **Admin > Analytics** (http://localhost:3000/admin/analytics)
2. View key metrics:
   - **Total Users**: Registered user count
   - **Total Courses**: Course count
   - **Total Enrollments**: Enrollment count
   - **Active Users**: Users with enrollments
   - **Published Courses**: Visible courses

### Category Distribution

View course distribution by category:

- Programming
- Design
- Marketing
- Business
- Data Science

### Enrollment Trends

Track enrollment trends over time:

- Daily enrollments
- Daily completions
- Trend visualization

### User Growth

Monitor user growth:

- Monthly new users
- Total user growth
- Growth visualization

### Platform Insights

View platform insights:

- Average lesson views per course
- Overall completion rate
- Total lessons viewed
- Total enrollments

## Reports

### Course Report

1. Navigate to **Admin > Analytics**
2. Click **"Course Report"**
3. Apply filters:
   - **Category**: Filter by course category
   - **Level**: Filter by difficulty level
   - **Date Range**: Filter by creation date
   - **Limit**: Number of results (5, 10, 20, 30, 50)
4. View report with:
   - Total enrollments
   - Completed enrollments
   - Completion rate

### Student Report

1. Navigate to **Admin > Analytics**
2. Click **"Student Report"**
3. Apply filters:
   - **Course**: Filter by specific course
   - **Status**: enrolled, completed, in_progress
   - **Date Range**: Filter by enrollment date
   - **Limit**: Number of results
4. View report with:
   - Student information
   - Course details
   - Progress percentage
   - Enrollment status

### User Report

1. Navigate to **Admin > Analytics**
2. Click **"User Report"**
3. Apply filters:
   - **Role**: Filter by user role
   - **Date Range**: Filter by registration date
   - **Limit**: Number of results
4. View report with:
   - User information
   - Courses enrolled
   - Courses completed

### Activity Report

1. Navigate to **Admin > Analytics**
2. Click **"Activity Report"**
3. Select date range
4. View recent activity:
   - New users
   - New enrollments
   - Course completions
   - New courses

## Communication

### Viewing Messages

1. Navigate to **Admin > Messages** (http://localhost:3000/admin/messages)
2. View all private messages from learners
3. Messages are organized by conversation

### Replying to Messages

1. Navigate to **Admin > Messages**
2. Find the message thread
3. Click **"Reply"** button
4. Type your response
5. Click **"Send"**

### Direct Messaging

1. Navigate to **Admin > Messages**
2. Click **"New Message"**
3. Select a learner from the list
4. Type your message
5. Click **"Send"**

## Audit Logs

### Viewing Audit Logs

1. Navigate to **Admin > Users** (audit logs are accessible from user management)
2. View all platform activities:
   - User registrations
   - User logins
   - Course creations
   - Course updates
   - Lesson completions
   - Enrollments

### Filtering Audit Logs

Filter logs by:

- **User**: Specific user ID
- **Action**: Action type (user_login, course_created, etc.)
- **Search**: User email or name
- **Limit**: Number of results

### Audit Log Details

Each log entry shows:

- **User**: Who performed the action
- **Action**: What action was performed
- **Resource**: What resource was affected
- **IP Address**: User's IP address
- **User Agent**: User's browser/client
- **Timestamp**: When the action occurred

## Best Practices

### Course Creation

1. **Write clear descriptions**: Help learners understand what they'll learn
2. **Use appropriate categories**: Make courses easy to find
3. **Set realistic durations**: Help learners plan their time
4. **Add comprehensive lessons**: Break content into digestible chunks
5. **Include notes**: Provide additional context for learners

### User Management

1. **Monitor active users**: Keep track of platform usage
2. **Review blocked users**: Regularly check if blocks should be lifted
3. **Manage roles carefully**: Only promote trusted users to admin
4. **Respond to messages**: Address learner inquiries promptly

### Analytics

1. **Review regularly**: Check analytics weekly
2. **Track trends**: Monitor enrollment and completion trends
3. **Identify popular courses**: Understand what learners want
4. **Improve completion rates**: Identify courses with low completion rates

### Security

1. **Review audit logs**: Check for suspicious activity
2. **Monitor failed logins**: Watch for brute force attempts
3. **Keep secrets secure**: Never share admin credentials
4. **Regular backups**: Ensure data is backed up regularly

## Troubleshooting

### Cannot Access Admin Dashboard

**Problem**: Redirected to learner dashboard after login

**Solution**:

1. Verify your user role is "admin"
2. Check database: `SELECT role FROM users WHERE email = 'your@email.com';`
3. Update role if needed: `UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';`

### Course Not Visible to Learners

**Problem**: Learners cannot see the course

**Solution**:

1. Check if course is published
2. Navigate to Admin > Courses
3. Toggle the publish switch for the course

### Cannot Delete Course

**Problem**: Error when deleting course

**Solution**:

1. Check if course has enrollments
2. Unenroll all users first
3. Then delete the course

### Messages Not Sending

**Problem**: Cannot send messages to learners

**Solution**:

1. Check if learner account is active
2. Check if learner is blocked
3. Verify learner exists in the system

## Next Steps

- **[Learner Guide](./learner-guide)** - Learn how learners use the platform
- **[Features](../features)** - Explore all available features
- **[API Reference](../api-reference)** - API documentation for developers
