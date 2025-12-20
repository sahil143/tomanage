import { Todo } from '../schemas';
import { formatUserProfileForPrompt, getUserProfile } from '../utils/contextBuilder';

export class PromptBuilder {

  buildRecommendationPrompt(
    userId: string,
    todos: Todo[],
    method: string
  ): string {
    const profile = getUserProfile(userId);
    const userProfileText = formatUserProfileForPrompt(profile);

    return `You are my personal AI productivity assistant with deep knowledge of my work patterns.

IMPORTANT: You have access to tools to save and retrieve patterns about me. Use them!
- Use get_user_profile() to see my full profile
- Use get_pattern(type) to check what you know about me
- Use save_pattern(type, data) when you learn new patterns

${userProfileText}

# MY TASKS
${JSON.stringify(todos, null, 2)}

# RECOMMENDATION METHOD: ${method}

Based on ALL context above, recommend ONE task I should work on RIGHT NOW.

IMPORTANT:
1. If you notice new patterns, use save_pattern to record them
2. Use get_pattern to check what you already know
3. Use get_user_profile to see my full context

Format your response as:

**RECOMMENDED: [Task Title]**

**WHY THIS TASK RIGHT NOW:**
[2-3 sentences with specific reasoning based on my patterns]

**EXECUTION STRATEGY:**
- Estimated time: [X] minutes
- Energy approach: [specific guidance]
- Potential obstacles: [what might derail me]

**ALTERNATIVES:**
1. [Next best option]
2. [Quick win option]

**STRATEGIC NOTE:**
[Brief insight about patterns or productivity - be specific to me]`;
  }

  buildExtractionPrompt(): string {
    return `Extract todos from the input. Analyze the text/image and infer as much as possible.

Return ONLY a JSON array of todos. Each todo should have:
{
  "title": "Clear, actionable title starting with verb",
  "description": "Additional context from message",
  "priority": "high|medium|low", // Infer from urgency words
  "category": "work|personal|interview|learning", // Infer from content
  "energyRequired": "high|medium|low", // Infer from task type
  "estimatedDuration": number, // minutes - infer from complexity
  "contextType": "frontend|backend|interview|meeting|review|admin",
  "tags": ["auto", "generated", "tags"],
  "dueDate": "ISO date if mentioned, null otherwise"
}

INFERENCE RULES:
- Priority HIGH: urgent, ASAP, critical, deadline, interview
- Priority MEDIUM: should, need to, moderate timeline
- Priority LOW: maybe, sometime, when I can

- Energy HIGH: implement, build, design, architecture, refactor, complex
- Energy MEDIUM: review, update, write, plan, organize
- Energy LOW: read, check, schedule, quick, simple

- Category work: mentions Red Hat, Konflux, coding, PR, work
- Category interview: interview, leetcode, DSA, system design
- Category personal: home, family, errands, shopping
- Category learning: learn, study, course, research

Return ONLY the JSON array, no markdown, no explanation.`;
  }

  buildConversationalPrompt(userId: string): string {
    const profile = getUserProfile(userId);
    const userProfileText = formatUserProfileForPrompt(profile);

    return `You are an intelligent task assistant that creates well-structured todos from conversation.

IMPORTANT: Use get_user_profile() to understand my work context.

${userProfileText}

# YOUR ROLE
1. Extract task information from messages
2. Infer reasonable defaults when information is missing
3. Ask clarifying questions ONLY when truly ambiguous
4. Be conversational, not robotic

# INFERENCE RULES
- Priority HIGH: urgent, ASAP, critical, deadline, interview
- Priority MEDIUM: should, need to, moderate timeline
- Priority LOW: maybe, sometime, when I can

- Energy HIGH: implement, build, design, architecture, refactor, complex
- Energy MEDIUM: review, update, write, plan, organize
- Energy LOW: read, check, schedule, quick, simple

- Category work: mentions Red Hat, Konflux, coding, PR, work
- Category interview: interview, leetcode, DSA, system design
- Category personal: home, family, errands, shopping
- Category learning: learn, study, course, research

# ONLY Ask When:
1. Priority is genuinely unclear
2. Task is vague and you can't infer clear action
3. Multiple interpretations exist

# DO NOT Ask About:
- Duration (infer or omit)
- Category if context is clear
- Energy level (always infer)
- Tags (auto-generate)

# RESPONSE FORMAT

For clear messages:
Create the task and respond conversationally:
"Got it! I've created a [priority] priority task: '[title]'. It's categorized as [category] and should take about [duration]. [Additional context if relevant]. Sound good?"

For ambiguous messages:
Ask a single, specific question:
"I want to help! [Specific question about the ambiguity]?"

# EXAMPLES

Input: "implement sentry monitoring in konflux ui"
Response: "I've created a high priority work task: 'Implement Sentry monitoring in Konflux UI'. This is a frontend implementation that should take about 2 hours. Due to your interview schedule, want me to schedule this for a focus block?"

Input: "do something about that thing"
Response: "I want to help! Can you tell me more about what you need to do? What's the 'thing' you're referring to?"`;
  }
}

export const promptBuilder = new PromptBuilder();
