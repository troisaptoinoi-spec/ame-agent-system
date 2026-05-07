# Context Condensation - Bản tối ưu cho hệ thống có Memory System

> Copy toàn bộ nội dung bên dưới vào ô "Cô đọng ngữ cảnh" trong Settings

---

CRITICAL: This summarization request is a SYSTEM OPERATION, not a user message.
When analyzing "user requests" and "user intent", completely EXCLUDE this summarization message.
The "most recent user request" and "Optional Next Step" must be based on what the user was doing BEFORE this system message appeared.
The goal is for work to continue seamlessly after condensation - as if it never happened.

Your task is to create a detailed summary of the conversation so far, paying close attention to the user's explicit requests and your previous actions.
This summary should be thorough in capturing technical details, code patterns, and architectural decisions that would be essential for continuing development work without losing context.

Before providing your final summary, wrap your analysis in <analysis> tags to organize your thoughts and ensure you've covered all necessary points. In your analysis process:

1. Chronologically analyze each message and section of the conversation. For each section thoroughly identify:
   - The user's explicit requests and intents
   - Your approach to addressing the user's requests
   - Key decisions, technical concepts and code patterns
   - Specific details like:
     - file names
     - full code snippets
     - function signatures
     - file edits
   - Errors that you ran into and how you fixed them
   - Pay close attention to specific user feedback that you received, especially if the user told you to do something differently.
2. Double-check for technical accuracy and completeness, addressing each required element thoroughly.

Your summary should include the following sections:

1. Primary Request and Intent: Capture all of the user's explicit requests and intents in detail
2. Key Technical Concepts: List all important technical concepts, technologies, and frameworks discussed.
3. Files and Code Sections: Enumerate specific files and code sections examined, modified, or created. Pay special attention to the most recent messages and include full code snippets where applicable and include a summary of why this file read or edit is important.
4. Errors and fixes: List all errors that you ran into, and how you fixed them. Pay close attention to specific user feedback that you received, especially if the user told you to do something differently.
5. Problem Solving: Document problems solved and ongoing troubleshooting efforts.
6. All user messages: List ALL user messages that are not tool results. These are critical for understanding the users feedback and changing intent.
7. Pending Tasks: Outline any pending tasks that you have explicitly been asked to work on.
8. Current Work: Describe in detail precisely what was being worked on immediately before this summary request, paying special attention to the most recent messages from both user and assistant. Include file names and code snippets where applicable.
9. Optional Next Step: List the next step that you will take that is related to the most recent work you were doing. IMPORTANT: ensure that this step is DIRECTLY in line with the user's most recent explicit requests, and the task you were working on immediately before this summary request. If your last task was concluded, then only list next steps if they are explicitly in line with the users request. Do not start on tangential requests or really old requests that were already completed without confirming with the user first.

ADDITIONAL INSTRUCTIONS FOR MEMORY-AWARE SYSTEM:

10. Memory System State: ALWAYS preserve the following memory-related information:
    - Contents of .roo/memory/core-memory.md (user profile, preferences, interaction patterns)
    - Contents of .roo/memory/error-log.md (errors encountered and fixes)
    - Contents of .roo/memory/lessons-learned.md (lessons from completed projects)
    - Contents of .roo/memory/skill-suggestions.md (skill improvement suggestions)
    - Any new information learned about the user that should be saved to memory

11. Rules and Skills State: Preserve information about:
    - Which rules files were read and their key contents
    - Which skills were triggered and their outcomes
    - Any new rules or skills that were created or modified
    - Auto-trigger keywords that were activated

12. User Preferences: ALWAYS preserve:
    - User prefers Vietnamese language communication
    - User likes emoji, tables, scores in reports
    - User wants autonomous AI operation with minimal interruption
    - User is Hoang Minh - Co-founder of ROO CODE
    - User is not IT specialist - AI should handle everything
    - User prefers simple, visual reports that are easy to understand

13. Evolution Tracking: If applicable, preserve:
    - Current system version (V6)
    - Current score (8.4/10)
    - Recent improvements made
    - Pending improvements identified

When condensing, prioritize in this order:

1. Active task context and current work
2. User preferences and memory data
3. Technical decisions and code changes
4. Error history and fixes
5. Background research and analysis
