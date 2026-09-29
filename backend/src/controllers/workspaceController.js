import { Workspace, detectFileLanguage } from '../models/Workspace.js';
import { Assignment } from '../models/Assignment.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';

// Configuration Limits
const MAX_FILES = 50;
const MAX_FILE_SIZE_BYTES = 512 * 1024; // 512 KB
const MAX_TOTAL_WORKSPACE_BYTES = 5 * 1024 * 1024; // 5 MB

const getEntryFileName = (language = 'PYTHON') => {
  switch (language) {
    case 'PYTHON':
      return 'main.py';
    case 'JAVASCRIPT':
      return 'index.js';
    case 'TYPESCRIPT':
      return 'index.ts';
    case 'JAVA':
      return 'Solution.java';
    case 'CPP':
      return 'main.cpp';
    case 'C':
      return 'main.c';
    case 'CSHARP':
      return 'Program.cs';
    case 'GO':
      return 'main.go';
    case 'RUST':
      return 'main.rs';
    case 'SQL':
      return 'query.sql';
    default:
      return 'main.py';
  }
};

const getDefaultTemplate = (language = 'PYTHON') => {
  switch (language) {
    case 'PYTHON':
      return '#!/usr/bin/env python3\n\ndef main():\n    print("Hello from UniCodeIDE Cloud Workspace!")\n\nif __name__ == "__main__":\n    main()\n';
    case 'JAVASCRIPT':
      return '// JavaScript Entry Point\nfunction main() {\n    console.log("Hello from UniCodeIDE Cloud Workspace!");\n}\n\nmain();\n';
    case 'TYPESCRIPT':
      return '// TypeScript Entry Point\nfunction main(): void {\n    console.log("Hello from UniCodeIDE Cloud Workspace!");\n}\n\nmain();\n';
    case 'JAVA':
      return 'public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello from UniCodeIDE Cloud Workspace!");\n    }\n}\n';
    case 'CPP':
      return '#include <iostream>\n\nint main() {\n    std::cout << "Hello from UniCodeIDE Cloud Workspace!" << std::endl;\n    return 0;\n}\n';
    case 'C':
      return '#include <stdio.h>\n\nint main() {\n    printf("Hello from UniCodeIDE Cloud Workspace!\\n");\n    return 0;\n}\n';
    case 'CSHARP':
      return 'using System;\n\nclass Program {\n    static void Main(string[] args) {\n        Console.WriteLine("Hello from UniCodeIDE Cloud Workspace!");\n    }\n}\n';
    case 'GO':
      return 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from UniCodeIDE Cloud Workspace!")\n}\n';
    case 'RUST':
      return 'fn main() {\n    println!("Hello from UniCodeIDE Cloud Workspace!");\n}\n';
    case 'SQL':
      return '-- UniCodeIDE SQL Playground (SQLite 3.x / ANSI SQL)\nSELECT "Hello from UniCodeIDE Cloud Workspace!" AS message;\n';
    default:
      return '# Entry file\n';
  }
};

const sanitizeVirtualPath = (rawPath = '') => {
  if (typeof rawPath !== 'string') return null;
  // Replace backslashes with forward slashes
  let normalized = rawPath.replace(/\\/g, '/').trim();
  // Strip leading and trailing slashes
  normalized = normalized.replace(/^\/+|\/+$/g, '');

  // Reject directory traversal attempts or invalid characters
  if (normalized.includes('..') || normalized.includes('://')) {
    return null;
  }
  // Allow alphanumeric, underscores, hyphens, dots, and directory forward slashes
  const validPattern = /^[a-zA-Z0-9_\-\.\/]+$/;
  if (!validPattern.test(normalized)) {
    return null;
  }
  return normalized;
};

export const getWorkspaces = async (req, res) => {
  try {
    const universityId =
      req.user.role === 'SUPER_ADMIN' && req.query.universityId
        ? req.query.universityId
        : req.user.universityId?._id || req.user.universityId;

    const filter = { universityId, status: 'ACTIVE' };

    // Students only see their own workspaces and never see EXAM workspaces unless requested
    if (req.user.role === 'STUDENT') {
      filter.ownerId = req.user._id || req.user.id;
      if (req.query.type) {
        filter.type = req.query.type;
      } else {
        filter.type = { $ne: 'EXAM' };
      }
    } else {
      if (req.query.ownerId) filter.ownerId = req.query.ownerId;
      if (req.query.courseId) filter.courseId = req.query.courseId;
      if (req.query.assignmentId) filter.assignmentId = req.query.assignmentId;
      if (req.query.type) filter.type = req.query.type;
    }

    const workspaces = await Workspace.find(filter)
      .select('-files.content') // Exclude file content in list view for performance
      .populate('courseId', 'title code')
      .populate('assignmentId', 'title totalMarks dueDate difficulty programmingLanguage')
      .populate('ownerId', 'name email studentId')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: workspaces.length,
      workspaces,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrCreatePracticeWorkspace = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const universityId = req.user.universityId?._id || req.user.universityId;

    let workspace = await Workspace.findOne({
      universityId,
      ownerId: studentId,
      type: 'PRACTICE',
      status: 'ACTIVE',
    }).populate('ownerId', 'name email studentId');

    if (workspace) {
      workspace.lastOpenedAt = new Date();
      await workspace.save();
      return res.json({
        success: true,
        workspace,
        isNew: false,
      });
    }

    // Default starter files for multi-language playground
    const defaultFiles = [
      {
        path: 'cal.js',
        name: 'cal.js',
        content: `// JavaScript Playground\nfunction calculateTotal(price, quantity) {\n  return price * quantity;\n}\n\nconst price = 250;\nconst quantity = 4;\nconst total = calculateTotal(price, quantity);\n\nconsole.log("Welcome to UniCodeIDE - IDE Workspace!");\nconsole.log("Total calculation:", total);\n`,
        language: 'javascript',
        size: 250,
        isEntry: true,
        updatedAt: new Date(),
      },
      {
        path: 'main.py',
        name: 'main.py',
        content: `# Python Playground\ndef main():\n    print("Welcome to UniCodeIDE - IDE Workspace!")\n    numbers = [1, 2, 3, 4, 5]\n    print("Computed squares:", [x**2 for x in numbers])\n\nif __name__ == "__main__":\n    main()\n`,
        language: 'python',
        size: 210,
        isEntry: false,
        updatedAt: new Date(),
      },
      {
        path: 'Solution.java',
        name: 'Solution.java',
        content: `// Java Playground\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Welcome to UniCodeIDE - IDE Workspace!");\n        System.out.println("Java 17 sandbox execution verified!");\n    }\n}\n`,
        language: 'java',
        size: 220,
        isEntry: false,
        updatedAt: new Date(),
      },
      {
        path: 'README.md',
        name: 'README.md',
        content: `# UniCodeIDE — IDE Workspace\n\nWelcome to your independent personal development environment!\n\n### Supported Language Engines\n- **JavaScript** (\`.js\`) — Node.js 20 Alpine Sandbox\n- **Python** (\`.py\`) — Python 3.11 Alpine Sandbox\n- **Java** (\`.java\`) — Eclipse Temurin OpenJDK 17 Sandbox\n- **C / C++** (\`.c\`, \`.cpp\`) — GCC 14 Sandbox\n- **TypeScript** (\`.ts\`) — TypeScript 5 + Node Sandbox\n\n### How to Run Code\n1. Open any code file in the editor tabs.\n2. Click the green **Run** button (or press \`Ctrl+Enter\`).\n3. The IDE automatically detects the file's language and executes it directly inside an isolated Docker sandbox.\n`,
        language: 'markdown',
        size: 550,
        isEntry: false,
        updatedAt: new Date(),
      },
    ];

    workspace = await Workspace.create({
      universityId,
      ownerId: studentId,
      name: 'IDE Workspace',
      type: 'PRACTICE',
      status: 'ACTIVE',
      language: 'JAVASCRIPT',
      files: defaultFiles,
      activeFilePath: 'cal.js',
      revision: 1,
      lastOpenedAt: new Date(),
      lastSavedAt: new Date(),
    });

    const populated = await Workspace.findById(workspace._id).populate('ownerId', 'name email studentId');
    return res.json({
      success: true,
      workspace: populated,
      isNew: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrCreateAssignmentWorkspace = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user._id || req.user.id;
    const universityId = req.user.universityId?._id || req.user.universityId;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Tenant check
    if (assignment.universityId.toString() !== universityId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized assignment access' });
    }

    // If student, verify active enrollment in course
    if (req.user.role === 'STUDENT') {
      const enrollment = await Enrollment.findOne({
        studentId,
        courseId: assignment.courseId,
        status: 'ACTIVE',
      });
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Must be actively enrolled in the course to open this assignment workspace',
        });
      }
    }

    // Check if workspace already exists for this student & assignment
    let workspace = await Workspace.findOne({
      universityId,
      ownerId: studentId,
      assignmentId,
      status: 'ACTIVE',
    })
      .populate('courseId', 'title code')
      .populate('assignmentId', 'title totalMarks passingMarks dueDate difficulty programmingLanguage starterCode instructions')
      .populate('ownerId', 'name email studentId');

    if (workspace) {
      workspace.lastOpenedAt = new Date();
      await workspace.save();
      return res.json({
        success: true,
        workspace,
        isNew: false,
      });
    }

    // If not found, create new assignment workspace
    const entryFileName = getEntryFileName(assignment.programmingLanguage);
    const entryContent = assignment.starterCode || getDefaultTemplate(assignment.programmingLanguage);
    const readmeContent = `# ${assignment.title}\n\n**Language:** ${assignment.programmingLanguage}\n**Difficulty:** ${assignment.difficulty}\n**Total Marks:** ${assignment.totalMarks}\n\n## Instructions\n${assignment.instructions || assignment.description || 'Complete the assignment solution in the entry file and save your work.'}\n`;

    const initialFiles = [
      {
        path: entryFileName,
        name: entryFileName,
        content: entryContent,
        language: detectFileLanguage(entryFileName),
        size: Buffer.byteLength(entryContent, 'utf8'),
        isEntry: true,
        updatedAt: new Date(),
      },
      {
        path: 'README.md',
        name: 'README.md',
        content: readmeContent,
        language: 'markdown',
        size: Buffer.byteLength(readmeContent, 'utf8'),
        isEntry: false,
        updatedAt: new Date(),
      },
    ];

    workspace = await Workspace.create({
      universityId,
      ownerId: studentId,
      courseId: assignment.courseId,
      assignmentId: assignment._id,
      name: `${assignment.title} Workspace`,
      type: 'ASSIGNMENT',
      status: 'ACTIVE',
      language: assignment.programmingLanguage,
      files: initialFiles,
      activeFilePath: entryFileName,
      revision: 1,
      lastOpenedAt: new Date(),
      lastSavedAt: new Date(),
    });

    const populated = await Workspace.findById(workspace._id)
      .populate('courseId', 'title code')
      .populate('assignmentId', 'title totalMarks passingMarks dueDate difficulty programmingLanguage starterCode instructions')
      .populate('ownerId', 'name email studentId');

    res.status(201).json({
      success: true,
      workspace: populated,
      isNew: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();

    const workspace = await Workspace.findById(id)
      .populate('courseId', 'title code')
      .populate('assignmentId', 'title totalMarks passingMarks dueDate difficulty programmingLanguage starterCode instructions maxAttempts allowLateSubmission')
      .populate('ownerId', 'name email studentId');

    if (!workspace || workspace.status === 'ARCHIVED') {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Tenant check
    if (workspace.universityId.toString() !== userUni && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized workspace access' });
    }

    // Ownership check for students
    if (req.user.role === 'STUDENT' && workspace.ownerId._id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this workspace' });
    }

    workspace.lastOpenedAt = new Date();
    await workspace.save();

    res.json({
      success: true,
      workspace,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    const { files, activeFilePath, settings, expectedRevision } = req.body;

    const workspace = await Workspace.findById(id);
    if (!workspace || workspace.status === 'ARCHIVED') {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Tenant check
    if (workspace.universityId.toString() !== userUni && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized workspace access' });
    }

    // Only workspace owner can modify files
    if (workspace.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the workspace owner can save changes to this project',
      });
    }

    // Revision conflict check (unless user explicitly confirmed forceOverwrite after conflict review)
    const { forceOverwrite } = req.body;
    if (!forceOverwrite && expectedRevision !== undefined && Number(expectedRevision) !== workspace.revision) {
      return res.status(409).json({
        success: false,
        code: 'WORKSPACE_REVISION_CONFLICT',
        conflict: true,
        message: 'Workspace revision conflict. This workspace was updated on another device or session. Please reload to sync the latest version.',
        currentRevision: workspace.revision,
        serverRevision: workspace.revision,
        lastSavedAt: workspace.lastSavedAt,
      });
    }

    // Validate files array
    if (!Array.isArray(files)) {
      return res.status(400).json({ success: false, message: 'Invalid files payload format' });
    }

    if (files.length > MAX_FILES) {
      return res.status(413).json({
        success: false,
        message: `Maximum allowed files (${MAX_FILES}) exceeded for this workspace`,
      });
    }

    let totalWorkspaceBytes = 0;
    const sanitizedFiles = [];
    const seenPaths = new Set();

    for (const f of files) {
      const sanitizedPath = sanitizeVirtualPath(f.path || f.name);
      if (!sanitizedPath) {
        return res.status(400).json({
          success: false,
          message: `Invalid or unsafe file path: "${f.path || f.name}". Traversal and special characters are prohibited.`,
        });
      }

      if (seenPaths.has(sanitizedPath)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate file path detected: "${sanitizedPath}"`,
        });
      }
      seenPaths.add(sanitizedPath);

      const content = typeof f.content === 'string' ? f.content : '';
      const sizeBytes = Buffer.byteLength(content, 'utf8');

      if (sizeBytes > MAX_FILE_SIZE_BYTES) {
        return res.status(413).json({
          success: false,
          message: `File "${sanitizedPath}" exceeds maximum allowed file size of ${MAX_FILE_SIZE_BYTES / 1024} KB`,
        });
      }

      totalWorkspaceBytes += sizeBytes;
      if (totalWorkspaceBytes > MAX_TOTAL_WORKSPACE_BYTES) {
        return res.status(413).json({
          success: false,
          message: `Total workspace size exceeds maximum quota of ${MAX_TOTAL_WORKSPACE_BYTES / (1024 * 1024)} MB`,
        });
      }

      const name = sanitizedPath.split('/').pop();
      sanitizedFiles.push({
        path: sanitizedPath,
        name,
        content,
        language: f.language || detectFileLanguage(sanitizedPath),
        size: sizeBytes,
        isEntry: !!f.isEntry,
        updatedAt: new Date(),
      });
    }

    workspace.files = sanitizedFiles;
    if (activeFilePath) {
      const cleanActive = sanitizeVirtualPath(activeFilePath);
      if (cleanActive && seenPaths.has(cleanActive)) {
        workspace.activeFilePath = cleanActive;
      }
    }
    if (settings && typeof settings === 'object') {
      workspace.settings = { ...workspace.settings, ...settings };
    }

    workspace.revision += 1;
    workspace.lastSavedAt = new Date();
    await workspace.save();

    res.json({
      success: true,
      message: 'Workspace saved successfully',
      revision: workspace.revision,
      lastSavedAt: workspace.lastSavedAt,
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        revision: workspace.revision,
        lastSavedAt: workspace.lastSavedAt,
        activeFilePath: workspace.activeFilePath,
        files: workspace.files,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetAssignmentWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const workspace = await Workspace.findById(id).populate('assignmentId');
    if (!workspace || workspace.status === 'ARCHIVED') {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (workspace.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only workspace owner can reset this workspace' });
    }

    if (!workspace.assignmentId) {
      return res.status(400).json({ success: false, message: 'Only assignment workspaces can be reset to starter code' });
    }

    const assignment = workspace.assignmentId;
    const entryFileName = getEntryFileName(assignment.programmingLanguage);
    const entryContent = assignment.starterCode || getDefaultTemplate(assignment.programmingLanguage);
    const readmeContent = `# ${assignment.title}\n\n**Language:** ${assignment.programmingLanguage}\n**Difficulty:** ${assignment.difficulty}\n\n## Instructions\n${assignment.instructions || assignment.description || ''}\n`;

    workspace.files = [
      {
        path: entryFileName,
        name: entryFileName,
        content: entryContent,
        language: detectFileLanguage(entryFileName),
        size: Buffer.byteLength(entryContent, 'utf8'),
        isEntry: true,
        updatedAt: new Date(),
      },
      {
        path: 'README.md',
        name: 'README.md',
        content: readmeContent,
        language: 'markdown',
        size: Buffer.byteLength(readmeContent, 'utf8'),
        isEntry: false,
        updatedAt: new Date(),
      },
    ];

    workspace.activeFilePath = entryFileName;
    workspace.revision += 1;
    workspace.lastSavedAt = new Date();
    await workspace.save();

    res.json({
      success: true,
      message: 'Workspace successfully reset to starter code',
      workspace,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (workspace.ownerId.toString() !== userId.toString() && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized workspace deletion' });
    }

    // Soft delete workspace to ensure student history and audit logs remain intact
    workspace.status = 'ARCHIVED';
    await workspace.save();

    res.json({
      success: true,
      message: 'Workspace archived successfully (historical submissions remain preserved)',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorkspaceSyncState = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();

    const workspace = await Workspace.findById(id).select(
      'revision lastSavedAt status files.path files.size updatedAt universityId ownerId name'
    );
    if (!workspace || workspace.status === 'ARCHIVED') {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (workspace.universityId.toString() !== userUni && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized workspace access' });
    }

    if (req.user.role === 'STUDENT' && workspace.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this workspace' });
    }

    res.json({
      success: true,
      syncState: {
        workspaceId: workspace._id,
        name: workspace.name,
        revision: workspace.revision,
        lastSavedAt: workspace.lastSavedAt,
        status: workspace.status,
        fileCount: workspace.files.length,
        filePaths: workspace.files.map((f) => f.path),
        updatedAt: workspace.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
