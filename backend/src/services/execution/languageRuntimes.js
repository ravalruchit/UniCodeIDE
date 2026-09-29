/**
 * Controlled Language Runtime Registry
 *
 * Defines runtime images, entry files, compile steps, execution commands,
 * and security constraints for all 10 supported execution languages:
 * 1. Python
 * 2. JavaScript
 * 3. TypeScript
 * 4. Java
 * 5. C
 * 6. C++
 * 7. C#
 * 8. Go
 * 9. Rust
 * 10. SQL (SQLite 3 / ANSI SQL)
 *
 * Extensible design: adding language #11-40 requires only registering a new runtime entry.
 * Clients CANNOT supply arbitrary shell commands or custom Docker images.
 */

import path from 'path';

export const LANGUAGE_RUNTIMES = {
  PYTHON: {
    language: 'PYTHON',
    displayName: 'Python (3.11)',
    aliases: ['py', 'python', 'python3'],
    fileExtensions: ['.py'],
    defaultEntryFile: 'main.py',
    monacoLanguageId: 'python',
    image: process.env.DOCKER_PYTHON_IMAGE || 'python:3.11-alpine',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['python3', '-u', entryFile],
    timeoutMs: 5000,
    memoryMb: 256,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: '#!/usr/bin/env python3\n\ndef main():\n    print("Hello UniCodeIDE")\n\nif __name__ == "__main__":\n    main()\n',
  },

  JAVASCRIPT: {
    language: 'JAVASCRIPT',
    displayName: 'JavaScript (Node 20)',
    aliases: ['js', 'node', 'javascript', 'mjs', 'cjs'],
    fileExtensions: ['.js', '.mjs', '.cjs'],
    defaultEntryFile: 'index.js',
    monacoLanguageId: 'javascript',
    image: process.env.DOCKER_NODE_IMAGE || 'node:20-alpine',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['node', entryFile],
    timeoutMs: 5000,
    memoryMb: 256,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: '// JavaScript Entry Point\nfunction main() {\n    console.log("Hello UniCodeIDE");\n}\n\nmain();\n',
  },

  TYPESCRIPT: {
    language: 'TYPESCRIPT',
    displayName: 'TypeScript (Node 20 / tsc)',
    aliases: ['ts', 'typescript'],
    fileExtensions: ['.ts'],
    defaultEntryFile: 'index.ts',
    monacoLanguageId: 'typescript',
    image: process.env.DOCKER_TYPESCRIPT_IMAGE || 'unicodeide-ts:latest',
    isCompiled: true,
    compileCommand: (entryFile) => ['tsc', entryFile, '--outDir', './dist'],
    runCommand: () => ['node', './dist/index.js'],
    timeoutMs: 7000,
    memoryMb: 384,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: false,
    defaultTemplate: '// TypeScript Entry Point\nfunction main(): void {\n    console.log("Hello UniCodeIDE");\n}\n\nmain();\n',
  },

  JAVA: {
    language: 'JAVA',
    displayName: 'Java (Eclipse Temurin 17)',
    aliases: ['java'],
    fileExtensions: ['.java'],
    defaultEntryFile: 'Solution.java',
    monacoLanguageId: 'java',
    image: process.env.DOCKER_JAVA_IMAGE || 'eclipse-temurin:17-jdk-alpine',
    isCompiled: true,
    compileCommand: (entryFile) => ['javac', entryFile],
    runCommand: (entryFile) => {
      const className = path.basename(entryFile, '.java');
      return ['java', className];
    },
    timeoutMs: 6000,
    memoryMb: 384,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello UniCodeIDE");\n    }\n}\n',
  },

  C: {
    language: 'C',
    displayName: 'C (GCC 14)',
    aliases: ['c'],
    fileExtensions: ['.c'],
    defaultEntryFile: 'main.c',
    monacoLanguageId: 'c',
    image: process.env.DOCKER_GCC_IMAGE || 'gcc:latest',
    isCompiled: true,
    compileCommand: (entryFile) => ['gcc', '-O2', entryFile, '-o', 'main'],
    runCommand: () => ['./main'],
    timeoutMs: 5000,
    memoryMb: 256,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: '#include <stdio.h>\n\nint main() {\n    printf("Hello UniCodeIDE\\n");\n    return 0;\n}\n',
  },

  CPP: {
    language: 'CPP',
    displayName: 'C++ (G++ 14)',
    aliases: ['cpp', 'c++', 'cc', 'cxx'],
    fileExtensions: ['.cpp', '.cc', '.cxx'],
    defaultEntryFile: 'main.cpp',
    monacoLanguageId: 'cpp',
    image: process.env.DOCKER_GCC_IMAGE || 'gcc:latest',
    isCompiled: true,
    compileCommand: (entryFile) => ['g++', '-O2', entryFile, '-o', 'main'],
    runCommand: () => ['./main'],
    timeoutMs: 5000,
    memoryMb: 256,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: '#include <iostream>\n\nint main() {\n    std::cout << "Hello UniCodeIDE" << std::endl;\n    return 0;\n}\n',
  },

  CSHARP: {
    language: 'CSHARP',
    displayName: 'C# (.NET 8.0)',
    aliases: ['csharp', 'c#', 'cs'],
    fileExtensions: ['.cs'],
    defaultEntryFile: 'Program.cs',
    monacoLanguageId: 'csharp',
    image: process.env.DOCKER_CSHARP_IMAGE || 'mcr.microsoft.com/dotnet/sdk:8.0-alpine',
    isCompiled: true,
    compileCommand: () => ['dotnet', 'build', '--configuration', 'Release', '-o', './bin', '--nologo'],
    runCommand: () => ['dotnet', './bin/unicodeide.dll'],
    timeoutMs: 8000,
    memoryMb: 512,
    cpuLimit: 1.5,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'using System;\n\nclass Program {\n    static void Main(string[] args) {\n        Console.WriteLine("Hello UniCodeIDE");\n    }\n}\n',
  },

  GO: {
    language: 'GO',
    displayName: 'Go (1.22)',
    aliases: ['go', 'golang'],
    fileExtensions: ['.go'],
    defaultEntryFile: 'main.go',
    monacoLanguageId: 'go',
    image: process.env.DOCKER_GO_IMAGE || 'golang:1.22-alpine',
    isCompiled: true,
    compileCommand: (entryFile) => ['go', 'build', '-o', 'program', entryFile],
    runCommand: () => ['./program'],
    timeoutMs: 25000,
    memoryMb: 512,
    cpuLimit: 1.5,
    pidsLimit: 256,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello UniCodeIDE")\n}\n',
  },

  RUST: {
    language: 'RUST',
    displayName: 'Rust (1.77)',
    aliases: ['rust', 'rs'],
    fileExtensions: ['.rs'],
    defaultEntryFile: 'main.rs',
    monacoLanguageId: 'rust',
    image: process.env.DOCKER_RUST_IMAGE || 'rust:1.77-alpine',
    isCompiled: true,
    compileCommand: (entryFile) => ['rustc', '-O', entryFile, '-o', 'program'],
    runCommand: () => ['./program'],
    timeoutMs: 8000,
    memoryMb: 384,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'fn main() {\n    println!("Hello UniCodeIDE");\n}\n',
  },

  SQL: {
    language: 'SQL',
    displayName: 'SQL (SQLite 3.x / ANSI)',
    dialect: 'SQLite 3 (ANSI SQL)',
    aliases: ['sql', 'sqlite', 'sqlite3'],
    fileExtensions: ['.sql'],
    defaultEntryFile: 'query.sql',
    monacoLanguageId: 'sql',
    image: process.env.DOCKER_SQL_IMAGE || 'python:3.11-alpine',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['python3', '-u', '_sql_runner.py', entryFile],
    timeoutMs: 5000,
    memoryMb: 256,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: false,
    defaultTemplate: '-- UniCodeIDE SQL Playground (SQLite 3 / ANSI SQL)\n-- Sample tables: students, courses, enrollments are pre-seeded in the sandbox.\n\nSELECT * FROM students;\n',
  },

  PHP: {
    language: 'PHP',
    displayName: 'PHP (8.2 CLI)',
    aliases: ['php'],
    fileExtensions: ['.php'],
    defaultEntryFile: 'main.php',
    monacoLanguageId: 'php',
    image: process.env.DOCKER_PHP_IMAGE || 'php:8.2-alpine',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['php', entryFile],
    timeoutMs: 5000,
    memoryMb: 256,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: '<?php\necho "Hello UniCodeIDE\\n";\n',
  },

  RUBY: {
    language: 'RUBY',
    displayName: 'Ruby (3.2)',
    aliases: ['ruby', 'rb'],
    fileExtensions: ['.rb'],
    defaultEntryFile: 'main.rb',
    monacoLanguageId: 'ruby',
    image: process.env.DOCKER_RUBY_IMAGE || 'ruby:3.2-alpine',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['ruby', entryFile],
    timeoutMs: 5000,
    memoryMb: 256,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'puts "Hello UniCodeIDE"\n',
  },

  KOTLIN: {
    language: 'KOTLIN',
    displayName: 'Kotlin (JVM)',
    aliases: ['kotlin', 'kt'],
    fileExtensions: ['.kt'],
    defaultEntryFile: 'Main.kt',
    monacoLanguageId: 'kotlin',
    image: process.env.DOCKER_KOTLIN_IMAGE || 'zenika/alpine-kotlin:latest',
    isCompiled: true,
    compileCommand: (entryFile) => ['kotlinc', entryFile, '-d', '.'],
    runCommand: (entryFile) => ['kotlin', path.basename(entryFile, '.kt') + 'Kt'],
    timeoutMs: 25000,
    memoryMb: 512,
    cpuLimit: 1.0,
    pidsLimit: 128,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'fun main() {\n    println("Hello UniCodeIDE")\n}\n',
  },

  SWIFT: {
    language: 'SWIFT',
    displayName: 'Swift (5.9 Linux)',
    aliases: ['swift'],
    fileExtensions: ['.swift'],
    defaultEntryFile: 'main.swift',
    monacoLanguageId: 'swift',
    image: process.env.DOCKER_SWIFT_IMAGE || 'swift:latest',
    isCompiled: true,
    compileCommand: (entryFile) => ['swiftc', entryFile, '-o', 'main'],
    runCommand: () => ['./main'],
    timeoutMs: 20000,
    memoryMb: 512,
    cpuLimit: 1.0,
    pidsLimit: 128,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'print("Hello UniCodeIDE")\n',
  },

  DART: {
    language: 'DART',
    displayName: 'Dart (3.x SDK)',
    aliases: ['dart'],
    fileExtensions: ['.dart'],
    defaultEntryFile: 'main.dart',
    monacoLanguageId: 'dart',
    image: process.env.DOCKER_DART_IMAGE || 'dart:stable',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['dart', 'run', entryFile],
    timeoutMs: 8000,
    memoryMb: 384,
    cpuLimit: 1.0,
    pidsLimit: 128,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'void main() {\n  print("Hello UniCodeIDE");\n}\n',
  },

  R: {
    language: 'R',
    displayName: 'R (GNU Rscript)',
    aliases: ['r', 'rscript'],
    fileExtensions: ['.R', '.r'],
    defaultEntryFile: 'main.R',
    monacoLanguageId: 'r',
    image: process.env.DOCKER_R_IMAGE || 'r-base:latest',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['Rscript', entryFile],
    timeoutMs: 8000,
    memoryMb: 384,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'cat("Hello UniCodeIDE\\n")\n',
  },

  BASH: {
    language: 'BASH',
    displayName: 'Bash / Shell (5.2)',
    aliases: ['bash', 'sh', 'shell'],
    fileExtensions: ['.sh', '.bash'],
    defaultEntryFile: 'main.sh',
    monacoLanguageId: 'shell',
    image: process.env.DOCKER_BASH_IMAGE || 'bash:latest',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['bash', entryFile],
    timeoutMs: 5000,
    memoryMb: 256,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: '#!/usr/bin/env bash\necho "Hello UniCodeIDE"\n',
  },

  SCALA: {
    language: 'SCALA',
    displayName: 'Scala (3.x Scala CLI)',
    aliases: ['scala', 'sc'],
    fileExtensions: ['.scala'],
    defaultEntryFile: 'Main.scala',
    monacoLanguageId: 'scala',
    image: process.env.DOCKER_SCALA_IMAGE || 'virtuslab/scala-cli:latest',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['run', '--server=false', entryFile],
    timeoutMs: 25000,
    memoryMb: 512,
    cpuLimit: 1.0,
    pidsLimit: 128,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: '@main def main(): Unit = {\n  println("Hello UniCodeIDE")\n}\n',
  },

  LUA: {
    language: 'LUA',
    displayName: 'Lua (5.4)',
    aliases: ['lua'],
    fileExtensions: ['.lua'],
    defaultEntryFile: 'main.lua',
    monacoLanguageId: 'lua',
    image: process.env.DOCKER_LUA_IMAGE || 'nickblah/lua:5.4-alpine',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['lua', entryFile],
    timeoutMs: 5000,
    memoryMb: 256,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'print("Hello UniCodeIDE")\n',
  },

  PERL: {
    language: 'PERL',
    displayName: 'Perl (5.38)',
    aliases: ['perl', 'pl'],
    fileExtensions: ['.pl', '.pm'],
    defaultEntryFile: 'main.pl',
    monacoLanguageId: 'perl',
    image: process.env.DOCKER_PERL_IMAGE || 'perl:slim',
    isCompiled: false,
    compileCommand: null,
    runCommand: (entryFile) => ['perl', entryFile],
    timeoutMs: 5000,
    memoryMb: 256,
    cpuLimit: 1.0,
    pidsLimit: 64,
    outputLimitBytes: 65536,
    supportedInputMode: 'STDIN',
    supportsGrading: true,
    supportsInteractive: true,
    defaultTemplate: 'print "Hello UniCodeIDE\\n";\n',
  },
};

/**
 * Normalized canonical language ID from string or alias
 */
export function normalizeLanguage(lang = '') {
  if (!lang || typeof lang !== 'string') return null;
  const upper = lang.trim().toUpperCase();
  if (LANGUAGE_RUNTIMES[upper]) return upper;

  const lower = lang.trim().toLowerCase();
  for (const [key, runtime] of Object.entries(LANGUAGE_RUNTIMES)) {
    if (runtime.aliases && runtime.aliases.includes(lower)) {
      return key;
    }
  }
  return null;
}

/**
 * Detects programming language runtime from filename / path
 */
export function detectLanguageFromPath(filePath) {
  if (!filePath || typeof filePath !== 'string') return null;
  const ext = path.extname(filePath).toLowerCase();

  for (const [key, runtime] of Object.entries(LANGUAGE_RUNTIMES)) {
    if (runtime.fileExtensions.includes(ext)) {
      return key;
    }
  }
  return null;
}

/**
 * Resolves the primary execution file from files array or returns default
 */
export function resolveEntryFile(files = [], language) {
  const normLang = normalizeLanguage(language);
  const runtime = normLang ? LANGUAGE_RUNTIMES[normLang] : null;
  if (!runtime) {
    throw new Error(`Unsupported programming language: ${language}`);
  }

  // 1. Look for file marked as isEntry
  const explicitEntry = files.find((f) => f.isEntry);
  if (explicitEntry) return explicitEntry.path;

  // 2. Look for default file name for this runtime
  const defaultEntry = files.find((f) => f.path === runtime.defaultEntryFile);
  if (defaultEntry) return defaultEntry.path;

  // 3. Look for any file with matching extension
  const matchingExt = files.find((f) =>
    runtime.fileExtensions.some((ext) => f.path.endsWith(ext))
  );
  if (matchingExt) return matchingExt.path;

  return runtime.defaultEntryFile;
}

/**
 * Validates if the language is supported
 */
export function isLanguageSupported(language) {
  const norm = normalizeLanguage(language);
  return Boolean(norm && LANGUAGE_RUNTIMES[norm]);
}

/**
 * Gets all supported language IDs
 */
export function getSupportedLanguages() {
  return Object.keys(LANGUAGE_RUNTIMES);
}

/**
 * Gets language catalog metadata for API/client consumers
 */
export function getLanguageCatalog() {
  return Object.values(LANGUAGE_RUNTIMES).map((r) => ({
    id: r.language,
    displayName: r.displayName,
    fileExtension: r.fileExtensions[0],
    defaultEntryFile: r.defaultEntryFile,
    monacoLanguageId: r.monacoLanguageId,
    isCompiled: r.isCompiled,
    dialect: r.dialect || null,
  }));
}
