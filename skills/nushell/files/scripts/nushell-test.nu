#!/usr/bin/env nu

use std/log

def get-test-files [root: path]: nothing -> list<string> {
    let files = (^fd --hidden --type file --absolute-path --exclude .git
        '\.test\.nu$' $root)
    $files | lines | sort
}

def find-tests-in-file [file: path]: nothing -> list<record> {
    let content = open --raw $file
    let tests = ($content
        | lines
        | where $it =~ '^(export )?def test[-_]'
        | parse --regex '^(?:export )?def (?<test_name>test[-_][\w-]+)'
        | get test_name)
    if ($tests | is-empty) {
        return []
    }
    [
        {file: $file, tests: $tests}
    ]
}

def discover-all-tests []: list<string> -> list<record> {
    mut tests = []
    for file in $in {
        $tests ++= (find-tests-in-file $file)
    }
    $tests
}

def test-command [file: path, test_name: string]: nothing -> string {
    $"source ($file | to nuon --raw); ($test_name)"
}

def run-test [file: path, test_name: string]: nothing -> record {
    let command = test-command $file $test_name
    let result = (^$nu.current-exe --commands $command | complete)
    {
        passed: ($result.exit_code == 0)
        stdout: $result.stdout
        stderr: $result.stderr
    }
}

def count-results [results: list<record>]: nothing -> record {
    let passed = ($results | where passed | length)
    let failed = ($results | where not $it.passed | length)
    {passed: $passed, failed: $failed}
}

def print-result []: record -> nothing {
    let result = $in
    let mark = if $result.passed { '✓' } else { '✗' }
    print $"  ($mark) ($result.test)"
    if $result.passed { return }
    if ($result.stdout | is-not-empty) {
        print --no-newline $result.stdout
    }
    if ($result.stderr | is-not-empty) {
        log error $result.stderr
    }
}

# Run Nushell tests beneath a directory.
def main [
    root: path # Directory to search for .test.nu files.
    --no-capture # Stream combined test stdout and stderr live.
]: nothing -> nothing {
    let nu_files = get-test-files $root
    print $"Scanning ($nu_files | length) Nushell files for tests...\n"
    let all_tests = $nu_files | discover-all-tests
    if ($all_tests | is-empty) {
        print 'No tests found.'
        return
    }
    let total_tests = ($all_tests | each {|item| $item.tests | length } | math sum)
    print $"Found ($total_tests) tests in ($all_tests | length) files\n"
    mut results = []
    for suite in $all_tests {
        print ($suite.file | path basename)
        for test in $suite.tests {
            let result = if $no_capture {
                let command = test-command $suite.file $test
                let streamed = (^$nu.current-exe --commands $command
                    out+err>| tee { print --no-newline }
                    | complete)
                {passed: ($streamed.exit_code == 0), stdout: '', stderr: ''}
            } else {
                run-test $suite.file $test
            }
            let named = $result | insert test $test
            $named | print-result
            $results ++= [$named]
        }
        print ''
    }
    let counts = count-results $results
    print $"Results: ($counts.passed) passed, ($counts.failed) failed"
    if $counts.failed > 0 {
        exit 1
    }
    print $"[(ansi green)OK(ansi reset)] All tests pass"
}
