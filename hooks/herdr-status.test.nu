use std/assert

const HOOK = path self | path dirname | path join herdr-status
const MOCK = path self | path dirname | path join herdr-status.mock.nu

def fixture []: nothing -> string {
    let root = mktemp --directory
    cp $MOCK ($root | path join ps)
    ^chmod +x ($root | path join ps)
    $'#!/usr/bin/env nu

def save [--raw --force target: string]: string -> nothing {
    {target: $target payload: $in} | to nuon out> $env.HERDR_TEST_OUTPUT
}
source ($HOOK | to nuon)
' | save --raw ($root | path join runner)
    ^chmod +x ($root | path join runner)
    $root
}

def run-hook [root: path, request: record<state: string mode: string>]: nothing -> record {
    with-env {
        PATH: ([$root] | append $env.PATH)
        HC_TERMINAL_ID: 'synthetic-terminal'
        HERDR_TEST_MODE: $request.mode
        HERDR_TEST_OUTPUT: ($root | path join output.nuon)
    } {
        let runner = $root | path join runner
        ^$runner $request.state | complete
    }
}

def test-outside-herdr-does-nothing []: nothing -> nothing {
    hide-env --ignore-errors HC_TERMINAL_ID
    let result = ^$HOOK state=working | complete
    assert equal $result.exit_code 0 $result.stderr
    assert equal $result.stdout ''
    assert equal $result.stderr ''
}

def test-writes-status-to-ancestor-terminal []: nothing -> nothing {
    let root = fixture
    for record in ['state=idle' 'state=working' 'state=done' 'state=blocked:kind=permission'] {
        let result = run-hook $root {state: $record mode: terminal}
        assert equal $result.exit_code 0 $result.stderr
        assert equal $result.stdout ''
        assert equal $result.stderr ''
        let output = open ($root | path join output.nuon)
        assert equal $output.target '/dev/null'
        assert equal $output.payload $"\u{1b}]7501;($record):app=claude\u{1b}\\"
    }
    rm --permanent --recursive $root
}

def test-no-terminal-reports-failure []: nothing -> nothing {
    let root = fixture
    let result = run-hook $root {state: 'state=done' mode: detached}
    assert equal $result.exit_code 1
    assert equal $result.stdout ''
    assert str contains $result.stderr 'herdr-status: no terminal found for record state=done'
    rm --permanent --recursive $root
}

def test-process-query-failure-propagates []: nothing -> nothing {
    let root = fixture
    let result = run-hook $root {state: 'state=working' mode: failure}
    assert not equal $result.exit_code 0
    assert str contains $result.stderr 'synthetic-ps-failure'
    rm --permanent --recursive $root
}
