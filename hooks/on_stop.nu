#!/usr/bin/env nu

def check_plan_md [] {
  if ("PLAN.md" | path exists) {
    let has_unchecked = (open PLAN.md | lines | any { |line| $line | str starts-with "- [ ]" })
    if $has_unchecked {
      print -e "PLAN.md has unchecked steps - ensure progress is marked before stopping"
    }
  }
}

def run_just_check [] {
  if ("justfile" | path exists) {
    let result = (do { just check } | complete)
    if $result.exit_code != 0 {
      let output = $"($result.stderr)\n($result.stdout)" | str trim
      print ({decision: "block", reason: $"just check failed:\n($output)"} | to json)
      exit 0
    }
  }
}

def rename_zellij_tab [] {
  if ($env.ZELLIJ? == null) {
    return
  }

  let pane_id = ($env.ZELLIJ_PANE_ID? | default "")
  if ($pane_id | is-empty) {
    return
  }

  let payload = {action: "add_asterisk", pane_id: ($pane_id | into int)} | to json --raw

  bash -c $"echo '($payload)' | zellij pipe --plugin file:~/.config/zellij/plugins/tab-renamer.wasm"
}

def signal_conductor [] {
  let signal_dir = ($env.CONDUCTOR_SIGNAL_DIR? | default "")
  let tab_id = ($env.CONDUCTOR_TAB_ID? | default "")

  if ($signal_dir | is-empty) or ($tab_id | is-empty) {
    return
  }

  touch $"($signal_dir)/tab_($tab_id)"
}

def main [] {
  if (($in | is-empty) == false) {
    let input = $in | from json
  }

  check_plan_md
  run_just_check
  rename_zellij_tab
  signal_conductor
}
