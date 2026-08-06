**01 – Product Requirements Document (PRD)**
This is the foundation of the entire project.
**UniCodeIDE**
**Product Requirements Document (PRD)**
**Version:** 1.0
**Project Name:** UniCodeIDE
**Tagline:** *The Complete Cloud IDE & Learning Platform for Universities*
**Prepared By:** Ruchit Raval
**Project Type:** Full Stack Web Application
**Technology Stack:**
- Frontend: React.js
- Backend: Node.js + Express.js
- Database: MongoDB
- Authentication: JWT
- Real-Time Communication: Socket.IO
- Online Code Editor: Monaco Editor
**1. Executive Summary**
**Overview**
UniCodeIDE is a cloud-based programming education platform designed specifically for universities and colleges. It combines a modern Cloud Integrated Development Environment (IDE) with a Learning Management System (LMS), allowing students to learn programming, write and execute code, complete assignments, participate in coding examinations, and track their academic progress from a single web-based platform.
Unlike traditional programming education, where students must install software such as Visual Studio Code, programming language compilers, and development tools on their own devices, UniCodeIDE provides everything directly through the web browser. This eliminates installation issues, version mismatches, and configuration problems while creating a consistent learning environment for all students.
The platform also empowers teachers to create courses, upload study materials, manage assignments, conduct coding examinations, evaluate student submissions, and monitor classroom activity in real time. University administrators can manage departments, teachers, students, academic sessions, and institutional reports through a centralized administrative dashboard.
UniCodeIDE is designed to simplify programming education by integrating learning, coding, assessment, and academic management into a single scalable platform.
**2. Product Vision**
To become the leading cloud-based programming education platform that enables universities and colleges to deliver practical programming education efficiently, securely, and collaboratively through a single integrated system.
**3. Product Mission**
Our mission is to eliminate the technical barriers associated with programming education by providing students, teachers, and university administrators with a unified cloud platform that simplifies learning, coding, assessment, and academic management.
**4. Problem Statement**
Programming education in many universities still relies on traditional desktop-based development environments. Students are required to install Integrated Development Environments (IDEs), programming languages, compilers, and extensions on their personal computers before participating in practical sessions.
This approach creates several challenges:
- Software installation and configuration consume valuable classroom time.
- Students often use different software versions, leading to inconsistent behavior.
- Teachers spend significant time resolving technical issues instead of teaching.
- Conducting secure and efficient online coding examinations is difficult.
- Student submissions are managed across multiple disconnected platforms.
- There is limited visibility into student coding activity during practical sessions.
- Universities lack a centralized system for managing programming education.
As a result, programming practicals become difficult to organize, monitor, and evaluate.
**5. Proposed Solution**
UniCodeIDE addresses these challenges by offering a browser-based platform that combines an online code editor with a comprehensive Learning Management System.
Students can access the platform from any modern web browser without installing software. The platform enables them to:
- Join programming courses.
- Read study materials.
- Watch educational videos.
- Practice coding.
- Complete laboratory exercises.
- Submit assignments.
- Participate in coding examinations.
- Track academic progress.
- Receive feedback and certificates.
Teachers gain powerful tools to create and manage programming courses, evaluate student performance, and conduct secure coding examinations. University administrators can manage institutional data and monitor academic activities through centralized dashboards.
**6. Product Objectives**
The primary objectives of UniCodeIDE are:
- Provide a browser-based coding environment for programming education.
- Eliminate software installation and configuration challenges.
- Centralize all programming-related academic activities.
- Improve collaboration between students and teachers.
- Simplify assignment and examination management.
- Enable real-time monitoring during practical sessions.
- Generate detailed reports and analytics for academic decision-making.
- Build a scalable platform that supports multiple universities independently.
**7. Target Audience**
UniCodeIDE is intended for educational institutions that offer programming-related courses.
Primary users include:
- Universities
- Engineering Colleges
- Computer Science Departments
- Information Technology Departments
- Programming Instructors
- Students
- Academic Administrators
**8. User Roles**
The platform consists of four primary user roles.
**Super Admin**
The Super Admin manages the overall platform infrastructure and system-wide operations.
Responsibilities include:
- University onboarding
- Subscription management
- Platform monitoring
- Global announcements
- Storage and server monitoring
- Support management
- Platform analytics
**University Admin**
Each university operates independently under its own administrative account.
Responsibilities include:
- Department management
- Course creation
- Semester management
- Subject management
- Teacher management
- Student management
- Academic session management
- Institutional reports
**Teacher**
Teachers are responsible for delivering programming education.
Responsibilities include:
- Course creation
- Study material uploads
- Video uploads
- Assignment creation
- Coding laboratory management
- Coding examination management
- Student evaluation
- Marks publication
- Live classroom monitoring
- Student performance analysis
**Student**
Students are the primary beneficiaries of the platform.
Students can:
- Join courses
- Access learning materials
- Practice programming
- Build coding projects
- Submit assignments
- Attend coding examinations
- View marks
- Download certificates
- Monitor learning progress
**9. Core Modules**
The first version of UniCodeIDE will include the following major modules:
- Public Website
- Authentication
- Super Admin Portal
- University Admin Portal
- Teacher Dashboard
- Student Dashboard
- Cloud IDE
- Learning Management System (LMS)
- Assignment Management
- Coding Laboratory
- Coding Examination
- Live Monitoring
- Reports & Analytics
- Notifications
- Settings
Each module is designed to function independently while integrating seamlessly with the rest of the platform.
**10. Product Workflow**
The overall workflow of the platform is as follows:
- Super Admin registers a university.
- University Admin configures departments, semesters, and subjects.
- Teachers create programming courses.
- Students enroll in courses.
- Teachers publish study materials, assignments, and coding labs.
- Students complete learning activities using the Cloud IDE.
- Teachers monitor progress and evaluate submissions.
- Students receive marks, feedback, and certificates.
- Administrators analyze reports and institutional performance.
**11. Success Metrics**
The success of UniCodeIDE will be measured through:
- Reduction in software installation issues.
- Increased student participation in coding activities.
- Faster assignment evaluation.
- Improved examination management.
- Higher course completion rates.
- Positive feedback from students and faculty.
- Stable platform performance.
- Scalability across multiple universities.
**12. Future Vision**
Future versions of UniCodeIDE may include:
- AI-powered code review.
- AI programming assistant.
- Automatic plagiarism detection.
- Real-time collaborative coding.
- Placement preparation modules.
- Company-sponsored coding challenges.
- Interview simulation environment.
- Mobile applications.
- Integration with university ERP systems.
- Multi-language compiler support.
- Advanced analytics powered by artificial intelligence.
**13. Conclusion**
UniCodeIDE aims to modernize programming education by combining the capabilities of a Cloud IDE and a Learning Management System into a single, scalable platform. By eliminating software installation barriers and centralizing academic workflows, the platform enables universities to deliver practical programming education more efficiently while providing students with a consistent and engaging learning experience.
**02**
**Software Requirements Specification (SRS)**
**Project Name:** UniCodeIDE
**Version:** 1.0
**Prepared By:** Ruchit Raval
**Table of Contents**
- Introduction
- Purpose
- Scope
- Product Overview
- Definitions
- User Roles
- Functional Requirements
- Non-Functional Requirements
- System Modules
- User Journey
- System Workflow
- Feature Requirements
- Security Requirements
- Performance Requirements
- Assumptions
- Constraints
**1. Introduction**
The Software Requirements Specification (SRS) defines the complete functional and technical requirements for UniCodeIDE. It serves as the primary reference document for developers, designers, testers, and stakeholders throughout the software development lifecycle.
Unlike the Product Requirements Document (PRD), which explains the business vision and product goals, this document specifies how the system should behave, what features it must provide, and how different modules interact with each other.
The SRS ensures that every feature is clearly defined before implementation begins.
**2. Purpose**
The purpose of UniCodeIDE is to provide universities with a centralized platform for programming education by combining a Cloud IDE and a Learning Management System (LMS).
The platform enables students to learn programming, write code, submit assignments, participate in coding examinations, and monitor their progress through a single browser-based application. Teachers can manage courses, assessments, and classroom activities, while administrators oversee institutional operations.
**3. Scope**
UniCodeIDE will support the complete lifecycle of programming education within universities and colleges.
The platform includes:
- Public website
- Authentication
- Multi-university architecture
- Role-based access control
- Cloud IDE
- Learning Management System
- Assignment Management
- Coding Laboratory
- Coding Examination
- Real-Time Monitoring
- Reports & Analytics
- Notifications
- Settings
The first release focuses on delivering the core educational workflow. Advanced AI-powered features are reserved for future versions.
**4. Product Overview**
UniCodeIDE is a Software-as-a-Service (SaaS) platform where each university has its own isolated workspace.
UniCodeIDE Platform
│
┌───────────────┴───────────────┐
│                               │
University A                     University B
│                               │
Departments                    Departments
Teachers                       Teachers
Students                       Students
Courses                        Courses
Assignments                    Assignments
Exams                          Exams
Each university operates independently, ensuring complete data isolation and security.
**5. User Roles**
The system defines four primary user roles:
**Super Admin**
Responsible for managing the overall platform.
Permissions include:
- Manage universities
- Approve registrations
- Monitor platform health
- View analytics
- Manage subscriptions
- Handle support requests
**University Admin**
Responsible for managing one university.
Permissions include:
- Departments
- Courses
- Subjects
- Semesters
- Teachers
- Students
- Academic sessions
- University reports
**Teacher**
Responsible for academic delivery.
Permissions include:
- Create courses
- Upload notes
- Upload videos
- Create coding assignments
- Create coding labs
- Schedule coding examinations
- Evaluate submissions
- Publish marks
- Monitor students
**Student**
Responsible for learning and completing academic tasks.
Permissions include:
- Access courses
- Practice coding
- Submit assignments
- Attend coding exams
- View marks
- Download certificates
- Track progress
**6. Functional Requirements**
**Authentication**
The system shall:
- Allow secure user registration.
- Allow secure login.
- Support role-based authentication.
- Support password reset.
- Support email verification.
- Allow logout.
- Maintain secure user sessions.
**University Management**
The system shall allow Super Admins to:
- Register universities.
- Approve university requests.
- Activate or deactivate universities.
- View university statistics.
**Department Management**
University Admins shall:
- Create departments.
- Edit departments.
- Archive departments.
- Assign teachers.
**Course Management**
Teachers shall:
- Create courses.
- Edit course details.
- Archive courses.
- Upload learning resources.
- Organize lessons into modules.
**Assignment Management**
Teachers shall:
- Create assignments.
- Set deadlines.
- Define programming language.
- Attach instructions.
- Review submissions.
- Publish marks and feedback.
Students shall:
- View assignments.
- Write code in the Cloud IDE.
- Submit before the deadline.
- View feedback after evaluation.
**Coding Laboratory**
Teachers shall create practical coding exercises.
Students shall complete coding exercises inside the browser.
Each submission shall store:
- Source code
- Output
- Execution time
- Programming language
- Submission timestamp
**Coding Examination**
Teachers shall:
- Create exams.
- Schedule exam time.
- Set duration.
- Select programming language.
- Add questions.
- Define marks.
Students shall:
- Start exam.
- View countdown timer.
- Write code.
- Submit manually.
- Automatically submit when time expires.
**Cloud IDE**
The Cloud IDE shall provide:
- Monaco Editor
- File Explorer
- Multi-file support
- Syntax highlighting
- Auto-save
- Code execution
- Terminal/output panel
- Dark mode
- Light mode
- Project management
- Keyboard shortcuts
**Learning Management System**
The LMS shall support:
- Course enrollment
- Learning modules
- Study materials
- Video lessons
- Example programs
- Coding practice
- Assignments
- Labs
- Exams
- Certificates
**Progress Tracking**
Students shall view:
- Course completion
- Assignment progress
- Coding streak
- Marks
- Certificates
- Achievements
Teachers shall view:
- Student progress
- Course completion rates
- Assignment statistics
**Reports**
The system shall generate:
- Student reports
- Teacher reports
- Department reports
- University reports
- Assignment reports
- Examination reports
- Attendance reports
Reports should support export to PDF and Excel.
**7. Non-Functional Requirements**
**Performance**
- Fast page loading.
- Responsive user interface.
- Low latency for real-time updates.
- Efficient database queries.
**Scalability**
- Support multiple universities.
- Handle thousands of concurrent users.
- Allow future module expansion.
**Security**
- JWT authentication.
- Password hashing.
- Input validation.
- Role-based authorization.
- Secure API communication.
- Protection against common web vulnerabilities.
**Availability**
- High uptime.
- Automatic backups.
- Fault tolerance where possible.
**Usability**
- Clean interface.
- Mobile-friendly.
- Accessible navigation.
- Consistent design.
**8. High-Level User Journey**
Visitor
│
▼
Public Website
│
▼
Login
│
▼
Dashboard (Role Based)
│
├── Super Admin
├── University Admin
├── Teacher
└── Student
│
▼
Course
│
▼
Learning
│
▼
Cloud IDE
│
▼
Assignment / Lab
│
▼
Coding Exam
│
▼
Evaluation
│
▼
Progress & Certificates
**9. Assumptions**
- Users have a stable internet connection.
- Universities manage their own academic data.
- Supported browsers include modern versions of Chrome, Edge, Firefox, and Safari.
- Programming languages available depend on the execution service configured for the platform.
**10. Constraints**
- Internet connectivity is required to access the Cloud IDE.
- Initial releases will focus on core educational features before advanced AI functionality.
- External compiler and execution services may be required for some programming languages.
- Universities are responsible for maintaining accurate academic records within their own workspace.
**03**
**UI/UX Design System**
**Project Name:** UniCodeIDE
**Version:** 1.0
**Prepared By:** Ruchit Raval
**Table of Contents**
- Design Philosophy
- Brand Identity
- Design Principles
- Visual Style
- Typography
- Layout System
- Responsive Design
- Grid System
- Spacing System
- Color Guidelines
- Iconography
- Illustrations
- Components
- Navigation
- Cards
- Forms
- Tables
- Dashboard Design
- Data Visualization
- Feedback Components
- Animation Guidelines
- Accessibility
- Dark Mode
- UX Best Practices
**1. Design Philosophy**
UniCodeIDE is not a traditional university portal. It is designed to feel like a modern SaaS platform that students, teachers, and administrators enjoy using every day.
The design should emphasize simplicity, clarity, consistency, and productivity.
Every screen should answer three questions immediately:
- Where am I?
- What can I do here?
- What should I do next?
The interface should reduce cognitive load by presenting only relevant information while keeping navigation predictable.
**2. Brand Identity**
**Product Name**
**UniCodeIDE**
**Tagline**
**The Complete Cloud IDE & Learning Platform for Universities**
**Brand Personality**
The product should feel:
- Professional
- Innovative
- Trustworthy
- Modern
- Educational
- Fast
- Clean
- Intelligent
- Collaborative
It should never feel cluttered, outdated, or overly playful.
**3. Design Principles**
Every page in UniCodeIDE should follow these principles:
**Simplicity**
Keep interfaces clean and easy to understand.
**Consistency**
Buttons, forms, typography, spacing, and interactions must behave consistently throughout the application.
**Scalability**
Every component should be reusable and adaptable as the platform grows.
**Accessibility**
The platform should be usable by all users, including those using assistive technologies.
**Performance**
Avoid unnecessary animations, large assets, and overly complex layouts that reduce performance.
**4. Visual Style**
The overall visual language should resemble modern software products rather than traditional educational portals.
Design inspiration may be taken from platforms such as:
- GitHub
- Vercel
- Linear
- Notion
- Stripe Dashboard
- Microsoft Learn
The interface should prioritize whitespace, clear typography, soft shadows, rounded corners, and meaningful animations.
**5. Typography**
Typography should establish a clear hierarchy.
**Heading Levels**
- H1 – Main page titles
- H2 – Section headings
- H3 – Card titles
- H4 – Small headings
**Body Text**
Used for descriptions, explanations, and content.
**Labels**
Used for forms, buttons, and navigation.
Typography should remain consistent across all pages.
**6. Layout System**
Every page should follow a predictable layout.
---------------------------------------------------
Navbar
---------------------------------------------------
Main Content
Sidebar (Optional)
Page Header
Content Sections
Footer
---------------------------------------------------
Each page should have consistent margins and spacing.
**7. Responsive Design**
The application must support:
- Mobile
- Tablet
- Laptop
- Desktop
- Ultra-wide monitors
No horizontal scrolling should occur.
Navigation should adapt naturally to different screen sizes.
**8. Grid System**
Cards and content should align using a flexible grid.
Examples:
Desktop
□□□□□□□□□□□□□□□□
□□□□□□□□□□□□□□□□
□□□□□□□□□□□□□□□□
Tablet
□□□□□□□□
□□□□□□□□
□□□□□□□□
Mobile
□□□□
□□□□
□□□□
**9. Spacing System**
Whitespace is an essential part of the design.
Spacing should remain consistent throughout the application.
Avoid placing elements too close together.
Each section should breathe naturally.
**10. ****Color**** Guidelines**
The platform should establish a professional and recognizable visual identity.
Instead of relying on fixed colors during planning, the implementation team should select a cohesive color palette that reflects:
- Technology
- Cloud Computing
- Programming
- Education
- Innovation
The chosen palette should provide strong contrast, support both light and dark themes, and maintain consistency across all modules.
**11. Iconography**
Icons should be:
- Simple
- Consistent
- Minimal
- Recognizable
Icons should help users understand actions rather than decorate the interface.
Examples include:
- Dashboard
- Courses
- Assignments
- IDE
- Notifications
- Certificates
- Settings
**12. Illustrations**
Illustrations should communicate the platform's purpose.
Recommended themes:
- Programming
- Cloud Development
- Online Learning
- Collaboration
- Universities
- Artificial Intelligence
- Students
- Teachers
Illustrations should remain modern and professional.
**13. Component Library**
The application should be built using reusable components.
Examples include:
- Button
- Input
- Textarea
- Select
- Checkbox
- Radio
- Modal
- Drawer
- Card
- Avatar
- Badge
- Tooltip
- Alert
- Toast
- Spinner
- Skeleton Loader
- Tabs
- Accordion
- Pagination
- Breadcrumb
- Dropdown
- Calendar
- Date Picker
- Code Editor Container
Every component should be reusable across the application.
**14. Navigation**
Navigation should always remain predictable.
Public Website
Logo
Home
Features
About
Contact
Login
Get Started
Authenticated Users
Sidebar
Dashboard
Courses
Assignments
Cloud IDE
Reports
Settings
Breadcrumbs should be used where appropriate.
**15. Cards**
Cards should display information consistently.
Examples:
Course Card
Course Image
Course Name
Teacher
Progress
Continue Button
Assignment Card
Assignment Title
Deadline
Language
Status
Open
Teacher Card
Photo
Name
Department
Courses
Profile
**16. Forms**
Every form should follow consistent validation rules.
Fields should display:
- Labels
- Placeholder text
- Validation feedback
- Error messages
- Success messages
Forms should clearly indicate required fields and prevent invalid submissions.
**17. Tables**
Tables should support:
- Sorting
- Searching
- Filtering
- Pagination
- Responsive layout
- Export options (where applicable)
Large tables should avoid overwhelming users by allowing column selection or grouping when necessary.
**18. Dashboard Design**
Every dashboard should follow the same structure.
Header
Statistics Cards
Quick Actions
Recent Activity
Charts
Tables
Announcements
This consistency helps users switch between dashboards without confusion.
**19. Data Visualization**
Charts should be used to present meaningful information, such as:
- Course completion
- Assignment status
- Student performance
- Examination results
- Department statistics
- Platform usage
Visualizations should remain clear and avoid unnecessary complexity.
**20. Feedback Components**
The application should provide immediate feedback for user actions.
Examples include:
- Success notifications
- Error messages
- Warning dialogs
- Confirmation prompts
- Loading indicators
- Empty states
Feedback should be concise and informative.
**21. Animation Guidelines**
Animations should improve usability rather than distract users.
Recommended interactions include:
- Smooth page transitions
- Button hover effects
- Card hover effects
- Fade-in content
- Modal transitions
- Drawer animations
- Loading skeletons
- Progress animations
Animations should remain subtle and fast.
**22. Accessibility**
UniCodeIDE should be usable by everyone.
The design should support:
- Keyboard navigation
- Screen readers
- Focus indicators
- Sufficient color contrast
- Accessible form labels
- Semantic HTML
- Logical tab order
Accessibility should be considered throughout the design process.
**23. Dark Mode**
The platform should support both light and dark themes.
Theme changes should affect:
- Navigation
- Cards
- Forms
- Tables
- Charts
- Code Editor
- Dashboards
The experience should remain consistent across themes.
**24. UX Best Practices**
To ensure a high-quality user experience:
- Keep navigation simple.
- Minimize the number of clicks required to complete tasks.
- Display important information first.
- Use progressive disclosure for advanced features.
- Maintain consistent terminology.
- Avoid unnecessary pop-ups.
- Provide helpful empty states.
- Confirm destructive actions.
- Save user progress automatically where appropriate.
- Design for both new and experienced users.
**📌**** Design Rules for the Development Team**
Every frontend developer contributing to UniCodeIDE should follow these rules:
- **Component First:** Build reusable UI components before creating pages.
- **Consistency Over Creativity:** Reuse existing patterns instead of inventing new ones for each page.
- **Responsive by Default:** Every component must work on mobile, tablet, laptop, and desktop.
- **Accessibility Matters:** Keyboard support and semantic HTML are required.
- **Performance First:** Optimize images, animations, and rendering to keep the interface fast.
- **Design with Purpose:** Every visual element should communicate information or support a user action.
**04**
**Frontend Architecture**
**Project Name:** UniCodeIDE
**Version:** 1.0
**Document Type:** Frontend Architecture Guide
**Table of Contents**
- Introduction
- Frontend Goals
- Technology Stack
- Architecture Principles
- Folder Structure
- Routing Architecture
- Layout System
- Component Architecture
- State Management
- API Layer
- Custom Hooks
- Utilities
- Constants
- Assets
- Authentication Flow
- Protected Routes
- Code Splitting
- Error Handling
- Performance Optimization
- Coding Standards
- React Best Practices
- Tailwind Best Practices
- Accessibility
- Development Workflow
**1. Introduction**
The frontend of **UniCodeIDE** is designed as a scalable, maintainable, and production-ready React application. The architecture emphasizes modularity, reusable components, clean separation of concerns, and a consistent development experience.
The primary objective is to ensure that as the project grows—from a simple landing page to a full-featured Cloud IDE and Learning Management System—the codebase remains organized, easy to navigate, and simple to extend.
**2. Frontend Goals**
The frontend should:
- Deliver a modern and responsive user experience.
- Maintain a consistent design language across all pages.
- Use reusable components wherever possible.
- Keep business logic separate from UI.
- Minimize code duplication.
- Be easy for multiple developers to work on simultaneously.
- Support future expansion without major restructuring.
**3. Technology Stack**
**Core Framework**
- React.js
**Build Tool**
- Vite
**Language**
- JavaScript (ES6+) initially, with a clear migration path to TypeScript if needed.
**Styling**
- Tailwind CSS
**Routing**
- React Router DOM
**Icons**
- React Icons
**Animations**
- Framer Motion
**HTTP Client**
- Axios
**Form Handling**
- React Hook Form
**Validation**
- Zod or Yup (choose one and use consistently)
**Notifications**
- React Hot Toast (or equivalent)
**4. Architecture Principles**
The frontend must follow these principles:
**Component-Driven Development**
Every UI element should be a reusable component.
**Single Responsibility Principle**
Each component should have one clear purpose.
**Separation of Concerns**
Keep UI, logic, and data fetching separate.
**Reusability**
Avoid rewriting components with similar functionality.
**Maintainability**
Organize code so future developers can understand it quickly.
**Scalability**
The architecture should support adding new modules without restructuring existing code.
**5. Recommended Folder Structure**
src/
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── illustrations/
│   └── fonts/
│
├── components/
│   ├── common/
│   ├── ui/
│   ├── forms/
│   ├── navigation/
│   ├── cards/
│   ├── tables/
│   ├── charts/
│   ├── modals/
│   ├── loaders/
│   └── editor/
│
├── layouts/
│   ├── PublicLayout.jsx
│   ├── DashboardLayout.jsx
│   └── AuthLayout.jsx
│
├── pages/
│   ├── public/
│   ├── auth/
│   ├── super-admin/
│   ├── university-admin/
│   ├── teacher/
│   ├── student/
│   ├── shared/
│   └── errors/
│
├── hooks/
├── context/
├── services/
├── api/
├── utils/
├── constants/
├── routes/
├── styles/
├── config/
├── App.jsx
└── main.jsx
**6. Routing Architecture**
The application should separate public and authenticated routes.
**Public Routes**
- Home
- Features
- About
- Contact
- FAQ
- Documentation
- Login
- Register
- Forgot Password
**Protected Routes**
**Super Admin**
- Dashboard
- Universities
- Analytics
- Support
- Settings
**University Admin**
- Dashboard
- Departments
- Teachers
- Students
- Subjects
- Reports
**Teacher**
- Dashboard
- Courses
- Assignments
- Labs
- Exams
- Results
**Student**
- Dashboard
- Courses
- Cloud IDE
- Assignments
- Exams
- Certificates
Unauthorized users must be redirected appropriately.
**7. Layout System**
The application should use reusable layouts.
**Public Layout**
- Navbar
- Page Content
- Footer
**Authentication Layout**
- Minimal design
- Focused forms
- Branding
**Dashboard Layout**
- Sidebar
- Top Navigation
- Content Area
- Notifications
- Footer (optional)
**8. Component Architecture**
Components should be categorized by purpose.
**UI Components**
Reusable building blocks:
- Button
- Input
- Select
- Badge
- Avatar
- Modal
- Spinner
- Tooltip
**Feature Components**
Business-specific:
- CourseCard
- AssignmentCard
- IDEToolbar
- ProgressWidget
- ExamTimer
**Layout Components**
- Navbar
- Sidebar
- Footer
- PageHeader
Each component should expose only the props necessary for its purpose.
**9. State Management**
Use the simplest solution that fits the problem.
- Local component state for isolated UI.
- Context API for global concerns (authentication, theme, user).
- Avoid unnecessary global state.
- Consider Zustand or Redux Toolkit only if application complexity justifies it.
**10. API Layer**
Never call APIs directly from components.
Instead:
Component
↓
Custom Hook
↓
Service
↓
API Client
↓
Backend
This improves testing, reusability, and maintainability.
**11. Custom Hooks**
Encapsulate reusable logic in custom hooks.
Examples:
- useAuth
- useTheme
- useDebounce
- usePagination
- useLocalStorage
- useSocket
- useCountdown
- useResponsive
Hooks should focus on behavior rather than presentation.
**12. Utilities**
Store pure helper functions in the utils directory.
Examples:
- Date formatting
- String formatting
- File size conversion
- Validation helpers
- Number formatting
Utilities should remain framework-independent where possible.
**13. Constants**
Centralize reusable values.
Examples:
- Routes
- Roles
- Status labels
- Programming languages
- Theme names
- API endpoints
- Error messages
Avoid hardcoding repeated values.
**14. Assets**
Organize assets by type.
- Images
- Logos
- Icons
- Illustrations
- Fonts
Optimize assets for performance and responsive loading.
**15. Authentication Flow**
- User logs in.
- Credentials are validated.
- JWT is stored securely.
- User profile is loaded.
- Role is determined.
- Appropriate dashboard is displayed.
Unauthorized access should redirect users to the login page.
**16. Protected Routes**
Every dashboard route must verify:
- Authentication status.
- User role.
- Required permissions.
Unauthorized access should display an informative page rather than a generic error.
**17. Code Splitting**
Improve performance through lazy loading.
Lazy load:
- Dashboard modules
- Reports
- Charts
- IDE
- Settings
- Analytics
Keep the initial bundle as small as possible.
**18. Error Handling**
Provide consistent error handling.
Examples:
- 404 Not Found
- 403 Forbidden
- 500 Server Error
- Network Failure
Display user-friendly messages with recovery options.
**19. Performance Optimization**
Key practices:
- Lazy load pages.
- Memoize expensive computations where appropriate.
- Optimize images.
- Avoid unnecessary re-renders.
- Virtualize long lists if needed.
- Minimize bundle size.
Performance should be measured regularly during development.
**20. Coding Standards**
To keep the project clean and scalable:
- One component, one responsibility.
- Use meaningful file and component names.
- Keep import order consistent.
- Remove unused code promptly.
- Prefer composition over duplication.
**21. React Best Practices**
- Prefer functional components.
- Use hooks instead of class components.
- Keep JSX readable.
- Extract repeated UI into reusable components.
- Avoid deeply nested component trees.
- Keep business logic out of presentation components.
**22. Tailwind CSS Best Practices**
- Group utility classes logically.
- Create reusable UI components instead of repeating long class lists.
- Use responsive utilities consistently.
- Avoid inline styles unless absolutely necessary.
- Maintain consistent spacing and sizing throughout the application.
**23. Accessibility**
Frontend development should prioritize accessibility.
- Semantic HTML.
- Keyboard navigation.
- Proper form labels.
- Visible focus states.
- ARIA attributes where required.
- Sufficient color contrast.
Accessibility should be considered part of the definition of "done."
**24. Development Workflow**
Every new feature should follow this workflow:
- Define the requirement.
- Identify reusable components.
- Design the UI.
- Build components.
- Integrate with routing.
- Connect to services.
- Test responsiveness.
- Validate accessibility.
- Optimize performance.
- Review and refactor.
**📌**** Frontend Development Rules (Mandatory)**
Every developer or AI assistant working on UniCodeIDE must follow these rules:
**File Organization**
- Never place multiple unrelated components in one file.
- Keep components focused and modular.
- Use descriptive file names.
**Component Size**
- Split components when they become difficult to understand.
- Extract repeated sections into smaller reusable components.
**Reusability**
- Build once, reuse everywhere.
- Avoid duplicate implementations.
**Clean Code**
- Prefer readable code over clever code.
- Use meaningful variable and function names.
- Remove dead code and unnecessary comments.
**Scalability**
- Design every component as if the application will double in size.
- Anticipate future features without overengineering.
**UI Consistency**
- Reuse existing design patterns.
- Maintain consistent spacing, typography, and interactions across the application.
**Performance**
- Optimize assets.
- Lazy load large features.
- Keep rendering efficient.
**Maintainability**
- Write code that another developer can understand quickly.
- Keep logic predictable and well-structured.
**05**
**Backend Architecture**
**Project Name:** UniCodeIDE
**Version:** 1.0
**Document Type:** Backend Architecture Guide
**Table of Contents**
- Introduction
- Backend Objectives
- Technology Stack
- Architecture Pattern
- Folder Structure
- Request Lifecycle
- API Architecture
- Authentication & Authorization
- Middleware
- Validation
- Error Handling
- Service Layer
- Database Layer
- File Upload Management
- Real-Time Communication
- Background Jobs
- Email Services
- Security
- Logging & Monitoring
- Environment Configuration
- Coding Standards
- Development Workflow
**1. Introduction**
The backend of **UniCodeIDE** serves as the core engine of the platform. It manages authentication, authorization, business logic, database communication, real-time services, file storage, notifications, and API communication.
The backend is designed to be **modular, secure, scalable, and maintainable**. Every module should operate independently while following consistent architectural patterns, allowing the application to grow without requiring major restructuring.
**2. Backend Objectives**
The backend should:
- Provide secure REST APIs.
- Support multiple universities with complete data isolation.
- Manage role-based authentication and authorization.
- Handle course, assignment, and examination workflows.
- Manage Cloud IDE sessions.
- Enable real-time communication.
- Store and retrieve academic data efficiently.
- Maintain high performance and reliability.
**3. Technology Stack**
**Runtime**
- Node.js
**Framework**
- Express.js
**Database**
- MongoDB
**ODM**
- Mongoose
**Authentication**
- JSON Web Token (JWT)
**Password Security**
- bcrypt
**File Upload**
- Multer
**Real-Time Communication**
- Socket.IO
**Environment Variables**
- dotenv
**Input Validation**
- Zod or Express Validator (choose one and use consistently)
**4. Architecture Pattern**
UniCodeIDE follows a layered architecture to separate responsibilities and keep the codebase maintainable.
Client
│
▼
Routes
│
▼
Controllers
│
▼
Services
│
▼
Repositories (Optional)
│
▼
Models
│
▼
MongoDB
Each layer has a single responsibility:
- **Routes:** Define endpoints and connect them to controllers.
- **Controllers:** Handle requests and responses.
- **Services:** Contain business logic.
- **Repositories (optional):** Manage complex database operations.
- **Models:** Define MongoDB schemas and interact with the database.
**5. Folder Structure**
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   ├── validations/
│   ├── utils/
│   ├── sockets/
│   ├── uploads/
│   ├── constants/
│   ├── jobs/
│   ├── emails/
│   ├── logs/
│   ├── database/
│   ├── app.js
│   └── server.js
│
├── package.json
├── .env
└── README.md
**6. Request Lifecycle**
Every API request should follow a consistent flow.
Client Request
│
▼
Route
│
▼
Authentication Middleware
│
▼
Validation Middleware
│
▼
Controller
│
▼
Service
│
▼
Database Model
│
▼
MongoDB
│
▼
Response
This ensures that authentication, validation, and business logic remain separate and reusable.
**7. API Architecture**
All endpoints should follow RESTful principles.
Example resource groups:
- /api/auth
- /api/users
- /api/universities
- /api/departments
- /api/courses
- /api/assignments
- /api/labs
- /api/exams
- /api/submissions
- /api/reports
- /api/notifications
API responses should be consistent across all endpoints.
**8. Authentication & Authorization**
The backend should support:
- User registration.
- Secure login.
- Password hashing with bcrypt.
- JWT-based authentication.
- Role-based access control.
- Token verification middleware.
- Secure logout.
Every protected endpoint must verify the user's role before allowing access.
**9. Middleware**
Reusable middleware should handle common tasks, such as:
- Authentication
- Authorization
- Request validation
- Error handling
- Logging
- File uploads
- Rate limiting
- CORS configuration
Middleware should be lightweight and reusable.
**10. Validation**
All incoming data must be validated before processing.
Validation should cover:
- Required fields
- Data types
- String lengths
- Email format
- Password strength
- File type and size
- Date validation
Invalid requests should return clear and consistent error messages.
**11. Error Handling**
The application should use centralized error handling.
Error categories include:
- Validation errors
- Authentication errors
- Authorization errors
- Resource not found
- Database errors
- Internal server errors
Responses should avoid exposing sensitive server information.
**12. Service Layer**
Business logic should reside in the service layer, not in controllers.
Examples:
- UserService
- CourseService
- AssignmentService
- ExamService
- NotificationService
- ReportService
This separation improves maintainability and testability.
**13. Database Layer**
The backend communicates with MongoDB through Mongoose models.
Models should represent core entities such as:
- User
- University
- Department
- Course
- Subject
- Assignment
- Submission
- Exam
- Notification
Relationships should be designed to support efficient queries while keeping the data model clear and scalable.
**14. File Upload Management**
The backend should support secure file uploads for:
- Profile images
- Course thumbnails
- Study materials
- Assignment attachments
- Certificates
Uploaded files should be validated for size and type before storage.
**15. Real-Time Communication**
Socket.IO will provide real-time functionality.
Examples:
- Live coding session updates
- Teacher monitoring
- Notifications
- Online/offline status
- Exam timers
- Collaboration features (future)
Socket events should be organized into dedicated modules.
**16. Background Jobs**
Some tasks should run asynchronously, including:
- Sending emails
- Cleaning temporary files
- Generating reports
- Scheduled notifications
- Future AI processing
Background jobs should not block API responses.
**17. Email Services**
The backend should support automated emails for:
- Account verification
- Password reset
- Assignment reminders
- Exam reminders
- Announcement notifications
- Certificate availability
Email templates should be reusable and centrally managed.
**18. Security**
Security is a core requirement.
The backend should implement:
- Password hashing
- JWT authentication
- Role-based permissions
- Environment variable protection
- Input validation
- Secure HTTP headers
- CORS configuration
- Rate limiting
- Request sanitization
Regular security reviews should be part of the development process.
**19. Logging & Monitoring**
The system should record:
- Authentication events
- API errors
- Critical system actions
- Server warnings
- Unexpected exceptions
Logs should help diagnose issues without exposing sensitive information.
**20. Environment Configuration**
Configuration values should never be hardcoded.
Store values such as:
- Database connection string
- JWT secret
- Email credentials
- Socket configuration
- Application port
- File upload limits
Use environment variables for all sensitive settings.
**21. Coding Standards**
Every backend module should follow these rules:
- Keep controllers lightweight.
- Place business logic in services.
- Reuse middleware where possible.
- Use descriptive names for files and functions.
- Avoid duplicate logic.
- Handle errors consistently.
- Write modular and maintainable code.
**22. Development Workflow**
Every backend feature should follow this process:
- Define the API requirement.
- Create or update the route.
- Add request validation.
- Implement the controller.
- Develop business logic in the service.
- Update the database model if needed.
- Test the endpoint.
- Review security and performance.
- Document the API.
- Deploy after successful testing.
**📌**** Backend Development Rules**
Every developer working on UniCodeIDE should follow these principles:
- Build modular APIs with a clear separation of concerns.
- Keep controllers focused on request/response handling.
- Encapsulate business logic in services.
- Validate all incoming data.
- Never expose sensitive information in responses.
- Design for scalability from the beginning.
- Reuse middleware and utility functions instead of duplicating logic.
- Maintain consistent API naming and response structures.
- Write code that is easy to understand, test, and extend.
**06**
**Database Design**
**Project Name:** UniCodeIDE
**Version:** 1.0
**Document Type:** Database Design Document
**Table of Contents**
- Introduction
- Database Overview
- Database Principles
- Collection Naming Standards
- Common Fields
- Collections
- Entity Relationships
- Multi-University Data Isolation
- Indexing Strategy
- Data Validation
- Soft Delete Strategy
- Future Collections
**1. Introduction**
The database is the foundation of UniCodeIDE. It stores all academic, administrative, and programming-related information, including users, universities, courses, assignments, coding exams, IDE projects, submissions, notifications, and certificates.
MongoDB is selected because it provides flexibility, scalability, and excellent support for document-based data.
**2. Database Overview**
The database follows a **document-oriented model**, where each major module is represented by its own collection.
The design emphasizes:
- Scalability
- Maintainability
- Data isolation
- Performance
- Security
- Flexibility
**3. Database Principles**
Every collection should follow these principles:
- One collection per major entity.
- Use ObjectId references between related collections.
- Store only necessary information.
- Avoid unnecessary duplication.
- Design for future expansion.
- Keep documents focused and manageable.
**4. Collection Naming Standards**
All collection names should:
- Be lowercase.
- Use plural nouns.
- Be descriptive.
- Remain consistent across the project.
Examples:
users
universities
departments
subjects
courses
assignments
submissions
exams
notifications
certificates
projects
**5. Common Fields**
Every collection should include the following fields where applicable:
_id
createdAt
updatedAt
createdBy
updatedBy
status
isDeleted
These fields help with auditing, maintenance, and future enhancements.
**6. Collections**
**6.1 Users**
Stores all platform users.
Fields:
- Full Name
- Email
- Password (Hashed)
- Phone Number
- Profile Photo
- Role
- University ID
- Department ID
- Semester ID
- Status
- Last Login
- Created At
- Updated At
**6.2 Universities**
Stores university information.
Fields:
- University Name
- Logo
- Address
- Email
- Phone
- Website
- Subscription Plan
- Status
- Academic Session
- Created At
**6.3 Departments**
Stores academic departments.
Fields:
- Department Name
- University ID
- Department Head
- Description
- Status
**6.4 Semesters**
Stores semester information.
Fields:
- Semester Name
- University ID
- Department ID
- Academic Year
- Status
**6.5 Subjects**
Stores programming subjects.
Fields:
- Subject Name
- Subject Code
- Semester ID
- Teacher ID
- Credits
- Description
**6.6 Courses**
Stores learning courses.
Fields:
- Course Title
- Course Description
- Subject ID
- Teacher ID
- Thumbnail
- Difficulty Level
- Total Lessons
- Estimated Duration
- Status
**6.7 Lessons**
Each course contains lessons.
Fields:
- Course ID
- Lesson Title
- Description
- Video URL
- Notes
- Example Code
- Lesson Order
**6.8 Assignments**
Stores programming assignments.
Fields:
- Assignment Title
- Description
- Course ID
- Teacher ID
- Programming Language
- Deadline
- Maximum Marks
- Attachment
- Status
**6.9 Assignment Submissions**
Stores student submissions.
Fields:
- Assignment ID
- Student ID
- Source Code
- Output
- Submission Time
- Marks
- Feedback
- Status
**6.10 Coding Labs**
Stores practical coding exercises.
Fields:
- Lab Title
- Description
- Programming Language
- Starter Code
- Expected Output
- Course ID
**6.11 Coding Exams**
Stores online coding examinations.
Fields:
- Exam Title
- Course ID
- Teacher ID
- Duration
- Start Time
- End Time
- Total Marks
- Status
**6.12 Exam Questions**
Stores coding questions.
Fields:
- Exam ID
- Question Title
- Description
- Programming Language
- Marks
- Difficulty
**6.13 Exam Submissions**
Stores exam attempts.
Fields:
- Exam ID
- Student ID
- Source Code
- Output
- Time Taken
- Marks
- Auto Submitted
**6.14 IDE Projects**
Stores student Cloud IDE projects.
Fields:
- Project Name
- Student ID
- Programming Language
- Files
- Folder Structure
- Last Saved
- Visibility
**6.15 Certificates**
Stores certificates.
Fields:
- Student ID
- Course ID
- Certificate Number
- Completion Date
- Download URL
**6.16 Notifications**
Stores system notifications.
Fields:
- Receiver ID
- Sender ID
- Title
- Message
- Type
- Read Status
**6.17 Announcements**
Stores university announcements.
Fields:
- University ID
- Title
- Description
- Publish Date
- Expiry Date
**6.18 Attendance**
Stores attendance records.
Fields:
- Student ID
- Subject ID
- Date
- Status
- Recorded By
**6.19 Progress**
Tracks learning progress.
Fields:
- Student ID
- Course ID
- Completed Lessons
- Completed Assignments
- Completion Percentage
- Coding Streak
**7. Entity Relationships**
Super Admin
│
Universities
│
Departments
│
Semesters
│
Subjects
│
Teachers
│
Courses
│
Lessons
│
Assignments
│
Submissions
Students
│
Courses
│
Projects
│
Coding Labs
│
Coding Exams
│
Certificates
**8. Multi-University Data Isolation**
Every academic collection should include a universityId field.
This ensures:
- Universities cannot access each other's data.
- Queries can be filtered efficiently.
- Future SaaS expansion is supported without major database changes.
**9. Indexing Strategy**
Indexes should be created for frequently queried fields, such as:
- Email
- University ID
- Department ID
- Teacher ID
- Student ID
- Course ID
- Assignment ID
- Exam ID
- Status
- Created At
Proper indexing improves query performance as the platform grows.
**10. Data Validation**
Validation should be applied at both the application and database levels.
Examples:
- Required fields
- Unique email addresses
- Valid role values
- Positive marks
- Valid dates
- Allowed programming languages
This helps maintain consistent and reliable data.
**11. Soft Delete Strategy**
Instead of permanently deleting important records, use a soft delete approach.
Each document should include:
isDeleted: Boolean
deletedAt: Date
deletedBy: ObjectId
This allows records to be restored if needed and supports audit requirements.
**12. Future Collections**
As UniCodeIDE evolves, additional collections may include:
- AI Code Reviews
- AI Feedback
- Plagiarism Reports
- Discussion Forums
- Chat Messages
- Live Collaboration Sessions
- Placement Challenges
- Company Coding Contests
- Interview Practice Results
- Activity Logs
**📌**** Database Design Guidelines**
Every new collection should follow these rules:
- Use meaningful collection names.
- Keep documents focused on one responsibility.
- Reference related entities using ObjectId.
- Include audit fields where appropriate.
- Add indexes for common query fields.
- Avoid storing duplicate information.
- Design with scalability in mind.
- Ensure data isolation between universities.
- Validate data before storage.
- Prefer soft deletes for important academic records.
**07**
**API Documentation**
**Project Name:** UniCodeIDE
**Version:** 1.0
**Document Type:** REST API Documentation
**Table of Contents**
- Introduction
- API Standards
- Base URL
- Authentication
- HTTP Methods
- Request & Response Format
- Status Codes
- Authentication APIs
- User APIs
- University APIs
- Department APIs
- Subject APIs
- Course APIs
- Lesson APIs
- Assignment APIs
- Submission APIs
- Coding Lab APIs
- Coding Exam APIs
- Cloud IDE APIs
- Notification APIs
- Certificate APIs
- Report APIs
- Dashboard APIs
- File Upload APIs
- WebSocket Events
- Error Handling
- API Versioning
- Best Practices
**1. Introduction**
This document defines all REST APIs used by UniCodeIDE. It establishes a consistent structure for requests, responses, authentication, and error handling to ensure seamless communication between the frontend and backend.
**2. API Standards**
All APIs should follow these standards:
- RESTful design
- JSON request and response bodies
- Consistent naming conventions
- Secure authentication
- Standard HTTP status codes
- Predictable error responses
**3. Base URL**
Development:
http://localhost:5000/api/v1
Production:
https://your-domain.com/api/v1
Versioning (v1) allows future API updates without breaking existing clients.
**4. Authentication**
Protected endpoints require a JWT in the request header.
Example:
Authorization: Bearer <JWT_TOKEN>
Unauthorized or expired tokens should return a 401 Unauthorized response.
**5. HTTP Methods**

|  | 
| --- | --- |
| Method | Purpose |
| GET | Retrieve data |
| POST | Create new data |
| PUT | Replace existing data |
| PATCH | Partially update data |
| DELETE | Remove data (or soft delete where applicable) |


**6. Request & Response Format**
**Successful Response**
{
"success": true,
"message": "Course created successfully.",
"data": {}
}
**Error Response**
{
"success": false,
"message": "Validation failed.",
"errors": []
}
Use a consistent response format across all endpoints.
**7. Status Codes**

|  | 
| --- | --- |
| Status Code | Meaning |
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |


**8. Authentication APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| POST | /auth/register | Register a new user |
| POST | /auth/login | User login |
| POST | /auth/logout | User logout |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset password |
| GET | /auth/profile | Get logged-in user profile |
| PATCH | /auth/profile | Update profile |


**9. User APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /users | Get all users |
| GET | /users/:id | Get user by ID |
| POST | /users | Create user |
| PATCH | /users/:id | Update user |
| DELETE | /users/:id | Delete user |


**10. University APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /universities | List universities |
| GET | /universities/:id | Get university |
| POST | /universities | Create university |
| PATCH | /universities/:id | Update university |
| DELETE | /universities/:id | Delete university |


**11. Department APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /departments | List departments |
| GET | /departments/:id | Get department |
| POST | /departments | Create department |
| PATCH | /departments/:id | Update department |
| DELETE | /departments/:id | Delete department |


**12. Subject APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /subjects | List subjects |
| GET | /subjects/:id | Get subject |
| POST | /subjects | Create subject |
| PATCH | /subjects/:id | Update subject |
| DELETE | /subjects/:id | Delete subject |


**13. Course APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /courses | List courses |
| GET | /courses/:id | Get course |
| POST | /courses | Create course |
| PATCH | /courses/:id | Update course |
| DELETE | /courses/:id | Archive course |


**14. Lesson APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /lessons | List lessons |
| GET | /lessons/:id | Get lesson |
| POST | /lessons | Create lesson |
| PATCH | /lessons/:id | Update lesson |
| DELETE | /lessons/:id | Delete lesson |


**15. Assignment APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /assignments | List assignments |
| GET | /assignments/:id | Get assignment |
| POST | /assignments | Create assignment |
| PATCH | /assignments/:id | Update assignment |
| DELETE | /assignments/:id | Delete assignment |


**16. Submission APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /submissions | List submissions |
| GET | /submissions/:id | Get submission |
| POST | /submissions | Submit assignment or lab |
| PATCH | /submissions/:id | Grade submission |


**17. Coding Lab APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /labs | List coding labs |
| GET | /labs/:id | Get coding lab |
| POST | /labs | Create coding lab |
| PATCH | /labs/:id | Update coding lab |
| DELETE | /labs/:id | Delete coding lab |


**18. Coding Exam APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /exams | List exams |
| GET | /exams/:id | Get exam |
| POST | /exams | Create exam |
| PATCH | /exams/:id | Update exam |
| DELETE | /exams/:id | Delete exam |
| POST | /exams/:id/start | Start exam |
| POST | /exams/:id/submit | Submit exam |


**19. Cloud IDE APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /projects | List IDE projects |
| GET | /projects/:id | Get project |
| POST | /projects | Create project |
| PATCH | /projects/:id | Save project |
| DELETE | /projects/:id | Delete project |
| POST | /projects/:id/run | Execute code |


**20. Notification APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /notifications | Get notifications |
| PATCH | /notifications/:id/read | Mark as read |
| DELETE | /notifications/:id | Delete notification |


**21. Certificate APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /certificates | List certificates |
| GET | /certificates/:id | Get certificate |
| GET | /certificates/:id/download | Download certificate |


**22. Report APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /reports/students | Student report |
| GET | /reports/courses | Course report |
| GET | /reports/exams | Exam report |
| GET | /reports/assignments | Assignment report |
| GET | /reports/university | University report |


**23. Dashboard APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| GET | /dashboard/student | Student dashboard |
| GET | /dashboard/teacher | Teacher dashboard |
| GET | /dashboard/admin | University admin dashboard |
| GET | /dashboard/super-admin | Super admin dashboard |


**24. File Upload APIs**

|  | 
| --- | --- |
| Method | Endpoint | Description |
| POST | /upload/profile | Upload profile image |
| POST | /upload/course-thumbnail | Upload course thumbnail |
| POST | /upload/material | Upload study material |
| POST | /upload/assignment | Upload assignment file |


Validate file size, type, and permissions before storing uploads.
**25. WebSocket Events**
Real-time features should use Socket.IO.
Examples:

|  | 
| --- | --- |
| Event | Description |
| student:online | Student connected |
| student:offline | Student disconnected |
| exam:start | Exam started |
| exam:end | Exam ended |
| project:autosave | IDE auto-save |
| notification:new | Push notification |
| teacher:monitor | Live monitoring update |


**26. Error Handling**
Every API should return meaningful and consistent errors.
Example:
{
"success": false,
"message": "Course not found.",
"errors": []
}
Avoid exposing internal server details or stack traces.
**27. API Versioning**
All APIs should include a version prefix.
Example:
/api/v1/courses
Future versions can be introduced as:
/api/v2/courses
This approach maintains backward compatibility.
**28. Best Practices**
All APIs should:
- Follow REST principles.
- Return consistent JSON structures.
- Validate incoming requests.
- Use appropriate HTTP status codes.
- Protect sensitive endpoints with JWT authentication.
- Support pagination, filtering, and sorting for list endpoints.
- Log important actions for auditing.
- Keep endpoint names descriptive and consistent.
**📌**** API Development Rules**
Every API developed for UniCodeIDE should adhere to these standards:
- Keep endpoint naming consistent.
- Use plural resource names (e.g., /courses, /assignments).
- Validate all input before processing.
- Return standardized responses.
- Handle errors gracefully.
- Secure protected routes with JWT and role-based authorization.
- Document new endpoints before implementation.
- Maintain backward compatibility through API versioning.
**08**
**Development Guidelines**
**Project Name:** UniCodeIDE
**Version:** 1.0
**Document Type:** Development Standards & Workflow
**Table of Contents**
- Introduction
- Development Philosophy
- Project Structure
- Coding Standards
- Naming Conventions
- Git Workflow
- Branch Strategy
- Commit Message Convention
- Pull Request Process
- Code Review Checklist
- Testing Guidelines
- Environment Setup
- Configuration Management
- Security Best Practices
- Performance Guidelines
- Documentation Standards
- Issue Tracking
- Release Process
- Deployment Readiness Checklist
- Future Improvements
**1. Introduction**
This document defines the development standards and engineering practices for the UniCodeIDE project. It ensures that every developer follows a consistent workflow, resulting in a codebase that is easy to understand, maintain, and scale.
**2. Development Philosophy**
UniCodeIDE should be developed with the following principles:
- Simplicity over complexity.
- Readability over cleverness.
- Reusability over duplication.
- Consistency across the codebase.
- Scalability for future growth.
- Security by design.
- Performance as a priority.
Every contribution should improve the project without introducing unnecessary complexity.
**3. Project Structure**
The project is divided into two primary applications:
UniCodeIDE/
├── frontend/
│
├── backend/
│
├── docs/
│
└── README.md
Each application should maintain its own dependencies and configuration files.
**4. Coding Standards**
**General Rules**
- Write clean and readable code.
- Use meaningful variable and function names.
- Avoid duplicated logic.
- Remove unused imports and files.
- Keep functions focused on one responsibility.
- Add comments only when necessary to explain complex logic.
**File Organization**
- One component or class per file where appropriate.
- Group related files together.
- Keep folder structures consistent.
**5. Naming Conventions**
**Files**
Use descriptive names.
Examples:
CourseCard.jsx
DashboardLayout.jsx
authService.js
examController.js
**Variables**
Use camelCase.
Example:
courseTitle
studentProgress
**Components**
Use PascalCase.
Example:
AssignmentTable
CloudIDE
TeacherDashboard
**Constants**
Use UPPER_SNAKE_CASE.
Example:
MAX_FILE_SIZE
API_BASE_URL
JWT_SECRET
**6. Git Workflow**
The project should use Git for version control.
Recommended workflow:
Clone Repository
↓
Create Feature Branch
↓
Develop Feature
↓
Commit Changes
↓
Push Branch
↓
Open Pull Request
↓
Code Review
↓
Merge into Main
Never commit directly to the main branch.
**7. Branch Strategy**
Recommended branches:
main
development
feature/authentication
feature/cloud-ide
feature/courses
feature/assignments
feature/exams
bugfix/login
bugfix/editor
hotfix/security
This structure keeps development organized and minimizes conflicts.
**8. Commit Message Convention**
Use clear and consistent commit messages.
Examples:
feat: add student dashboard
fix: resolve login validation issue
refactor: improve course service
docs: update API documentation
style: improve responsive layout
test: add authentication tests
Each commit should represent one logical change.
**9. Pull Request Process**
Every pull request should:
- Describe the purpose of the change.
- Reference related issues if applicable.
- Include screenshots for UI changes.
- Pass all tests.
- Be reviewed before merging.
Small, focused pull requests are preferred over large ones.
**10. Code Review Checklist**
Before approving code, reviewers should verify:
- Code follows project standards.
- No duplicated logic.
- Naming is consistent.
- Proper error handling exists.
- Responsive design is maintained.
- Security considerations are addressed.
- Performance impact is acceptable.
- Documentation is updated if needed.
**11. Testing Guidelines**
Developers should test:
- User authentication.
- Form validation.
- API integration.
- Responsive layouts.
- Role-based access.
- CRUD operations.
- Cloud IDE functionality.
- Assignment and exam workflows.
Testing should be completed before code is merged.
**12. Environment Setup**
Required software:
- Node.js
- npm
- MongoDB
- Git
- Visual Studio Code (or another preferred editor)
Environment variables should be stored in .env files and never committed to the repository.
**13. Configuration Management**
Store configuration values separately from application code.
Examples include:
- Database connection string.
- JWT secret.
- Email credentials.
- Server port.
- File upload limits.
Configuration should be different for development, testing, and production environments.
**14. Security Best Practices**
Follow these security principles:
- Hash passwords before storage.
- Validate all user input.
- Protect sensitive routes.
- Use HTTPS in production.
- Restrict access based on user roles.
- Never expose secrets in client-side code.
- Keep dependencies updated.
Security should be reviewed regularly during development.
**15. Performance Guidelines**
Optimize the application by:
- Reducing unnecessary API requests.
- Using pagination for large datasets.
- Optimizing images and assets.
- Lazy loading large frontend modules.
- Indexing frequently queried database fields.
- Monitoring response times.
Performance improvements should be measured whenever possible.
**16. Documentation Standards**
Every significant feature should include documentation covering:
- Purpose
- Functionality
- API endpoints
- Dependencies
- Configuration
- Known limitations
Documentation should be updated whenever functionality changes.
**17. Issue Tracking**
Track work using issues.
Each issue should include:
- Title
- Description
- Priority
- Assigned developer
- Current status
- Related pull requests
This improves visibility and project management.
**18. Release Process**
Before releasing a new version:
- Complete feature development.
- Test all modules.
- Resolve known bugs.
- Update documentation.
- Review security.
- Verify deployment configuration.
- Create a release tag.
- Publish the release.
Every release should include release notes summarizing changes.
**19. Deployment Readiness Checklist**
Before deployment, confirm:
- All tests pass.
- Environment variables are configured.
- Database connection is working.
- File uploads function correctly.
- Authentication is working.
- Authorization is verified.
- API endpoints respond correctly.
- Logging is enabled.
- Documentation is updated.
**20. Future Improvements**
As UniCodeIDE grows, the development process may include:
- Automated testing pipelines.
- Continuous Integration (CI).
- Continuous Deployment (CD).
- Containerization with Docker.
- Kubernetes deployment.
- Monitoring dashboards.
- Automated security scanning.
- Performance benchmarking.
- Code quality analysis tools.
These enhancements can be introduced gradually as the platform evolves.
**📌**** Development Rules**
Every developer contributing to UniCodeIDE should follow these rules:
- Follow the established folder structure.
- Write modular and reusable code.
- Keep commits small and meaningful.
- Review code before merging.
- Maintain consistent naming conventions.
- Update documentation alongside code changes.
- Prioritize security and performance.
- Test thoroughly before submitting changes.
- Communicate changes clearly with the team.
- Treat the codebase as a shared responsibility.
**09**
**Deployment & Infrastructure Guide**
**Project Name:** UniCodeIDE
**Version:** 1.0
**Document Type:** Deployment & Infrastructure Guide
**Table of Contents**
- Introduction
- Deployment Objectives
- System Architecture
- Environment Setup
- Infrastructure Components
- Frontend Deployment
- Backend Deployment
- Database Deployment
- File Storage
- Environment Variables
- Domain & DNS
- SSL & HTTPS
- Backup Strategy
- Monitoring & Logging
- Performance Optimization
- Security Checklist
- Scaling Strategy
- Disaster Recovery
- Maintenance Plan
- Production Checklist
**1. Introduction**
This document defines how UniCodeIDE will be deployed and maintained in production. It outlines the recommended infrastructure, deployment process, security practices, backup strategy, monitoring, and scalability considerations to ensure a reliable and secure platform.
**2. Deployment Objectives**
The deployment should provide:
- High availability
- Reliable performance
- Secure communication
- Easy maintenance
- Scalable infrastructure
- Safe backups
- Continuous monitoring
**3. System Architecture**
Users
│
▼
Frontend (React)
│
▼
Backend API (Node.js)
│
┌─────────┴─────────┐
▼                   ▼
MongoDB Database     File Storage
│
▼
Real-Time Services
(Socket.IO)
Each layer has a dedicated responsibility, making the system easier to maintain and scale.
**4. Environment Setup**
Maintain separate environments for each stage of development:
- Development
- Testing
- Staging
- Production
Each environment should have its own configuration, environment variables, and database where appropriate.
**5. Infrastructure Components**
The production environment consists of:
- React frontend
- Node.js backend
- MongoDB database
- File storage
- Domain & SSL
- Logging service
- Backup system
- Monitoring tools
These components work together to deliver a stable application.
**6. Frontend Deployment**
The React application should:
- Build optimized production assets.
- Minify JavaScript and CSS.
- Compress static files.
- Enable browser caching.
- Support client-side routing.
- Deliver assets through a reliable hosting platform.
**7. Backend Deployment**
The backend should:
- Run in production mode.
- Use environment variables for configuration.
- Restart automatically if it crashes.
- Log errors for troubleshooting.
- Handle concurrent requests efficiently.
- Expose only necessary ports.
**8. Database Deployment**
MongoDB should:
- Require authentication.
- Restrict external access.
- Use indexes for frequently queried fields.
- Perform regular backups.
- Monitor storage usage and performance.
**9. File Storage**
The platform should store:
- Profile images
- Course thumbnails
- Study materials
- Assignment attachments
- Certificates
Files should be validated before storage and protected from unauthorized access.
**10. Environment Variables**
Sensitive configuration should never be hardcoded.
Examples include:
- Database connection string
- JWT secret
- Email credentials
- Server port
- File upload limits
- API keys (if added in the future)
Environment files should be excluded from version control.
**11. Domain & DNS**
A production deployment should include:
- Custom domain
- Proper DNS configuration
- HTTPS redirection
- Secure subdomain management (if required)
**12. SSL & HTTPS**
All communication between users and the platform should use HTTPS.
Benefits include:
- Encrypted communication
- Improved user trust
- Protection against data interception
- Better browser compatibility
**13. Backup Strategy**
Backups should include:
- MongoDB database
- Uploaded files
- Configuration files
- Deployment scripts
Backups should be performed regularly and tested for successful restoration.
**14. Monitoring & Logging**
The platform should monitor:
- Server availability
- API response times
- Database performance
- Failed login attempts
- Application errors
- Storage usage
Logs should help diagnose issues while protecting sensitive information.
**15. Performance Optimization**
Recommended practices:
- Enable response compression.
- Optimize database queries.
- Minimize API response sizes.
- Cache static assets.
- Lazy load frontend resources.
- Monitor slow requests.
Performance should be reviewed periodically as usage grows.
**16. Security Checklist**
Before deployment, verify:
- HTTPS is enabled.
- Environment variables are configured securely.
- Passwords are hashed.
- JWT authentication is functioning.
- Input validation is enforced.
- File uploads are validated.
- User roles are enforced.
- Database access is restricted.
**17. Scaling Strategy**
As UniCodeIDE grows, the platform should support:
- Additional application servers
- Database scaling
- Increased storage capacity
- Load balancing
- Separate services for intensive tasks
- Distributed real-time communication
Scalability should be planned before resource limits are reached.
**18. Disaster Recovery**
In the event of failures:
- Restore the latest verified backup.
- Verify database integrity.
- Restart backend services.
- Test API functionality.
- Confirm frontend availability.
- Notify administrators if required.
A documented recovery procedure reduces downtime.
**19. Maintenance Plan**
Regular maintenance should include:
- Dependency updates
- Security patches
- Database optimization
- Log cleanup
- Backup verification
- Performance reviews
- Infrastructure health checks
Planned maintenance should minimize disruption to users.
**20. Production Checklist**
Before every production release, confirm:
- Frontend builds successfully.
- Backend starts without errors.
- Database connectivity is verified.
- Environment variables are correct.
- File uploads function properly.
- Authentication and authorization work as expected.
- HTTPS is enabled.
- Backups have been completed.
- Documentation is updated.
**📌**** Deployment Guidelines**
All production deployments should follow these principles:
- Never deploy untested code.
- Keep production credentials secure.
- Monitor application health continuously.
- Maintain regular backups.
- Review logs after deployment.
- Test rollback procedures.
- Plan for future scalability.
- Document infrastructure changes.
**10**
**Project Roadmap & Future Scope**
**Project Name:** UniCodeIDE
**Version:** 1.0
**Document Type:** Roadmap & Future Scope
**Table of Contents**
- Introduction
- Project Vision
- Mission
- Project Goals
- Development Roadmap
- Development Phases
- Module Priorities
- Future Enhancements
- Challenges & Risks
- Success Metrics
- Long-Term Vision
- Conclusion
**1. Introduction**
This document outlines the future direction of UniCodeIDE. It describes the project's long-term vision, development roadmap, planned enhancements, and the milestones that will guide its evolution.
UniCodeIDE is intended to become more than just an online code editor. The goal is to build a complete programming education platform that simplifies learning, practical sessions, assignments, coding examinations, and academic management for universities.
**2. Project Vision**
To build a modern, secure, and scalable cloud-based programming education platform that enables universities to manage the entire programming learning process from a single application.
The platform aims to improve the experience of students, teachers, and university administrators by providing an integrated environment for learning, coding, assessment, and progress tracking.
**3. Mission**
Our mission is to eliminate the challenges caused by multiple software tools by providing a unified platform where programming education can be conducted efficiently through a web browser.
UniCodeIDE seeks to make programming education more accessible, organized, and engaging for educational institutions.
**4. Project Goals**
The primary goals of UniCodeIDE are:
- Simplify programming education.
- Provide a browser-based coding environment.
- Integrate learning management and coding tools.
- Reduce software installation and configuration issues.
- Support secure online coding examinations.
- Improve communication between teachers and students.
- Enable centralized academic management.
- Design a scalable platform that can grow with institutional needs.
**5. Development Roadmap**
**Phase 1 – Foundation**
- Project planning
- UI/UX design
- React frontend setup
- Express backend setup
- MongoDB database design
- Authentication system
**Phase 2 – Core Modules**
- User management
- University management
- Department management
- Subject management
- Course management
- Dashboard development
**Phase 3 – Learning Platform**
- Course lessons
- Study materials
- Video content
- Assignments
- Progress tracking
**Phase 4 – Cloud IDE**
- Monaco Editor integration
- File explorer
- Project management
- Code execution
- Auto-save
- Theme support
**Phase 5 – Coding Examinations**
- Online coding exams
- Timer management
- Auto submission
- Teacher monitoring
- Result generation
**Phase 6 – Reports & Analytics**
- Student performance reports
- Assignment reports
- Exam reports
- Department analytics
- University analytics
**Phase 7 – Deployment**
- Production deployment
- Security review
- Performance optimization
- Final testing
- Documentation updates
**6. Development Phases**
The project should be developed incrementally.
Each phase should:
- Be independently testable.
- Include documentation.
- Follow coding standards.
- Pass quality checks before moving to the next phase.
This approach reduces development risks and improves maintainability.
**7. Module Priorities**
**High Priority**
- Authentication
- User Management
- University Management
- Dashboard
- Courses
- Cloud IDE
- Assignments
- Coding Exams
**Medium Priority**
- Notifications
- Certificates
- Reports
- Attendance
- Progress Tracking
**Low Priority**
- Discussion Forums
- Messaging
- Placement Preparation
- Company Coding Challenges
- Mobile Application
**8. Future Enhancements**
The platform can be expanded with additional features, including:
**Artificial Intelligence**
- AI code suggestions
- AI code review
- AI debugging assistance
- Personalized learning recommendations
**Academic Features**
- Automatic plagiarism detection
- Interactive quizzes
- Peer code reviews
- Coding competitions
**Collaboration**
- Real-time collaborative coding
- Team projects
- Shared workspaces
- Live chat
**Communication**
- Video conferencing
- Live practical sessions
- Screen sharing
- Voice communication
**Placement Support**
- Coding interview practice
- Company assessments
- Resume building
- Skill analytics
**Mobile Platform**
- Android application
- iOS application
- Push notifications
- Offline study material
**9. Challenges & Risks**
Potential challenges include:
- Secure execution of user-submitted code.
- Preventing plagiarism during coding examinations.
- Managing real-time communication at scale.
- Handling large file uploads.
- Ensuring data privacy between universities.
- Maintaining performance as user numbers increase.
- Keeping dependencies updated and secure.
These risks should be reviewed throughout the project lifecycle.
**10. Success Metrics**
The success of UniCodeIDE can be measured by:
- Successful deployment in a university environment.
- Reduction in software installation issues.
- Faster assignment and examination management.
- Positive feedback from students and teachers.
- High platform availability.
- Stable application performance.
- Scalable architecture for future growth.
**11. Long-Term Vision**
In the long term, UniCodeIDE aims to become a comprehensive platform for programming education.
Future objectives include:
- Supporting multiple universities on a single platform.
- Expanding support for additional programming languages.
- Integrating AI-powered learning assistance.
- Providing industry-focused coding challenges.
- Supporting hybrid and remote programming education.
- Building an ecosystem that connects education with career development.
The platform should continue evolving to meet the changing needs of modern educational institutions.
**12. Conclusion**
UniCodeIDE is designed to address common challenges in programming education by combining a Cloud IDE and a Learning Management System into a single, unified platform.
By integrating course management, coding practice, assignments, examinations, and progress tracking, the platform simplifies academic workflows for students, teachers, and administrators.
The modular architecture, scalable design, and clear development roadmap provide a strong foundation for future enhancements. As new technologies emerge, UniCodeIDE can evolve to include advanced features such as AI-assisted learning, collaborative coding, and industry-focused assessments, ensuring that the platform remains relevant and valuable for educational institutions.
**13. General Development Rules**
The following rules apply to every part of the UniCodeIDE project.
**Architecture Rules**
- Follow the documented architecture throughout development.
- Do not introduce new architectural patterns without team approval.
- Keep modules independent and reusable.
- Avoid tightly coupled components and services.
- Maintain clear separation between frontend, backend, and database responsibilities.
**Code Quality Rules**
- Write clean, readable, and maintainable code.
- Avoid duplicate code.
- Use meaningful names for variables, functions, files, and folders.
- Remove unused imports, files, and dependencies.
- Keep functions focused on a single responsibility.
- Follow consistent formatting throughout the project.
**Security Rules**
- Never expose passwords, secrets, or API keys.
- Store sensitive configuration only in environment variables.
- Validate all user input.
- Implement authentication and authorization for protected resources.
- Follow the principle of least privilege for user permissions.
**Documentation Rules**
- Update documentation whenever a feature changes.
- Keep API documentation synchronized with implementation.
- Document important architectural decisions.
- Ensure diagrams and workflows reflect the current system.
**14. Project Assumptions**
This project is developed under the following assumptions:
- Users have access to a modern web browser.
- Universities have a stable internet connection.
- The platform is initially designed for programming education.
- Supported programming languages may expand in future releases.
- Cloud infrastructure may evolve as the user base grows.
- Future features will remain compatible with the existing architecture whenever possible.
**15. Project Constraints**
The following constraints apply during development:
- The frontend will use React.
- The backend will use Node.js and Express.js.
- MongoDB will be the primary database.
- Communication between frontend and backend will use the native Fetch API.
- JWT will be used for authentication.
- Socket.IO will handle real-time communication.
- Major architectural changes require documentation updates before implementation.
**16. Coding Ethics**
Every contributor should:
- Write original code.
- Respect open-source licenses.
- Avoid copying code without proper attribution.
- Maintain professional coding practices.
- Prioritize user privacy and security.
- Report known issues honestly rather than hiding them.
**17. AI-Assisted Development Policy**
UniCodeIDE may use AI-assisted development tools to improve productivity.
When AI tools are used:
- All generated code must be reviewed by a developer.
- AI-generated code should follow the project's architecture and coding standards.
- Generated code should be tested before integration.
- AI should assist development but should not replace engineering judgment.
- Documentation should accurately reflect the implemented functionality.
**18. Future Compatibility Statement**
The project is designed with extensibility in mind.
Future versions may include:
- Additional programming languages.
- AI-powered educational features.
- Third-party integrations.
- Mobile applications.
- Advanced analytics.
- Enterprise features.
New features should extend the existing architecture rather than replacing it wherever possible.
**19. Disclaimer**
UniCodeIDE is an academic software engineering project developed to demonstrate the design and implementation of a cloud-based programming education platform.
The current documentation represents the intended architecture, workflows, and planned functionality. Some features described in this documentation may be implemented in future development phases and may not be available in the initial release.
Technology choices, infrastructure, and implementation details may evolve during development as new requirements, technical considerations, or project constraints arise. Any significant changes should be documented and reviewed to maintain consistency across the project.
This documentation is intended to guide development and should be treated as a living document that is updated as the project progresses.
**20. Final Declaration**
We declare that the design, architecture, documentation, and implementation of UniCodeIDE will follow the engineering standards defined in this documentation.
Every feature, module, and enhancement should align with the project's objectives of maintainability, scalability, security, and usability.
All contributors are expected to follow these standards to ensure that UniCodeIDE remains a consistent, reliable, and professionally engineered software project.
**21. Document Version Control**

|  | 
| --- | --- |
| Version | Date | Description |
| 1.0 | Initial Release | First complete documentation set |
| 1.1 | Future | Minor improvements and corrections |
| 2.0 | Future | Major architectural or feature updates |


**22. Approval**
This document serves as the official reference for the UniCodeIDE project.
Any major changes to the architecture, database design, API structure, security model, or development standards should be reviewed, approved by the project team, and reflected in the documentation before implementation.