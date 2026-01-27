#!/usr/bin/env nu

def rename_zellij_tab [] {
  if ($env.ZELLIJ? == null) {
    return
  }

  let pane_id = ($env.ZELLIJ_PANE_ID? | default "")
  if ($pane_id | is-empty) {
    return
  }

  let payload = {action: "remove_asterisk", pane_id: ($pane_id | into int)} | to json --raw

  bash -c $"echo '($payload)' | zellij pipe --plugin file:~/.config/zellij/plugins/tab-renamer.wasm"
}

def check_plan_reminder [] {
  if ("PLAN.md" | path exists) {
    let content = (open PLAN.md)
    let has_unchecked = ($content | lines | any { |line| $line | str starts-with "- [ ]" })
    if $has_unchecked {
      return "📋 PLAN.md exists with unchecked steps. Work on the current plan before starting new tasks."
    }
    return null
  }
  return "📋 No PLAN.md found. For implementation tasks, create one first using Skill(plan-md)."
}

def main [] {
  mut input = null
  if (($in | is-empty) == false) {
    $input = ($in | from json)
  }

  rename_zellij_tab

  let reminder = (check_plan_reminder)
  if $reminder != null {
    print ({decision: "allow", systemMessage: $reminder} | to json)
  }
}
