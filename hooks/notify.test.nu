use std/assert
const HOOKS = path self | path dirname
const MOCK = path self | path dirname | path join notify.mock.nu
const ISOLATED = [
    TMUX
    TMUX_PANE
    ZELLIJ_SESSION_NAME
    ZELLIJ_PANE_ID
    NTFY_CHANNEL_DESKTOP
]
def fixture []: nothing -> string {
    let root = mktemp --directory
    let bin = $root | path join bin
    let cargo = $root | path join home .cargo bin
    let hooks = $root | path join hooks
    mkdir $bin $cargo $hooks ($root | path join agent-config)
    for command in [tmux terminal-notifier] { cp $MOCK ($bin | path join $command) }
    cp $MOCK ($cargo | path join agent-manager-hook)
    cp $MOCK ($hooks | path join notify)
    cp ($HOOKS | path join on_stop) ($HOOKS | path join tab-status.nu) $hooks
    ^chmod +x ...(glob $"($root)/{bin,hooks,home/.cargo/bin}/*")
    '' | save ($root | path join calls)
    $root
}
def environment [root: path]: record -> record {
    let overrides = $in
    {
        HOME: ($root | path join home)
        PATH: ($env.PATH | prepend ($root | path join bin))
        HOOK_TEST_CALLS: ($root | path join calls)
        HOOK_TEST_TMUX_CLIENTS: ''
    } | merge $overrides
}
def run-in [root: path, command: closure]: record -> record {
    let variables = $in
    cd ($root | path join agent-config)
    hide-env --ignore-errors ...$ISOLATED
    load-env $variables
    do $command | complete
}
def run-notify [root: path]: record -> record {
    let overrides = $in
    let hook = $HOOKS | path join notify
    $overrides | environment $root | run-in $root { ^$hook }
}
def run-on-stop [root: path]: record -> record {
    let overrides = $in
    let hook = $root | path join hooks on_stop
    $overrides | environment $root | run-in $root { ^$hook }
}
const HTTP_STUB = 'def --wrapped "http post" [...args] {
    $args | to nuon | save $env.HOOK_TEST_HTTP
}'
def call-notify [root: path, expression: string]: record -> record {
    let overrides = $in
    let hook = $HOOKS | path join notify
    let command = $"($HTTP_STUB); source ($hook | to nuon); ($expression)"
    $overrides | environment $root | run-in $root { ^$nu.current-exe --commands $command }
}
def calls [root: path]: nothing -> list<record> {
    open --raw ($root | path join calls) | lines | each { from json }
}
def test-on-stop-notifies-without-polluting-stdout []: nothing -> nothing {
    let root = fixture
    let result = {} | run-on-stop $root
    assert equal $result.exit_code 0 $result.stderr
    assert equal $result.stdout ''
    assert ($result.stderr | str contains 'notification output')
    assert equal (calls $root | get command) [agent-manager-hook notify]
    rm --permanent --recursive $root
}
def test-on-stop-accepts-pi-from-running-extensions []: nothing -> nothing {
    let root = fixture
    let hook = $root | path join hooks on_stop
    let result = {} | environment $root | run-in $root {
        ^$hook pi
    }
    assert equal $result.exit_code 0 $result.stderr
    assert equal $result.stdout ''
    assert ($result.stderr | str contains 'notification output')
    assert equal (calls $root | get command) [agent-manager-hook notify]
    rm --permanent --recursive $root
}
def test-on-stop-propagates-notification-failures []: nothing -> nothing {
    let root = fixture
    let result = {HOOK_TEST_NOTIFY_EXIT: '22'} | run-on-stop $root
    assert equal $result.exit_code 22
    assert equal $result.stdout ''
    rm --permanent --recursive $root
}
def test-notify-linux-posts-to-ntfy []: nothing -> nothing {
    let root = fixture
    let request = $root | path join request.nuon
    let variables = {NTFY_CHANNEL_DESKTOP: test-topic, HOOK_TEST_HTTP: $request}
    let result = $variables | call-notify $root "notify-ntfy agent-config '@machine'"
    assert equal $result.exit_code 0 $result.stderr
    assert equal (open $request) [
        --headers
        {Title: agent-config}
        --max-time
        10sec
        https://ntfy.sh/test-topic
        '@machine'
    ]
    rm --permanent --recursive $root
}
def test-notify-macos-uses-terminal-notifier []: nothing -> nothing {
    let root = fixture
    let result = {} | call-notify $root "notify-macos agent-config '@machine'"
    assert equal $result.exit_code 0 $result.stderr
    let notification = calls $root | first
    assert equal $notification.command terminal-notifier
    assert equal $notification.args [-title agent-config -message '@machine' -sound default]
    rm --permanent --recursive $root
}
def test-notify-skips-focused-agent-pane []: nothing -> nothing {
    for clients in [
        "%4 attached,focused,UTF-8\n"
        "%5 attached,focused\n%4 attached\n%4 attached,focused\n"
    ] {
        let root = fixture
        let result = {TMUX_PANE: '%4', HOOK_TEST_TMUX_CLIENTS: $clients} | run-notify $root
        assert equal $result.exit_code 0 $result.stderr
        assert equal $result.stdout ''
        assert equal (calls $root | get command) [tmux]
        rm --permanent --recursive $root
    }
}
def test-notify-detects-unfocused-agent-pane []: nothing -> nothing {
    for clients in [
        "%4 attached,UTF-8\n"
        "%5 attached,focused\n"
        ''
        "%40 attached,focused\n"
        "%4 attached,unfocused\n"
    ] {
        let root = fixture
        let variables = {TMUX_PANE: '%4', HOOK_TEST_TMUX_CLIENTS: $clients}
        let result = $variables | call-notify $root 'pane-focused | to nuon'
        assert equal $result.exit_code 0 $result.stderr
        assert equal ($result.stdout | str trim) 'false' $clients
        rm --permanent --recursive $root
    }
}
def test-notify-propagates-tmux-failures []: nothing -> nothing {
    let root = fixture
    let result = {TMUX_PANE: '%4', HOOK_TEST_TMUX_EXIT: '7'} | run-notify $root
    assert equal $result.exit_code 7
    assert equal (calls $root | get command) [tmux]
    rm --permanent --recursive $root
}
def test-notify-fails-without-ntfy-topic []: nothing -> nothing {
    let root = fixture
    let result = {} | run-notify $root
    assert not equal $result.exit_code 0
    assert str contains $result.stderr NTFY_CHANNEL_DESKTOP
    rm --permanent --recursive $root
}
