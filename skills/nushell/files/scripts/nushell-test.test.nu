use std/assert

const RUNNER = path self | path dirname | path join nushell-test.nu

def fixture []: list<string> -> path {
    let lines = $in
    let root = mktemp --directory
    $lines | str join (char newline) | save ($root | path join fixture.test.nu)
    $root
}

def invoke [root: path, --no-capture]: nothing -> record {
    let flags = if $no_capture { [--no-capture] } else { [] }
    ^nu $RUNNER $root ...$flags | complete
}

def test-runner-hides-passing-test-output []: nothing -> nothing {
    let root = [
        'def test-output [] {'
        '    print --no-newline "test stdout without newline"'
        '    print --stderr --no-newline "test stderr without newline"'
        '}'
    ] | fixture
    let result = invoke $root
    assert equal $result.exit_code 0 $result.stderr
    assert not ($result.stdout | str contains 'test stdout without newline')
    assert equal $result.stderr ''
    assert equal ($result.stdout | lines | where $it =~ '^  ✓') ['  ✓ test-output']
    assert not ($result.stdout | str contains '✓ passed')
    assert not ($result.stdout | str contains '▶')
    assert str contains ($result.stdout | ansi strip) '[OK] All tests pass'
    rm --permanent --recursive $root
}

def test-runner-preserves-failing-test-output []: nothing -> nothing {
    let root = [
        'use std/assert'
        'def test-failure [] {'
        '    print "stdout before failure"'
        '    print --stderr "stderr before failure"'
        '    assert equal 1 2'
        '}'
    ] | fixture
    let result = invoke $root
    assert equal $result.exit_code 1
    assert str contains $result.stdout 'stdout before failure'
    assert str contains $result.stderr 'stderr before failure'
    assert str contains $result.stderr 'These are not equal'
    assert equal ($result.stdout | lines | where $it =~ '^  ✗') ['  ✗ test-failure']
    assert str contains $result.stdout 'Results: 0 passed, 1 failed'
    rm --permanent --recursive $root
}

def test-runner-streams-output-with-no-capture []: nothing -> nothing {
    let root = [
        'def test-output [] {'
        '    print "live stdout"'
        '    print --stderr "live stderr"'
        '}'
    ] | fixture
    let result = invoke $root --no-capture
    assert equal $result.exit_code 0 $result.stderr
    assert str contains $result.stdout 'live stdout'
    assert str contains $result.stdout 'live stderr'
    assert str contains ($result.stdout | ansi strip) '[OK] All tests pass'
    rm --permanent --recursive $root
}

def test-runner-no-capture-preserves-failure-status []: nothing -> nothing {
    let root = [
        'use std/assert'
        'def test-failure [] {'
        '    print "live failure output"'
        '    assert equal 1 2'
        '}'
    ] | fixture
    let result = invoke $root --no-capture
    assert equal $result.exit_code 1
    assert str contains $result.stdout 'live failure output'
    assert str contains $result.stdout 'These are not equal'
    assert str contains $result.stdout 'Results: 0 passed, 1 failed'
    assert not ($result.stdout | ansi strip | str contains '[OK] All tests pass')
    rm --permanent --recursive $root
}

def test-runner-supports-apostrophes-in-paths []: nothing -> nothing {
    let root = ['def test-example [] { true }'] | fixture
    let suite = $root | path join "user's-tests"
    mkdir $suite
    mv ($root | path join fixture.test.nu) ($suite | path join fixture.test.nu)
    for stream in [false true] {
        let result = if $stream { invoke $suite --no-capture } else { invoke $suite }
        assert equal $result.exit_code 0 $result.stderr
        assert str contains $result.stdout 'Results: 1 passed, 0 failed'
    }
    rm --permanent --recursive $root
}

def test-runner-empty-directory-succeeds []: nothing -> nothing {
    let root = mktemp --directory
    let result = invoke $root
    assert equal $result.exit_code 0 $result.stderr
    assert str contains $result.stdout 'No tests found.'
    rm --permanent --recursive $root
}
