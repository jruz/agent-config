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

def main [] {
  if (($in | is-empty) == false) {
    let input = $in | from json
  }

  rename_zellij_tab
}
