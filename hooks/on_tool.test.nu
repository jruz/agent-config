use std/assert
const HOOK = path self | path dirname | path join on_tool
const MOCK = path self | path dirname | path join notify.mock.nu

def fixture []: nothing -> string {
    let root = mktemp --directory
    mkdir ($root | path join bin)
    '' | save ($root | path join calls)
    $root
}

def run-hook [root: path, code: string]: nothing -> record {
    with-env {
        HOME: $root
        PATH: [($root | path join bin) ($nu.current-exe | path dirname)]
        HOOK_TEST_CALLS: ($root | path join calls)
        HOOK_TEST_AGENT_TOOL_CHECK_EXIT: $code
    } {
        ^$HOOK claude | complete
    }
}

def test-missing-checker-fails-with-actionable-error []: nothing -> nothing {
    let root = fixture
    let result = run-hook $root '0'
    assert equal $result.exit_code 1
    assert equal $result.stdout ''
    assert str contains $result.stderr 'Missing required tool: agent-tool-check'
    assert str contains $result.stderr 'on PATH'
    assert equal (open --raw ($root | path join calls)) ''
    rm --permanent --recursive $root
}

def test-checker-receives-agent-and-propagates-exit-status []: nothing -> nothing {
    for code in ['0' '7'] {
        let root = fixture
        let checker = $root | path join bin agent-tool-check
        cp $MOCK $checker
        ^chmod +x $checker
        let result = run-hook $root $code
        assert equal $result.exit_code ($code | into int) $result.stderr
        let call = open --raw ($root | path join calls) | from json
        assert equal $call.command agent-tool-check
        assert equal $call.args [claude]
        rm --permanent --recursive $root
    }
}
