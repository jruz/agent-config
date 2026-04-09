import { z } from "zod/v4";

const baseInput = z.object({
  session_id: z.string(),
  transcript_path: z.string(),
  cwd: z.string(),
  permission_mode: z.string().optional(),
  hook_event_name: z.string(),
});

export const notificationInputSchema = baseInput.extend({
  hook_event_name: z.literal("Notification"),
  message: z.string(),
  title: z.string().optional(),
  notification_type: z.string(),
});

export type NotificationInput = z.infer<typeof notificationInputSchema>;
