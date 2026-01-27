#!/usr/bin/env nu

def parse_plan_frontmatter [] {
  if not ("PLAN.md" | path exists) {
    return null
  }

  let content = (open PLAN.md)
  let lines = ($content | lines)

  if ($lines | first) != "---" {
    return null
  }

  let matches = ($lines | skip 1 | enumerate | where { |it| $it.item == "---" })
  if ($matches | is-empty) {
    return null
  }
  let end_idx = ($matches | first | get index)

  let frontmatter_lines = ($lines | skip 1 | take $end_idx)

  mut result = {active_loop: false, iteration: 1, max_iterations: 20}

  for line in $frontmatter_lines {
    if ($line | str contains ":") {
      let parts = ($line | split column ":" key value | first)
      let key = ($parts.key | str trim)
      let value = ($parts.value | str trim)

      if $key == "active_loop" {
        $result.active_loop = ($value == "true")
      } else if $key == "iteration" {
        $result.iteration = ($value | into int)
      } else if $key == "max_iterations" {
        $result.max_iterations = ($value | into int)
      }
    }
  }

  $result
}

def update_plan_iteration [new_iteration: int] {
  let content = (open PLAN.md)
  let updated = ($content | str replace --regex 'iteration: \d+' $"iteration: ($new_iteration)")
  $updated | save --force PLAN.md
}

def set_plan_loop_inactive [] {
  let content = (open PLAN.md)
  let updated = ($content | str replace "active_loop: true" "active_loop: false")
  $updated | save --force PLAN.md
}

def get_unchecked_acceptance_criteria [] {
  let content = (open PLAN.md)

  if not ($content | str contains "## Acceptance Criteria") {
    return []
  }

  let lines = ($content | lines)
  mut in_section = false
  mut unchecked = []

  for line in $lines {
    if ($line | str starts-with "## Acceptance Criteria") {
      $in_section = true
      continue
    }
    if $in_section and ($line | str starts-with "## ") {
      break
    }
    if $in_section and ($line | str starts-with "- [ ]") {
      $unchecked = ($unchecked | append ($line | str replace "- [ ] " ""))
    }
  }

  $unchecked
}

def check_plan_md [] {
  let frontmatter = (parse_plan_frontmatter)

  if $frontmatter == null or not $frontmatter.active_loop {
    return null
  }

  let unchecked = (get_unchecked_acceptance_criteria)

  if ($unchecked | is-empty) {
    print -e $"✅ Plan complete at iteration ($frontmatter.iteration)"
    set_plan_loop_inactive
    return null
  }

  if $frontmatter.iteration >= $frontmatter.max_iterations {
    print -e $"🛑 Plan loop: Max iterations \(($frontmatter.max_iterations)\) reached"
    set_plan_loop_inactive
    return null
  }

  let next_iteration = $frontmatter.iteration + 1
  update_plan_iteration $next_iteration

  let criteria_list = ($unchecked | each { |c| $"  • ($c)" } | str join "\n")

  {
    decision: "block"
    reason: $"Continue working on PLAN.md. Unchecked acceptance criteria:\n($criteria_list)\n\nBefore continuing, add a Loop Log entry: `- **Loop ($frontmatter.iteration)**: [What you tried] → [Outcome]`"
    systemMessage: $"🔄 Loop ($next_iteration)/($frontmatter.max_iterations) | Update Loop Log, then continue on acceptance criteria"
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

def run_slop_detector [] {
  let result = (do { slop-detector } | complete)
  if $result.exit_code != 0 {
    let output = $"($result.stderr)\n($result.stdout)" | str trim
    print ({decision: "block", reason: $"slop-detector failed:\n($output)"} | to json)
    exit 0
  }
}

def signal_zellij_plugin [] {
  let pane_id = ($env.ZELLIJ_PANE_ID? | default "")
  if ($pane_id | is-empty) {
    return
  }

  let signal_dir = "/tmp/zellij-tab-renamer"
  mkdir $signal_dir

  let signal_file = $"($signal_dir)/add_asterisk_($pane_id)_((random uuid))"
  let payload = {action: "add_asterisk", pane_id: ($pane_id | into int)} | to json --raw

  $payload | save --force $signal_file
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

  let plan_result = (check_plan_md)
  if $plan_result != null {
    print ($plan_result | to json)
    exit 0
  }

  run_just_check
  run_slop_detector
  signal_zellij_plugin
  signal_conductor
}
