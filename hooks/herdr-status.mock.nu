#!/usr/bin/env nu

def --wrapped main [...args: string]: nothing -> nothing {
    if $env.HERDR_TEST_MODE == 'failure' {
        print --stderr 'synthetic-ps-failure'
        exit 7
    }

    if $env.HERDR_TEST_MODE == 'detached' {
        print '1'
        return
    }

    match $args {
        ['-o' 'ppid=' '-p' '111'] => { print '222' }
        ['-o' 'ppid=' '-p' _] => { print '111' }
        ['-o' 'tty=' '-p' '111'] => { print '??' }
        ['-o' 'tty=' '-p' '222'] => { print 'null' }
    }
}
