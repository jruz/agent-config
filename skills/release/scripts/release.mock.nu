#!/usr/bin/env nu

use std/assert

def --wrapped main [
    ...arguments: string # GitHub API arguments
]: nothing -> nothing {
    assert equal $arguments [api 'repos/{owner}/{repo}/releases/latest']
    print --no-newline $env.NU_RELEASE_TEST_RESPONSE
}
