import dns from 'node:dns';
import mongoose from 'mongoose';
import { ENV } from './config/env.js';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore
}
import { University } from './models/University.js';
import { User, USER_ROLES } from './models/User.js';
import { Department } from './models/Department.js';
import { Course } from './models/Course.js';
import { Module } from './models/Module.js';
import { Lesson } from './models/Lesson.js';
import { Enrollment } from './models/Enrollment.js';
import { LessonProgress } from './models/LessonProgress.js';
import { Assignment } from './models/Assignment.js';
import { Submission } from './models/Submission.js';
import { Workspace } from './models/Workspace.js';

const seed = async () => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    // 1. Create or find default University tenant
    let university = await University.findOne({ code: 'MERIDIAN' });
    if (!university) {
      university = await University.create({
        name: 'Meridian Institute of Technology',
        code: 'MERIDIAN',
        email: 'registrar@meridian.edu',
        status: 'ACTIVE',
        plan: 'ENTERPRISE',
        settings: {
          maxStudents: 5000,
          allowStudentSelfSignup: true,
          ssoEnabled: true,
        },
      });
      console.log('[Seed] Created University: Meridian Institute of Technology (MERIDIAN)');
    }

    const rawPassword = 'password123';

    // 2. Seed Users
    const usersToSeed = [
      {
        name: 'Eleanor Vance',
        email: 'superadmin@unicodeide.edu',
        passwordHash: rawPassword,
        role: USER_ROLES.SUPER_ADMIN,
        universityId: null,
        department: 'Global Platform Administration',
        status: 'ACTIVE',
      },
      {
        name: 'Dr. Marcus Sterling',
        email: 'admin@meridian.edu',
        passwordHash: rawPassword,
        role: USER_ROLES.UNIVERSITY_ADMIN,
        universityId: university._id,
        department: 'Dean of Academic Operations',
        status: 'ACTIVE',
      },
      {
        name: 'Prof. Sarah Jenkins',
        email: 'teacher@meridian.edu',
        passwordHash: rawPassword,
        role: USER_ROLES.TEACHER,
        universityId: university._id,
        department: 'Computer Science & Engineering',
        status: 'ACTIVE',
      },
      {
        name: 'Dr. Alan Turing',
        email: 'alan@meridian.edu',
        passwordHash: rawPassword,
        role: USER_ROLES.TEACHER,
        universityId: university._id,
        department: 'Artificial Intelligence & Data Science',
        status: 'ACTIVE',
      },
      {
        name: 'Alex Rivera',
        email: 'student@meridian.edu',
        passwordHash: rawPassword,
        role: USER_ROLES.STUDENT,
        universityId: university._id,
        department: 'B.Tech CS - Year 3 (Batch 2026)',
        studentId: 'MIT-2024-8841',
        status: 'ACTIVE',
      },
      {
        name: 'Maya Lin',
        email: 'maya@meridian.edu',
        passwordHash: rawPassword,
        role: USER_ROLES.STUDENT,
        universityId: university._id,
        department: 'B.Tech CS - Year 2 (Batch 2027)',
        studentId: 'MIT-2025-1092',
        status: 'ACTIVE',
      },
    ];

    const seededUsers = {};
    for (const u of usersToSeed) {
      let user = await User.findOne({ email: u.email });
      if (user) {
        user.passwordHash = rawPassword;
        if (u.studentId) user.studentId = u.studentId;
        await user.save();
        seededUsers[u.email] = user;
        console.log(`[Seed] Updated user: ${u.email}`);
      } else {
        user = await User.create(u);
        seededUsers[u.email] = user;
        console.log(`[Seed] Created User: ${u.email} (${u.role})`);
      }
    }

    const teacher = seededUsers['teacher@meridian.edu'];
    const alan = seededUsers['alan@meridian.edu'];
    const student = seededUsers['student@meridian.edu'];

    // 3. Seed Departments
    const deptsToSeed = [
      {
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Focuses on computing theory, algorithms, cloud systems, and modern software development.',
        headOfDepartment: teacher._id,
      },
      {
        name: 'Artificial Intelligence & Data Science',
        code: 'AIDS',
        description: 'Covers neural networks, deep learning, NLP, statistical modeling, and data pipelines.',
        headOfDepartment: alan._id,
      },
      {
        name: 'Cybersecurity & Systems Engineering',
        code: 'CYBER',
        description: 'Explores defensive security, cryptosystems, reverse engineering, and threat mitigation.',
      },
    ];

    const seededDepts = {};
    for (const d of deptsToSeed) {
      let dept = await Department.findOne({ universityId: university._id, code: d.code });
      if (!dept) {
        dept = await Department.create({
          universityId: university._id,
          ...d,
        });
        console.log(`[Seed] Created Department: ${d.name} (${d.code})`);
      }
      seededDepts[d.code] = dept;
    }

    // 4. Seed Courses
    let cs101 = await Course.findOne({ universityId: university._id, code: 'CS101' });
    if (!cs101) {
      cs101 = await Course.create({
        universityId: university._id,
        departmentId: seededDepts['CSE']._id,
        instructors: [teacher._id],
        title: 'Introduction to Python & Algorithmic Thinking',
        code: 'CS101',
        description: 'A comprehensive foundational course exploring computational thinking, clean coding practices, and core computer science concepts with modern Python 3.12.',
        level: 'BEGINNER',
        semester: 'Fall',
        academicYear: '2026',
        credits: 4,
        duration: '14 Weeks',
        status: 'PUBLISHED',
        prerequisites: ['High School Mathematics'],
        syllabus: 'Module 1: Foundations\nModule 2: Data Structures\nModule 3: Object-Oriented Programming',
        createdBy: teacher._id,
      });
      console.log(`[Seed] Created Course: CS101`);
    }

    let cs201 = await Course.findOne({ universityId: university._id, code: 'CS201' });
    if (!cs201) {
      cs201 = await Course.create({
        universityId: university._id,
        departmentId: seededDepts['CSE']._id,
        instructors: [teacher._id],
        title: 'Data Structures & Algorithm Design',
        code: 'CS201',
        description: 'In-depth study of abstract data types, recursive strategies, search trees, graphs, dynamic programming, and asymptotic runtime analysis.',
        level: 'INTERMEDIATE',
        semester: 'Fall',
        academicYear: '2026',
        credits: 4,
        duration: '14 Weeks',
        status: 'PUBLISHED',
        prerequisites: ['CS101'],
        syllabus: 'Module 1: Asymptotic Analysis\nModule 2: Trees and Graphs\nModule 3: Dynamic Programming',
        createdBy: teacher._id,
      });
      console.log(`[Seed] Created Course: CS201`);
    }

    let ai301 = await Course.findOne({ universityId: university._id, code: 'AI301' });
    if (!ai301) {
      ai301 = await Course.create({
        universityId: university._id,
        departmentId: seededDepts['AIDS']._id,
        instructors: [alan._id],
        title: 'Deep Learning & Neural Network Architectures',
        code: 'AI301',
        description: 'Explore backpropagation, convolutional layers, Transformers, attention mechanisms, and PyTorch production deployments.',
        level: 'ADVANCED',
        semester: 'Spring',
        academicYear: '2027',
        credits: 3,
        duration: '12 Weeks',
        status: 'DRAFT',
        prerequisites: ['CS201', 'Linear Algebra'],
        syllabus: 'Module 1: Perceptrons\nModule 2: CNNs\nModule 3: Transformers',
        createdBy: alan._id,
      });
      console.log(`[Seed] Created Course: AI301 (Draft)`);
    }

    // 5. Seed Modules & Lessons for CS101
    let mod1 = await Module.findOne({ courseId: cs101._id, order: 0 });
    if (!mod1) {
      mod1 = await Module.create({
        courseId: cs101._id,
        universityId: university._id,
        title: 'Unit 1: Foundations of Modern Computing',
        description: 'Understand how computers process instructions, binary abstraction, and Python syntax foundations.',
        order: 0,
        status: 'ACTIVE',
      });

      // Lessons for Module 1
      const l1 = await Lesson.create({
        courseId: cs101._id,
        moduleId: mod1._id,
        universityId: university._id,
        title: 'Lesson 1: Welcome to UniCodeIDE & Computational Thinking',
        description: 'An orientation into how code translates to real-world software, IDE workflows, and algorithmic decomposition.',
        content: `### Welcome to UniCodeIDE

In this opening lesson, we explore how software engineers conceptualize problems before touching a single key on their keyboards.

#### What is Computational Thinking?
Computational thinking is an analytical method for breaking complex problems into smaller, manageable fragments that a computing machine can execute reliably:

1. **Decomposition:** Breaking a problem into sub-problems.
2. **Pattern Recognition:** Identifying recurring mechanisms.
3. **Abstraction:** Isolating essential logic while ignoring peripheral noise.
4. **Algorithm Design:** Authoring an unambiguous step-by-step resolution.

---

### Executing Your First Python Program

Python is an interpreted, high-level programming language engineered for human readability:

\`\`\`python
def greet_student(name: str) -> str:
    """Returns a personalized greeting for the student."""
    return f"Welcome to UniCodeIDE, {name}! Let's build the future."

message = greet_student("Alex")
print(message)
\`\`\`

#### Key Takeaway
Whenever you write code, your primary audience is fellow human engineers, with the compiler or interpreter being secondary. Keep your functions clean and purposeful.`,
        type: 'ARTICLE',
        duration: 15,
        order: 0,
        status: 'PUBLISHED',
        createdBy: teacher._id,
        resources: [
          {
            title: 'Official Python 3 Documentation',
            type: 'LINK',
            url: 'https://docs.python.org/3/',
          },
          {
            title: 'UniCodeIDE Keyboard Shortcuts Cheatsheet',
            type: 'DOCUMENT',
            url: '/docs/shortcuts',
          },
        ],
      });

      const l2 = await Lesson.create({
        courseId: cs101._id,
        moduleId: mod1._id,
        universityId: university._id,
        title: 'Lesson 2: Variables, Types & The Python Memory Model',
        description: 'Dive deep into dynamic typing, memory references, garbage collection, and primitives.',
        content: `### Variables and Dynamic Typing

In Python, variables are **names bound to objects in memory**, rather than fixed storage boxes.

\`\`\`python
# Primitive types
student_count = 42          # int
tuition_fee = 14500.50       # float
course_name = "CS101"        # str
is_enrolled = True           # bool

# Checking variable identities
a = [1, 2, 3]
b = a
b.append(4)
print(a) # Output: [1, 2, 3, 4] - both point to the same memory heap location!
\`\`\`

#### Invariance & Immutability
Strings, integers, and tuples are immutable in Python. Lists, dictionaries, and sets are mutable.`,
        type: 'CODE_EXAMPLE',
        duration: 20,
        order: 1,
        status: 'PUBLISHED',
        createdBy: teacher._id,
        resources: [
          {
            title: 'Python Memory Management Visualization',
            type: 'LINK',
            url: 'https://pythontutor.com',
          },
        ],
      });

      const l3 = await Lesson.create({
        courseId: cs101._id,
        moduleId: mod1._id,
        universityId: university._id,
        title: 'Lesson 3: Conditionals and Dynamic Control Flow',
        description: 'Master branch evaluation, boolean logic truth tables, and match statements.',
        content: `### Branching Logic in Python

Control flow governs the execution path of your algorithms based on dynamic conditions.

\`\`\`python
def evaluate_grade(score: float) -> str:
    if score >= 90:
        return "A (Distinction)"
    elif score >= 80:
        return "B (Merit)"
    elif score >= 70:
        return "C (Pass)"
    else:
        return "F (Resit Required)"

print(evaluate_grade(88.5))
\`\`\`
`,
        type: 'ARTICLE',
        duration: 15,
        order: 2,
        status: 'PUBLISHED',
        createdBy: teacher._id,
      });

      console.log(`[Seed] Created Module 1 and 3 Lessons for CS101`);

      // 6. Seed Module 2 for CS101
      const mod2 = await Module.create({
        courseId: cs101._id,
        universityId: university._id,
        title: 'Unit 2: Essential Collections & Data Structures',
        description: 'Lists, Tuples, Dictionaries, and Sets with time-complexity analysis.',
        order: 1,
        status: 'ACTIVE',
      });

      await Lesson.create({
        courseId: cs101._id,
        moduleId: mod2._id,
        universityId: university._id,
        title: 'Lesson 4: List Slicing, Comprehensions & Iterators',
        description: 'Writing expressive Pythonic code with list comprehensions and generator expressions.',
        content: `### Pythonic List Comprehensions

\`\`\`python
# Traditional approach
squares = []
for x in range(10):
    if x % 2 == 0:
        squares.append(x ** 2)

# Comprehension approach - faster and cleaner
clean_squares = [x ** 2 for x in range(10) if x % 2 == 0]
\`\`\``,
        type: 'CODE_EXAMPLE',
        duration: 25,
        order: 0,
        status: 'PUBLISHED',
        createdBy: teacher._id,
      });

      console.log(`[Seed] Created Module 2 and Lesson 4 for CS101`);

      // 7. Seed Student Enrollment & Initial Progress
      let enroll1 = await Enrollment.findOne({ studentId: student._id, courseId: cs101._id });
      if (!enroll1) {
        enroll1 = await Enrollment.create({
          universityId: university._id,
          studentId: student._id,
          courseId: cs101._id,
          status: 'ACTIVE',
          enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        });
        console.log(`[Seed] Enrolled student Alex Rivera in CS101`);
      }

      // Mark Lesson 1 and Lesson 2 as completed
      await LessonProgress.findOneAndUpdate(
        { studentId: student._id, lessonId: l1._id },
        {
          universityId: university._id,
          courseId: cs101._id,
          moduleId: mod1._id,
          completed: true,
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          lastOpenedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        { upsert: true }
      );

      await LessonProgress.findOneAndUpdate(
        { studentId: student._id, lessonId: l2._id },
        {
          universityId: university._id,
          courseId: cs101._id,
          moduleId: mod1._id,
          completed: true,
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          lastOpenedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        { upsert: true }
      );

      console.log(`[Seed] Recorded Lesson progress for Alex Rivera (Lessons 1 & 2 completed)`);
    }

    // Enroll in CS201 as well
    let enroll2 = await Enrollment.findOne({ studentId: student._id, courseId: cs201._id });
    if (!enroll2) {
      await Enrollment.create({
        universityId: university._id,
        studentId: student._id,
        courseId: cs201._id,
        status: 'ACTIVE',
        enrolledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });
      console.log(`[Seed] Enrolled student Alex Rivera in CS201`);
    }

    // 8. Seed Phase 4 Assignments
    let asg1 = await Assignment.findOne({ universityId: university._id, title: 'Assignment 01: Algorithmic Thinking & String Manipulation' });
    if (!asg1) {
      asg1 = await Assignment.create({
        universityId: university._id,
        courseId: cs101._id,
        moduleId: mod1._id,
        title: 'Assignment 01: Algorithmic Thinking & String Manipulation',
        description: 'Implement word-order reversal and palindrome verification with clean time and space complexity.',
        instructions: `### Assignment 01: String Reversal & Clean Algorithms

#### Objective
Author a Python function \`reverse_words_order(sentence: str) -> str\` that accepts a string of words separated by whitespace and reverses the order of the words while trimming extraneous leading or trailing spaces.

#### Function Signature
\`\`\`python
def reverse_words_order(sentence: str) -> str:
    """Reverses the words in a given sentence."""
    pass
\`\`\`

#### Example
- **Input:** \`"  hello world from unicodeide  "\`
- **Output:** \`"unicodeide from world hello"\`

#### Constraints
- String length $0 \\le N \\le 10^5$.
- Time Complexity: $O(N)$
- Auxiliary Space: $O(N)$`,
        type: 'CODING',
        programmingLanguage: 'PYTHON',
        difficulty: 'EASY',
        totalMarks: 100,
        passingMarks: 40,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'PUBLISHED',
        allowLateSubmission: true,
        latePenaltyPercent: 10,
        starterCode: `def reverse_words_order(sentence: str) -> str:
    # Your solution here
    words = sentence.strip().split()
    return " ".join(reversed(words))
`,
        maxAttempts: 3,
        testCases: [
          {
            name: 'Basic Reversal',
            input: '"hello world"',
            expectedOutput: '"world hello"',
            points: 25,
            isHidden: false,
          },
          {
            name: 'Extra Whitespaces',
            input: '"  the sky   is blue  "',
            expectedOutput: '"blue is sky the"',
            points: 25,
            isHidden: false,
          },
          {
            name: 'Single Word',
            input: '"python"',
            expectedOutput: '"python"',
            points: 25,
            isHidden: true,
          },
          {
            name: 'Empty String',
            input: '""',
            expectedOutput: '""',
            points: 25,
            isHidden: true,
          },
        ],
        createdBy: teacher._id,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });
      console.log(`[Seed] Created Assignment 01 for CS101`);
    }

    let asg2 = await Assignment.findOne({ universityId: university._id, title: 'Assignment 02: Dictionary Inversion & Frequency Counters' });
    if (!asg2) {
      asg2 = await Assignment.create({
        universityId: university._id,
        courseId: cs101._id,
        title: 'Assignment 02: Dictionary Inversion & Frequency Counters',
        description: 'Build robust token frequency counter and invert key-value mappings with duplicate grouping.',
        instructions: `### Assignment 02: Hash Map Inversion

#### Objective
Write a function \`invert_dictionary(d: dict) -> dict\` that takes a dictionary where values may be duplicated, and inverts it so that original values become keys, and original keys become lists of values.

#### Example
- **Input:** \`{"a": 1, "b": 2, "c": 1}\`
- **Output:** \`{1: ["a", "c"], 2: ["b"]}\``,
        type: 'CODING',
        programmingLanguage: 'PYTHON',
        difficulty: 'MEDIUM',
        totalMarks: 100,
        passingMarks: 50,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'PUBLISHED',
        allowLateSubmission: false,
        starterCode: `def invert_dictionary(d: dict) -> dict:
    inverted = {}
    for key, val in d.items():
        if val not in inverted:
            inverted[val] = []
        inverted[val].append(key)
    return inverted
`,
        maxAttempts: 2,
        createdBy: teacher._id,
        publishedAt: new Date(),
      });
      console.log(`[Seed] Created Assignment 02 for CS101`);
    }

    let asg3 = await Assignment.findOne({ universityId: university._id, title: 'Assignment 03: Object-Oriented Banking Ledger' });
    if (!asg3) {
      asg3 = await Assignment.create({
        universityId: university._id,
        courseId: cs101._id,
        title: 'Assignment 03: Object-Oriented Banking Ledger',
        description: 'Encapsulation, transaction rollback, and ledger auditing.',
        instructions: 'Author a BankAccount class with deposit, withdraw, and audit log capabilities.',
        type: 'CODING',
        programmingLanguage: 'PYTHON',
        difficulty: 'HARD',
        totalMarks: 100,
        passingMarks: 50,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'DRAFT',
        starterCode: `class BankAccount:\n    def __init__(self, initial_balance: float = 0.0):\n        self._balance = initial_balance\n`,
        createdBy: teacher._id,
      });
      console.log(`[Seed] Created Assignment 03 (Draft) for CS101`);
    }

    // 9. Seed Submissions & Evaluations
    // Alex Rivera submitted Assignment 1 (Attempt 1 - Evaluated by Teacher Sarah Jenkins)
    let sub1 = await Submission.findOne({ assignmentId: asg1._id, studentId: student._id });
    if (!sub1) {
      sub1 = await Submission.create({
        universityId: university._id,
        assignmentId: asg1._id,
        courseId: cs101._id,
        studentId: student._id,
        attemptNumber: 1,
        sourceCode: `def reverse_words_order(sentence: str) -> str:
    if not sentence:
        return ""
    words = sentence.strip().split()
    return " ".join(reversed(words))
`,
        programmingLanguage: 'PYTHON',
        status: 'EVALUATED',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isLate: false,
        score: 95,
        maxScore: 100,
        feedback: {
          general: 'Outstanding solution! Clean algorithmic decomposition with optimal O(N) runtime.',
          strengths: 'Effective use of strip() and reversed() generator to avoid redundant array copies.',
          improvements: 'Consider adding explicit type validation if input could be non-string in enterprise APIs.',
        },
        evaluatedBy: teacher._id,
        evaluatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      });
      console.log(`[Seed] Created evaluated submission for Alex Rivera on Assignment 01 (Score: 95/100)`);
    }

    // Alex Rivera has a DRAFT in progress for Assignment 2
    let sub2 = await Submission.findOne({ assignmentId: asg2._id, studentId: student._id });
    if (!sub2) {
      sub2 = await Submission.create({
        universityId: university._id,
        assignmentId: asg2._id,
        courseId: cs101._id,
        studentId: student._id,
        attemptNumber: 1,
        sourceCode: `def invert_dictionary(d: dict) -> dict:
    inverted = {}
    # Work in progress draft
    for k, v in d.items():
        inverted.setdefault(v, []).append(k)
    return inverted
`,
        programmingLanguage: 'PYTHON',
        status: 'DRAFT',
        maxScore: 100,
      });
      console.log(`[Seed] Created active draft for Alex Rivera on Assignment 02`);
    }

    // Maya Lin submitted Assignment 1 (Submitted, pending teacher evaluation)
    let maya = await User.findOne({ email: 'maya@meridian.edu' });
    if (maya) {
      // Ensure Maya is enrolled in CS101
      await Enrollment.findOneAndUpdate(
        { studentId: maya._id, courseId: cs101._id },
        { universityId: university._id, studentId: maya._id, courseId: cs101._id, status: 'ACTIVE' },
        { upsert: true }
      );

      let subMaya = await Submission.findOne({ assignmentId: asg1._id, studentId: maya._id });
      if (!subMaya) {
        await Submission.create({
          universityId: university._id,
          assignmentId: asg1._id,
          courseId: cs101._id,
          studentId: maya._id,
          attemptNumber: 1,
          sourceCode: `def reverse_words_order(sentence: str) -> str:
    tokens = sentence.split()
    return " ".join(tokens[::-1])
`,
          programmingLanguage: 'PYTHON',
          status: 'SUBMITTED',
          submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          isLate: false,
          maxScore: 100,
        });
        console.log(`[Seed] Created pending submission for Maya Lin on Assignment 01`);
      }
    }

    // ==========================================
    // PHASE 5: PERSISTENT CLOUD WORKSPACES
    // ==========================================
    console.log('[Seed] Seeding Phase 5 Persistent Cloud Workspaces...');

    // 1. Alex Rivera's Workspace for CS101 Assignment 2 (Dictionary Inversion)
    if (student && asg2) {
      await Workspace.findOneAndUpdate(
        { universityId: university._id, ownerId: student._id, assignmentId: asg2._id },
        {
          universityId: university._id,
          ownerId: student._id,
          courseId: cs101._id,
          assignmentId: asg2._id,
          name: 'Dictionary Inversion & Frequency Counter Workspace',
          type: 'ASSIGNMENT',
          status: 'ACTIVE',
          language: 'PYTHON',
          activeFilePath: 'main.py',
          revision: 4,
          lastOpenedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
          lastSavedAt: new Date(Date.now() - 30 * 60 * 1000),
          files: [
            {
              path: 'main.py',
              name: 'main.py',
              language: 'python',
              content: `from helpers import validate_dictionary, benchmark_inversion

def invert_dictionary(data: dict) -> dict:
    """
    Invert key-value mappings in a dictionary.
    Values become keys, and original keys are grouped in lists.
    """
    if not validate_dictionary(data):
        raise ValueError("Invalid dictionary structure")

    inverted = {}
    for key, value in data.items():
        if value not in inverted:
            inverted[value] = []
        inverted[value].append(key)
    
    return inverted

if __name__ == "__main__":
    sample_scores = {"Alex": "A", "Maya": "A", "Liam": "B", "Zoe": "A"}
    result = invert_dictionary(sample_scores)
    print("Inverted Distribution:", result)
`,
              size: 672,
              isEntry: true,
              updatedAt: new Date(),
            },
            {
              path: 'helpers.py',
              name: 'helpers.py',
              language: 'python',
              content: `import time

def validate_dictionary(d) -> bool:
    return isinstance(d, dict) and len(d) > 0

def benchmark_inversion(func, sample_data):
    start = time.perf_counter()
    res = func(sample_data)
    elapsed = time.perf_counter() - start
    return res, elapsed
`,
              size: 265,
              isEntry: false,
              updatedAt: new Date(),
            },
            {
              path: 'README.md',
              name: 'README.md',
              language: 'markdown',
              content: `# Dictionary Inversion & Frequency Counter

## Instructions
Write an efficient algorithm in Python to invert a mapping of keys to values.

### Constraints
- Handle duplicate values gracefully by collecting them into lists.
- Time Complexity: O(n)
- Space Complexity: O(n)
`,
              size: 278,
              isEntry: false,
              updatedAt: new Date(),
            },
          ],
        },
        { upsert: true, new: true }
      );
      console.log('[Seed] Created persistent workspace for Alex Rivera on Assignment 02');
    }

    // 2. Alex Rivera's Practice Workspace for CS201 (C++ Data Structures)
    if (student && cs201) {
      await Workspace.findOneAndUpdate(
        { universityId: university._id, ownerId: student._id, name: 'CS201 Data Structures Lab' },
        {
          universityId: university._id,
          ownerId: student._id,
          courseId: cs201._id,
          assignmentId: null,
          name: 'CS201 Data Structures Lab',
          type: 'COURSE',
          status: 'ACTIVE',
          language: 'CPP',
          activeFilePath: 'main.cpp',
          revision: 7,
          lastOpenedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          lastSavedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          files: [
            {
              path: 'main.cpp',
              name: 'main.cpp',
              language: 'cpp',
              content: `#include <iostream>
#include "LinkedList.hpp"

int main() {
    std::cout << "=== CS201 Data Structures Lab ===" << std::endl;
    LinkedList<int> list;
    list.append(10);
    list.append(20);
    list.append(30);
    list.print();
    return 0;
}
`,
              size: 245,
              isEntry: true,
              updatedAt: new Date(),
            },
            {
              path: 'LinkedList.hpp',
              name: 'LinkedList.hpp',
              language: 'cpp',
              content: `#pragma once
#include <iostream>

template <typename T>
class LinkedList {
private:
    struct Node {
        T data;
        Node* next;
        Node(T val) : data(val), next(nullptr) {}
    };
    Node* head;

public:
    LinkedList() : head(nullptr) {}
    
    void append(T val) {
        Node* newNode = new Node(val);
        if (!head) {
            head = newNode;
            return;
        }
        Node* temp = head;
        while (temp->next) temp = temp->next;
        temp->next = newNode;
    }

    void print() const {
        Node* curr = head;
        while (curr) {
            std::cout << curr->data << " -> ";
            curr = curr->next;
        }
        std::cout << "nullptr" << std::endl;
    }
};
`,
              size: 685,
              isEntry: false,
              updatedAt: new Date(),
            },
            {
              path: 'README.md',
              name: 'README.md',
              language: 'markdown',
              content: `# CS201 Data Structures Lab Practice Workspace
Personal student lab workspace for experimenting with templated linked lists and search trees.
`,
              size: 130,
              isEntry: false,
              updatedAt: new Date(),
            },
          ],
        },
        { upsert: true, new: true }
      );
      console.log('[Seed] Created persistent course practice workspace for Alex Rivera on CS201');
    }

    console.log('[Seed] All Phase 4 & Phase 5 data successfully seeded.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

seed();
