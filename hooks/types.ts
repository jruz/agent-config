import { z } from "zod/v4";

const baseInput = z.object({
  session_id: z.string(),
  transcript_path: z.string(),
  cwd: z.string(),
  permission_mode: z.string().optional(),
  hook_event_name: z.string(),
});

const toolInput = z.record(z.string(), z.unknown());

export const preToolUseInputSchema = baseInput.extend({
  hook_event_name: z.literal("PreToolUse"),
  tool_name: z.string(),
  tool_input: toolInput,
  tool_use_id: z.string(),
});

export const postToolUseInputSchema = baseInput.extend({
  hook_event_name: z.literal("PostToolUse"),
  tool_name: z.string(),
  tool_input: toolInput,
  tool_use_id: z.string(),
  tool_response: z.string(),
});

export const postToolUseFailureInputSchema = baseInput.extend({
  hook_event_name: z.literal("PostToolUseFailure"),
  tool_name: z.string(),
  tool_input: toolInput,
  tool_use_id: z.string(),
  error: z.string(),
  is_interrupt: z.boolean(),
});

export const userPromptSubmitInputSchema = baseInput.extend({
  hook_event_name: z.literal("UserPromptSubmit"),
  prompt: z.string(),
});

export const stopInputSchema = baseInput.extend({
  hook_event_name: z.literal("Stop"),
  stop_hook_active: z.boolean(),
});

export const notificationInputSchema = baseInput.extend({
  hook_event_name: z.literal("Notification"),
  message: z.string(),
  title: z.string().optional(),
  notification_type: z.string(),
});

export const sessionStartInputSchema = baseInput.extend({
  hook_event_name: z.literal("SessionStart"),
  source: z.string(),
  model: z.string(),
});

export const sessionEndInputSchema = baseInput.extend({
  hook_event_name: z.literal("SessionEnd"),
});

export const subagentStartInputSchema = baseInput.extend({
  hook_event_name: z.literal("SubagentStart"),
  agent_id: z.string(),
  agent_type: z.string(),
});

export const subagentStopInputSchema = baseInput.extend({
  hook_event_name: z.literal("SubagentStop"),
  agent_id: z.string(),
  agent_type: z.string(),
  stop_hook_active: z.boolean(),
});

export const taskCompletedInputSchema = baseInput.extend({
  hook_event_name: z.literal("TaskCompleted"),
  task_id: z.string(),
  task_subject: z.string(),
  task_description: z.string(),
});

export const preCompactInputSchema = baseInput.extend({
  hook_event_name: z.literal("PreCompact"),
});

export type PreToolUseInput = z.infer<typeof preToolUseInputSchema>;
export type PostToolUseInput = z.infer<typeof postToolUseInputSchema>;
export type PostToolUseFailureInput = z.infer<
  typeof postToolUseFailureInputSchema
>;
export type UserPromptSubmitInput = z.infer<typeof userPromptSubmitInputSchema>;
export type StopInput = z.infer<typeof stopInputSchema>;
export type NotificationInput = z.infer<typeof notificationInputSchema>;
export type SessionStartInput = z.infer<typeof sessionStartInputSchema>;
export type SessionEndInput = z.infer<typeof sessionEndInputSchema>;
export type SubagentStartInput = z.infer<typeof subagentStartInputSchema>;
export type SubagentStopInput = z.infer<typeof subagentStopInputSchema>;
export type TaskCompletedInput = z.infer<typeof taskCompletedInputSchema>;
export type PreCompactInput = z.infer<typeof preCompactInputSchema>;

export type ToolInput = z.infer<typeof toolInput>;

export type HookInput =
  | PreToolUseInput
  | PostToolUseInput
  | PostToolUseFailureInput
  | UserPromptSubmitInput
  | StopInput
  | NotificationInput
  | SessionStartInput
  | SessionEndInput
  | SubagentStartInput
  | SubagentStopInput
  | TaskCompletedInput
  | PreCompactInput;

export type BlockOutput = {
  decision: "block";
  reason: string;
  systemMessage?: string;
};

export type PreToolUseOutput = {
  hookSpecificOutput: {
    hookEventName: "PreToolUse";
    permissionDecision: "allow" | "deny" | "ask";
    permissionDecisionReason?: string;
    updatedInput?: Record<string, unknown>;
    additionalContext?: string;
  };
};

export type HookOutput = {
  continue?: boolean;
  stopReason?: string;
  suppressOutput?: boolean;
  systemMessage?: string;
} & (BlockOutput | PreToolUseOutput | Record<string, never>);
