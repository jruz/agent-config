---
description: Rename this agent's Herdr tab to the conversation topic
---

Rename this conversation's Herdr tab.

- Infer a short title from the conversation's main topic.
- Run `,herdr-title '<title>'` yourself, shell-escaping the title.
- The script identifies this process's tab and verifies the rename without relying on focus.
- If it fails, report the error; never fall back to renaming the focused tab.
- Report the new title briefly.
