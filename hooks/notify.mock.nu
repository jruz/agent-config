#!/usr/bin/env -S nu --stdin
# Record external command calls for hook tests.
def --wrapped main [
    ...args: string # Command arguments to record.
]: nothing -> nothing {
    let command = $env.CURRENT_FILE | path basename
    {command: $command, args: $args} | to json --raw | $"($in)\n" | save --append $env.HOOK_TEST_CALLS
    match $command {
        'tmux' => (print --no-newline $env.HOOK_TEST_TMUX_CLIENTS)
        'notify' | 'terminal-notifier' => (print 'notification output')
        _ => null
    }
    let code = $env | get --optional $"HOOK_TEST_($command | str upcase | str replace --all '-' '_')_EXIT"
    if $code != null { exit ($code | into int) }
}
