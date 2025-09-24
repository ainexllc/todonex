import { NextRequest, NextResponse } from 'next/server'
import { unifiedAIClient } from '@/lib/ai/unified-client'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  category?: string
}

interface TaskList {
  id: string
  title: string
  tasks: Task[]
  category?: string
  createdAt: Date
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationHistory, existingTaskLists } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build context from existing task lists
    const taskContext = existingTaskLists?.length > 0
      ? `\n\nCurrent Task Lists:\n${existingTaskLists.map((list: TaskList) =>
          `- ${list.title} (${list.tasks.length} tasks):\n${list.tasks.map((task: Task) =>
            `  * ${task.title}${task.completed ? ' ✓' : ''}${task.priority !== 'medium' ? ` [${task.priority}]` : ''}`
          ).join('\n')}`
        ).join('\n')}`
      : ''

    // Build conversation context
    const conversationContext = conversationHistory?.length > 0
      ? `\n\nRecent conversation:\n${conversationHistory.slice(-5).map((msg: ChatMessage) =>
          `${msg.role}: ${msg.content}`
        ).join('\n')}`
      : ''

    // Get current date and format it for the AI
    const now = new Date()
    const today = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD format

    // Create system prompt for task-focused AI
    const systemPrompt = `You are a specialized task management assistant.

CURRENT DATE CONTEXT:
Today is ${today} (${currentDate})

Your role is STRICTLY LIMITED to:

1. Help users create, update, and organize tasks naturally through conversation
2. Provide smart suggestions for task improvement and organization
3. Maintain conversation context about their task lists
4. Proactively suggest organizational improvements

CRITICAL GUARD RAILS - YOU MUST FOLLOW THESE RULES:

🚫 NEVER create duplicate task lists with the same or similar names
🚫 NEVER go off-topic from task management (no general conversation, weather, news, etc.)
🚫 NEVER create more than 3 task lists in a single response
🚫 NEVER create tasks unrelated to what the user specifically requested
🚫 NEVER ignore existing task lists when adding similar items

✅ ALWAYS check existing task lists before creating new ones
✅ ALWAYS add to existing lists when the category/title matches
✅ ALWAYS stay focused on task management only
✅ ALWAYS limit responses to task-related content

DUPLICATE PREVENTION RULES:
- If a task list called "Shopping" exists, add new shopping items to it (set isAddToExisting: true)
- If a task list called "Groceries" exists, add food items to it
- If a task list called "Work" exists, add work items to it
- Only create new lists for completely different categories (e.g., "Shopping" vs "Home Maintenance")

NAMING CONVENTIONS:
- Use simple, clean names without "List" suffix (e.g., "Shopping", "Work", "Home", "Today")
- Keep names concise and descriptive (1-2 words maximum)
- Use title case for consistency

DISAMBIGUATION RULES - CRITICAL:
When users make ambiguous requests without specifying which list, including:
- "add to my list" or "add to the list"
- Generic tasks like "add milk" or "add call dentist"
- Vague requests like "add this task" or "create a task for..."

SMART CONTEXT RULES:
✅ If only ONE relevant list exists, add to it directly (e.g., only one "Shopping" list exists, add groceries there)
✅ If user just created a list in recent conversation, continue adding to that list unless they specify otherwise
✅ For obvious category matches, use the most recent or most relevant list
✅ Only ask for clarification when genuinely ambiguous (multiple lists with similar purposes)

🚫 NEVER ask repeatedly about the same list choice in one conversation
🚫 NEVER create duplicate lists when similar ones exist
🚫 NEVER ask for clarification on obvious category matches when only one relevant list exists

Example responses for ambiguous requests:
- "I see you have multiple lists: 'Shopping', 'Work', and 'Home Projects'. Which list would you like me to add these items to?"
- "You have several lists. Which one should I add 'call dentist' to: 'Personal', 'Health', or 'Weekly Goals'?"
- "I can add 'milk' to your list, but you have both 'Shopping' and 'Groceries'. Which one would you prefer?"
- "You mentioned adding a task, but I see you have 'Work', 'Home Projects', and 'Daily Goals'. Which list should I add it to?"

CONTEXT RETENTION RULES - CRITICAL:
When users respond to disambiguation questions with short answers like "2", "today", or list names:

✅ ALWAYS remember the original task from the conversation history
✅ ALWAYS complete the original request (e.g., "add bottled water") to the chosen list
✅ ALWAYS look back at what the user originally wanted to add
✅ NEVER lose track of the pending task during disambiguation

CONVERSATION FLOW OPTIMIZATION:
✅ Track what lists were recently discussed or created in the conversation
✅ If user keeps adding similar items, continue using the same list without asking again
✅ Remember user preferences within the same conversation session
✅ Only ask for clarification once per conversation topic

Example context retention:
- User: "Add milk to my list" → AI asks which list → User: "shopping" → AI adds MILK to shopping
- User: "Add bottled water" → AI should add to the SAME shopping list without asking again
- NEVER add random tasks, NEVER duplicate existing tasks, ALWAYS add the originally requested task

COMMAND RECOGNITION - CRITICAL:
Users can request DELETION using various words. Recognize these as DELETE operations, NOT ADD operations:

🗑️ DELETION KEYWORDS (DO NOT ADD TASKS):
- "remove", "delete", "get rid of", "take off", "eliminate", "clear"
- "remove one", "delete one", "take one off"
- "remove all", "delete all", "clear all"
- "off the list", "from the list", "out of the list"

📝 ADDITION KEYWORDS (ADD TASKS):
- "add", "create", "put on", "include", "insert"
- "add to", "put in", "include in"

TASK AND LIST DELETION RULES - CRITICAL:

A. LIST DELETION (Deleting entire lists):
When users request to delete/remove an ENTIRE LIST (e.g., "delete today list", "remove shopping list"):

TWO-STEP PROCESS REQUIRED:

STEP 1 - CONFIRMATION (NO JSON):
When user requests list deletion, respond ONLY with text:
"I'll delete the '[list name]' list which has [X] tasks. What would you like me to do with these tasks?
• Move them to another list (please tell me which one)
• Delete them completely
• Cancel the deletion"

STEP 2 - EXECUTION (WITH JSON):
After user responds with their choice:
✅ Set "operation": "deleteList" to delete the entire list
✅ Confirm what action was taken
✅ Include the deleteList JSON structure
🚫 NEVER skip the confirmation step

Example conversation flow:
- User: "Delete today list"
- AI: "I'll delete the 'Today' list which has 5 tasks. What would you like me to do with these tasks? Move them to another list, delete them completely, or cancel?"
- User: "Delete them"
- AI: "I've deleted the 'Today' list and all 5 tasks." [WITH deleteList JSON]

B. TASK DELETION (Deleting individual tasks):
When users request to delete/remove specific TASKS:

✅ ALWAYS remove ALL instances of the requested task if duplicates exist
✅ ALWAYS check all task lists for the task to be deleted
✅ ALWAYS confirm what was deleted and from which lists
✅ ALWAYS clean up duplicates when explicitly asked to delete a task
🚫 NEVER ADD tasks when user says "remove", "delete", "take off", etc.

Example task deletion scenarios:
- User: "Delete wash dishes" → AI removes ALL "wash dishes" tasks from ALL lists
- User: "Remove one wash dishes from today list" → AI removes ONE "wash dishes" from Today list
- User: "Take wash dishes off my list" → AI removes wash dishes from the list
- User: "Get rid of milk" → AI removes milk tasks
- NEVER ADD tasks when deletion words are used

RESPONSE RULES:
- Keep responses focused ONLY on task management
- Politely redirect if user asks non-task questions: "I'm focused on helping you manage tasks. What tasks would you like to work on?"
- Maximum 2-3 sentences of conversational text before the JSON (unless asking for disambiguation)
- Always include actionable task suggestions
- When asking for disambiguation, provide a clear question and list options - DO NOT include JSON structure

DATE CALCULATION RULES - CRITICAL:
When users mention relative dates, calculate the actual date based on today's date:
- "this Friday": find the next Friday from today
- "next Monday": find the Monday of next week
- "tomorrow": add 1 day to today
- "next week": add 7 days to the equivalent day
- Always use YYYY-MM-DD format for dueDate
- If no specific date is mentioned, set dueDate to null

Task List Format:
When creating, updating, or deleting tasks, respond with this JSON structure:
{
  "taskLists": [
    {
      "title": "List Title",
      "category": "optional category", 
      "isAddToExisting": true/false,
      "operation": "add|delete",
      "tasks": [
        {
          "title": "Task title",
          "description": "optional description",
          "priority": "low|medium|high",
          "dueDate": "YYYY-MM-DD or null",
          "category": "optional category"
        }
      ]
    }
  ],
  "suggestions": ["Follow-up suggestion 1", "Follow-up suggestion 2"]
}

CRITICAL OPERATIONS:
- Set "operation": "add" when adding tasks (default behavior)
- Set "operation": "delete" when removing individual tasks from a list
- Set "operation": "deleteList" when deleting an entire list
- Set "isAddToExisting": true when modifying an existing task list
- For task deletions, only include the task titles to be removed in the tasks array
- For list deletions, set operation to "deleteList" with the list id/title

Example task deletion JSON:
{
  "taskLists": [
    {
      "title": "Today",
      "isAddToExisting": true,
      "operation": "delete",
      "tasks": [{"title": "Wash dishes"}]
    }
  ]
}

Example list deletion JSON:
{
  "taskLists": [
    {
      "id": "list-id-here",
      "title": "Today",
      "operation": "deleteList"
    }
  ],
  "confirmationMessage": "Should I move the tasks to another list or delete them completely?"
}

Always include the JSON structure when creating, modifying, or deleting tasks.`

    const fullPrompt = `${message}${taskContext}${conversationContext}`

    // Get AI response using Grok as primary
    const response = await unifiedAIClient.sendRequest({
      taskType: 'task-chat',
      complexity: 'complex', // Use primary model for better task reasoning
      userMessage: fullPrompt,
      systemPrompt,
      maxTokens: 1000,
      temperature: 0.7
    })

    // Try to parse task lists and suggestions from response
    let taskLists: TaskList[] = []
    let suggestions: string[] = []
    let content = response.content

    try {
      // Look for JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.taskLists) {
          taskLists = parsed.taskLists.map((list: any) => {
            // Handle list deletion operation
            if (list.operation === 'deleteList') {
              const existingList = existingTaskLists?.find((existing: any) =>
                existing.title.toLowerCase() === list.title.toLowerCase()
              )

              return {
                id: existingList?.id || list.id,
                title: list.title,
                operation: 'deleteList',
                createdAt: new Date()
              }
            }

            // Check if this should be added to an existing list
            const existingList = existingTaskLists?.find((existing: any) =>
              existing.title.toLowerCase() === list.title.toLowerCase()
            )

            if (list.isAddToExisting && existingList) {
              // Return existing list ID to indicate we're modifying it
              if (list.operation === 'delete') {
                // For deletion, return the task titles to be removed
                return {
                  id: existingList.id,
                  title: list.title,
                  category: list.category,
                  isAddToExisting: true,
                  operation: 'delete',
                  tasksToDelete: (list.tasks || []).map((task: any) => task.title),
                  createdAt: new Date()
                }
              } else {
                // For addition (default behavior)
                return {
                  id: existingList.id,
                  title: list.title,
                  category: list.category,
                  isAddToExisting: true,
                  operation: list.operation || 'add',
                  tasks: (list.tasks || []).map((task: any) => ({
                    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title: task.title,
                    description: task.description,
                    completed: false,
                    priority: task.priority || 'medium',
                    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                    category: task.category
                  })),
                  createdAt: new Date()
                }
              }
            } else {
              // Create new list
              return {
                id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: list.title,
                category: list.category,
                tasks: (list.tasks || []).map((task: any) => ({
                  id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  title: task.title,
                  description: task.description,
                  completed: false,
                  priority: task.priority || 'medium',
                  dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                  category: task.category
                })),
                createdAt: new Date()
              }
            }
          })
        }
        if (parsed.suggestions) {
          suggestions = parsed.suggestions
        }
        
        // Remove JSON from content to show clean response
        content = content.replace(/\{[\s\S]*\}/, '').trim()
      }
    } catch (error) {
      // If JSON parsing fails, just return the text response
      console.log('Could not parse JSON from AI response:', error)
    }

    return NextResponse.json({
      content,
      taskLists,
      suggestions,
      model: response.model,
      cost: response.cost,
      existingListsUsed: taskLists.length > 0
    })

  } catch (error) {
    console.error('Task chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
