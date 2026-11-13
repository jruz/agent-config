#!/usr/bin/env -S nu --stdin
use std/log
# Record Docker calls without starting containers.
def --wrapped main [
    ...args: string # Docker arguments to record.
]: nothing -> nothing {
    let input = if $args.0 == 'build' { $in | collect } else { null }
    {
        args: $args
        input: $input
    } | to json --raw | $"($in)\n" | save --append $env.NU_SANDBOX_TEST_CALLS
    if $args.0 == $env.NU_SANDBOX_TEST_FAIL {
        log error $"Mock Docker failure: ($args.0)"
        exit ($env.NU_SANDBOX_TEST_EXIT | into int)
    }
    if $args.0 == 'image' and $env.NU_SANDBOX_TEST_CACHED == 'true' {
        print 'fixture-image-id'
    }
}
