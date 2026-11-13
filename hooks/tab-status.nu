const HOOKS = path self | path dirname

export def main [state: string]: nothing -> nothing {
    if ('ZELLIJ_SESSION_NAME' in $env or 'ZELLIJ_PANE_ID' in $env) {
        ^$"($env.HOME)/.cargo/bin/tab-renamer-hook" $state
    }
    if ('TMUX' in $env or 'TMUX_PANE' in $env) {
        ^($HOOKS | path join tmux-tab-renamer) $state
    }
    ^$"($env.HOME)/.cargo/bin/agent-manager-hook" $state
}
