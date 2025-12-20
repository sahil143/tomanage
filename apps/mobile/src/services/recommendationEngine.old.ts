import { Todo } from '../types/todo';
import { UserContext, RecommendationMethod } from '../types/chat';
import { aiService } from './aiService';
import { contextBuilder } from './contextBuilder';

class RecommendationEngine {
  /**
   * Get recommendation based on method
   */
  async getRecommendation(
    todos: Todo[],
    method: RecommendationMethod
  ): Promise<string> {
    // Get current context
    const context = contextBuilder.getCurrentContext();

    // Enrich todos with computed fields
    const enrichedTodos = contextBuilder.enrichTodos(todos);

    // Route to appropriate strategy
    switch (method) {
      case 'smart':
        return this.smartRecommendation(enrichedTodos, context);
      case 'energy':
        return this.energyBasedRecommendation(enrichedTodos, context);
      case 'quick':
        return this.quickWinsRecommendation(enrichedTodos, context);
      case 'eisenhower':
        return this.eisenhowerRecommendation(enrichedTodos, context);
      case 'focus':
        return this.deepWorkRecommendation(enrichedTodos, context);
      default:
        throw new Error(`Unknown recommendation method: ${method}`);
    }
  }

  /**
   * Smart comprehensive recommendation
   */
  async smartRecommendation(
    todos: Todo[],
    context: UserContext
  ): Promise<string> {
    const incompleteTodos = todos.filter((todo) => !todo.completed);

    if (incompleteTodos.length === 0) {
      return "Great job! You have no incomplete tasks. Time to relax or plan your next goals.";
    }

    // Analyze workload
    const workload = contextBuilder.analyzeWorkload(todos);

    // Build comprehensive prompt
    const prompt = this.buildSmartPrompt(incompleteTodos, context, workload);

    try {
      const response = await aiService.callClaude([
        { type: 'text', text: prompt },
      ]);
      return response;
    } catch (error) {
      console.error('Failed to get smart recommendation:', error);
      return this.fallbackRecommendation(incompleteTodos, context);
    }
  }

  /**
   * Energy-based recommendation
   */
  async energyBasedRecommendation(
    todos: Todo[],
    context: UserContext
  ): Promise<string> {
    const incompleteTodos = todos.filter((todo) => !todo.completed);

    if (incompleteTodos.length === 0) {
      return "All tasks complete! Perfect time for a break.";
    }

    // Group by energy level
    const byEnergy = {
      low: incompleteTodos.filter((t) => t.energyRequired === 'low'),
      medium: incompleteTodos.filter((t) => t.energyRequired === 'medium'),
      high: incompleteTodos.filter((t) => t.energyRequired === 'high'),
    };

    const matchingTasks = byEnergy[context.energyLevel] || [];

    const prompt = `You are a productivity assistant helping match tasks to energy levels.

Current Context:
- Your Energy Level: ${context.energyLevel}
- Time: ${context.localTime} (${context.timeOfDay})
- Day: ${context.dayOfWeek}

Tasks matching your ${context.energyLevel} energy level (${matchingTasks.length} tasks):
${matchingTasks.map((t, i) => `${i + 1}. ${t.title} (${t.estimatedDuration} min, ${t.priority} priority)`).join('\n')}

Tasks requiring LOW energy (${byEnergy.low.length}):
${byEnergy.low.slice(0, 3).map((t) => `- ${t.title}`).join('\n') || 'None'}

Tasks requiring MEDIUM energy (${byEnergy.medium.length}):
${byEnergy.medium.slice(0, 3).map((t) => `- ${t.title}`).join('\n') || 'None'}

Tasks requiring HIGH energy (${byEnergy.high.length}):
${byEnergy.high.slice(0, 3).map((t) => `- ${t.title}`).join('\n') || 'None'}

Please provide:
1. RECOMMENDED TASK: Which task best matches the current ${context.energyLevel} energy level
2. WHY THIS TASK: Explain the energy match
3. ENERGY ADVICE: Tips for managing energy throughout the day
4. ALTERNATIVES: 1-2 backup options if the recommended task isn't feasible

Keep the tone friendly and motivating.`;

    try {
      return await aiService.callClaude([{ type: 'text', text: prompt }]);
    } catch (error) {
      return this.fallbackEnergyRecommendation(matchingTasks, context);
    }
  }

  /**
   * Quick wins recommendation
   */
  async quickWinsRecommendation(
    todos: Todo[],
    context: UserContext
  ): Promise<string> {
    const incompleteTodos = todos.filter((todo) => !todo.completed);

    // Filter for quick wins: ≤30 min, low/medium energy
    const quickWins = incompleteTodos
      .filter(
        (t) =>
          (t.estimatedDuration || 0) <= 30 &&
          (t.energyRequired === 'low' || t.energyRequired === 'medium')
      )
      .sort((a, b) => {
        // Prioritize by: high priority first, then shorter duration
        if (a.priority !== b.priority) {
          const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return (a.estimatedDuration || 30) - (b.estimatedDuration || 30);
      });

    if (quickWins.length === 0) {
      return "No quick wins available right now. All remaining tasks require more time or energy. Consider breaking down larger tasks into smaller chunks!";
    }

    const prompt = `You are a productivity coach helping the user build momentum with quick wins.

Current Context:
- Time: ${context.localTime} (${context.timeOfDay})
- Energy: ${context.energyLevel}

Quick Win Tasks (≤30 min, low effort):
${quickWins.slice(0, 7).map((t, i) => `
${i + 1}. ${t.title}
   Duration: ${t.estimatedDuration} min
   Priority: ${t.priority}
   Energy: ${t.energyRequired}
   ${t.urgency !== 'none' ? `Urgency: ${t.urgency}` : ''}
`).join('\n')}

Provide:
1. TOP QUICK WIN: The best task to start with right now
2. WHY START HERE: Explain momentum and impact
3. MOMENTUM STRATEGY: Suggest a sequence of 2-3 quick wins to build momentum
4. TIME ESTIMATE: Total time for the recommended sequence

Focus on building confidence and momentum!`;

    try {
      return await aiService.callClaude([{ type: 'text', text: prompt }]);
    } catch (error) {
      return this.fallbackQuickWinRecommendation(quickWins);
    }
  }

  /**
   * Eisenhower matrix recommendation
   */
  async eisenhowerRecommendation(
    todos: Todo[],
    context: UserContext
  ): Promise<string> {
    const incompleteTodos = todos.filter((todo) => !todo.completed);

    // Categorize into quadrants
    const quadrants = {
      urgentImportant: incompleteTodos.filter(
        (t) =>
          (t.urgency === 'overdue' ||
            t.urgency === 'critical' ||
            t.urgency === 'today') &&
          (t.priority === 'high' || t.priority === 'medium')
      ),
      importantNotUrgent: incompleteTodos.filter(
        (t) =>
          (t.urgency === 'this-week' ||
            t.urgency === 'future' ||
            t.urgency === 'none') &&
          (t.priority === 'high' || t.priority === 'medium')
      ),
      urgentNotImportant: incompleteTodos.filter(
        (t) =>
          (t.urgency === 'overdue' ||
            t.urgency === 'critical' ||
            t.urgency === 'today') &&
          (t.priority === 'low' || t.priority === 'none')
      ),
      neitherUrgentNorImportant: incompleteTodos.filter(
        (t) =>
          (t.urgency === 'this-week' ||
            t.urgency === 'future' ||
            t.urgency === 'none') &&
          (t.priority === 'low' || t.priority === 'none')
      ),
    };

    const prompt = `You are a strategic productivity advisor using the Eisenhower Matrix.

Current Context:
- Time: ${context.localTime}
- Day: ${context.dayOfWeek}
- Energy: ${context.energyLevel}

QUADRANT 1 - URGENT & IMPORTANT (Do First): ${quadrants.urgentImportant.length} tasks
${quadrants.urgentImportant.slice(0, 5).map((t) => `- ${t.title} (${t.urgency}, ${t.priority} priority)`).join('\n') || 'None'}

QUADRANT 2 - IMPORTANT, NOT URGENT (Schedule): ${quadrants.importantNotUrgent.length} tasks
${quadrants.importantNotUrgent.slice(0, 5).map((t) => `- ${t.title} (${t.priority} priority)`).join('\n') || 'None'}

QUADRANT 3 - URGENT, NOT IMPORTANT (Delegate/Minimize): ${quadrants.urgentNotImportant.length} tasks
${quadrants.urgentNotImportant.slice(0, 3).map((t) => `- ${t.title}`).join('\n') || 'None'}

QUADRANT 4 - NEITHER URGENT NOR IMPORTANT (Eliminate): ${quadrants.neitherUrgentNorImportant.length} tasks
${quadrants.neitherUrgentNorImportant.slice(0, 3).map((t) => `- ${t.title}`).join('\n') || 'None'}

Provide:
1. RECOMMENDED FOCUS: Which quadrant to focus on now
2. SPECIFIC TASK: The exact task to start with
3. QUADRANT STRATEGY: How to balance all quadrants today
4. WARNINGS: Any urgent/important tasks that need immediate attention
5. OPTIMIZATION: Suggestions for reducing Quadrant 3 & 4 tasks

Use strategic thinking to maximize long-term productivity.`;

    try {
      return await aiService.callClaude([{ type: 'text', text: prompt }]);
    } catch (error) {
      return this.fallbackEisenhowerRecommendation(quadrants);
    }
  }

  /**
   * Deep work / focus session recommendation
   */
  async deepWorkRecommendation(
    todos: Todo[],
    context: UserContext
  ): Promise<string> {
    const incompleteTodos = todos.filter((todo) => !todo.completed);

    // Filter for deep work: ≥60 min, high energy, high/medium priority
    const deepWorkTasks = incompleteTodos
      .filter(
        (t) =>
          (t.estimatedDuration || 0) >= 60 &&
          t.energyRequired === 'high' &&
          (t.priority === 'high' || t.priority === 'medium')
      )
      .sort((a, b) => {
        // Sort by priority then urgency
        if (a.priority !== b.priority) {
          const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        const urgencyOrder = {
          overdue: 0,
          critical: 1,
          today: 2,
          tomorrow: 3,
          'this-week': 4,
          future: 5,
          none: 6,
        };
        return (
          urgencyOrder[a.urgency || 'none'] -
          urgencyOrder[b.urgency || 'none']
        );
      });

    if (deepWorkTasks.length === 0) {
      return `No deep work tasks available. This might be a good time for:
- Quick wins and administrative tasks
- Planning and organizing
- Taking a break and recharging

Deep work requires high energy and significant time blocks. Save it for when you're fresh!`;
    }

    const prompt = `You are a deep work coach helping plan focused, distraction-free work sessions.

Current Context:
- Time: ${context.localTime} (${context.timeOfDay})
- Day: ${context.dayOfWeek}
- Your Energy: ${context.energyLevel}

Deep Work Tasks (≥60 min, high complexity):
${deepWorkTasks.slice(0, 5).map((t, i) => `
${i + 1}. ${t.title}
   Duration: ${t.estimatedDuration} min
   Priority: ${t.priority}
   Context: ${t.contextType}
   ${t.urgency !== 'none' ? `Urgency: ${t.urgency}` : ''}
`).join('\n')}

Provide:
1. RECOMMENDED FOCUS SESSION: Best task for a 2-3 hour deep work block
2. TIMING ADVICE: Is now a good time, or should this be scheduled for later?
3. FOCUS PLAN: How to structure the session (breaks, milestones)
4. CONTEXT GROUPING: Other tasks that could be batched in the same session
5. PREPARATION: What to do before starting (eliminate distractions, gather resources)

Emphasize the importance of uninterrupted focus time!`;

    try {
      return await aiService.callClaude([{ type: 'text', text: prompt }]);
    } catch (error) {
      return this.fallbackDeepWorkRecommendation(deepWorkTasks, context);
    }
  }

  /**
   * Build comprehensive smart prompt
   */
  private buildSmartPrompt(
    todos: Todo[],
    context: UserContext,
    workload: any
  ): string {
    return `You are an AI productivity assistant providing comprehensive task recommendations.

CURRENT CONTEXT:
- Time: ${context.localTime} (${context.timeOfDay})
- Day: ${context.dayOfWeek}${context.isWeekend ? ' (Weekend)' : ''}
- Work Hours: ${context.isWorkHours ? 'Yes' : 'No'}
- Your Energy Level: ${context.energyLevel}
- Timezone: ${context.timezone}

WORKLOAD ANALYSIS:
- Total Incomplete Tasks: ${workload.totalIncompleteTasks}
- Estimated Hours: ${workload.totalEstimatedHours}h
- Critical Tasks: ${workload.criticalTasks}
- Workload Status: ${workload.isOverloaded ? '⚠️ OVERLOADED' : '✓ Manageable'}

TASK BREAKDOWN BY URGENCY:
- Overdue: ${workload.byUrgency.overdue.length}
- Critical (due <4h): ${workload.byUrgency.critical.length}
- Today: ${workload.byUrgency.today.length}
- Tomorrow: ${workload.byUrgency.tomorrow.length}
- This Week: ${workload.byUrgency['this-week'].length}

TOP TASKS:
${todos.slice(0, 10).map((t, i) => `
${i + 1}. ${t.title}
   Priority: ${t.priority} | Energy: ${t.energyRequired} | Duration: ${t.estimatedDuration} min
   Context: ${t.contextType} | Urgency: ${t.urgency}
   ${t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString()}` : ''}
`).join('\n')}

Please provide a comprehensive recommendation with:

**RECOMMENDED TASK:** [Specific task title]

**WHY NOW:** [Explain why this task is optimal given:
- Current time and energy level
- Urgency and priority
- Context and workflow
- Energy requirements vs. available energy]

**ESTIMATED TIME:** [Duration and when to complete by]

**ENERGY MATCH:** [How this task aligns with current ${context.energyLevel} energy]

**ALTERNATIVES:** [2-3 backup options if recommended task isn't feasible right now]

**STRATEGIC ADVICE:** [Guidance on:
- Managing the workload${workload.isOverloaded ? ' (you are overloaded!)' : ''}
- Upcoming critical deadlines
- Best approach for the rest of ${context.timeOfDay}]

Be specific, actionable, and motivating!`;
  }

  /**
   * Fallback recommendation when AI service fails
   */
  private fallbackRecommendation(
    todos: Todo[],
    context: UserContext
  ): string {
    const topTask = todos.find(
      (t) => t.urgency === 'overdue' || t.urgency === 'critical'
    ) || todos[0];

    return `**RECOMMENDED TASK:** ${topTask.title}

**WHY NOW:** This task ${topTask.urgency !== 'none' ? `is ${topTask.urgency}` : `has ${topTask.priority} priority`} and requires ${topTask.energyRequired} energy, which ${topTask.energyRequired === context.energyLevel ? 'matches your current energy level' : 'you can handle'}.

**ESTIMATED TIME:** ~${topTask.estimatedDuration} minutes

Start with this and build momentum!`;
  }

  private fallbackEnergyRecommendation(
    matchingTasks: Todo[],
    context: UserContext
  ): string {
    if (matchingTasks.length === 0) {
      return `No tasks match your current ${context.energyLevel} energy level. Consider taking a break or adjusting your energy with a walk, coffee, or quick win task.`;
    }

    const task = matchingTasks[0];
    return `**ENERGY MATCH:** ${task.title}\n\nThis task requires ${task.energyRequired} energy, matching your current level. Estimated time: ${task.estimatedDuration} minutes.`;
  }

  private fallbackQuickWinRecommendation(quickWins: Todo[]): string {
    const task = quickWins[0];
    return `**QUICK WIN:** ${task.title}\n\nThis task takes only ${task.estimatedDuration} minutes and requires ${task.energyRequired} energy. Perfect for building momentum!`;
  }

  private fallbackEisenhowerRecommendation(quadrants: any): string {
    if (quadrants.urgentImportant.length > 0) {
      return `**URGENT & IMPORTANT:** Focus on "${quadrants.urgentImportant[0].title}" immediately. You have ${quadrants.urgentImportant.length} tasks in this critical quadrant.`;
    }
    return `Good news! No urgent & important tasks. Focus on important but not urgent work to stay ahead.`;
  }

  private fallbackDeepWorkRecommendation(
    tasks: Todo[],
    context: UserContext
  ): string {
    const task = tasks[0];
    return `**DEEP WORK:** ${task.title}\n\nThis task requires ${task.estimatedDuration} minutes of focused work. Current energy: ${context.energyLevel}. ${context.energyLevel === 'high' ? 'Great time for deep work!' : 'Consider scheduling this for when your energy is higher.'}`;
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
