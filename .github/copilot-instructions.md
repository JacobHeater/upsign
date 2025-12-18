# Project Level Copilot Instructions

- When you're unsure of which set of instructions to follow, ask for clarification.
- When you're unsure of what I'm asking, please ask clarifying questions.
- Don't assume you understand the requirements; always seek clarification when in doubt.
- Keep communication concise and focused.
- Always follow SOLID principles in OOP.
- Always favor composition over inheritance.
- Always write unit tests for new functionality.
- Always ensure existing tests pass after making changes.
- Always use null coalescing and optional chaining to handle potential null/undefined values.
- Always favor immutability where possible.
- Always **check for circular dependencies** when adding or updating code.
- Aim for minimalism when making changes to existing code.

# Instructions for /api Directory

- When you're unsure of what I'm asking, please ask clarifying questions.
- When you believe there's a better way to do something, always suggest it.
- When writing new functions, always include spec files for them, and ensure all tests pass.
- When modifying existing code, update the corresponding spec files to cover the changes, and ensure all tests pass.
- When writing TypeScript types, always favor interfaces over types.
- When dealing with asynchronous operations, always use async/await syntax for better readability.
- Always optimize for minimal burden on code callers by writing simple abstractions.
- Always mock integrations in tests to ensure code reflects production behavior.
- Tests should alwyas include robust positive and negative tests cases, enen negative test cases that don't match expected types in TypeScript.
- Always favor early returns instead of complex control flows.
- Always ensure that functions do one thing and do it well, adhering to the Single Responsibility Principle.
- Always ensure that repository methods include all necessary relational data to prevent N+1 query issues.
- Always return full interface definitions in schema repositories, including all nested relations as needed.

# Instructions for /app Directory

- When adding new functionality, always ensure it aligns with the Next.js App Router conventions.
- When creating new components, always use TypeScript and Tailwind CSS for styling.
- Always write tests for new components and pages using Next.js best practices.
- Always ensure that ESLint rules are followed and the codebase remains clean.
- Always abstract api calls to the api lib.
- Always ensure that existing tests pass after making changes.
- Favor readability over one-line hacks and shortcuts.
