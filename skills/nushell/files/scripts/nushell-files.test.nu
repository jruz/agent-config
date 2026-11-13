use std/assert
use nushell-files.nu discover

def fixture []: nothing -> path {
    let root = mktemp --directory
    ^git init --initial-branch main $root
    $root
}

def discover-in [root: path]: nothing -> list<string> {
    cd $root
    discover
}

def test-discover-hidden-modules []: nothing -> nothing {
    let root = fixture
    mkdir ($root | path join .hidden nested)
    '' | save ($root | path join module.nu)
    '' | save ($root | path join .hidden nested module.nu)
    let files = discover-in $root
    assert equal $files ([
        ($root | path join .hidden nested module.nu)
        ($root | path join module.nu)
    ] | sort)
    rm --permanent --recursive $root
}

def test-discover-respects-ignore-files []: nothing -> nothing {
    let root = fixture
    mkdir ($root | path join ignored)
    'ignored/' | save ($root | path join .gitignore)
    'local.nu' | save ($root | path join .ignore)
    'fd-only.nu' | save ($root | path join .fdignore)
    for name in [ignored/module.nu .git/module.nu local.nu fd-only.nu] {
        '' | save ($root | path join $name)
    }
    '#!/usr/bin/env nu' | save ($root | path join ignored command)
    '' | save ($root | path join included.nu)
    assert equal (discover-in $root) [($root | path join included.nu)]
    rm --permanent --recursive $root
}

def test-discover-extensionless-nushell-scripts []: nothing -> nothing {
    let root = fixture
    for script in [
        {name: env, shebang: '#!/usr/bin/env nu'}
        {name: split, shebang: '#!/usr/bin/env -S nu --no-config-file'}
        {name: direct, shebang: '#!/nix/store/example/bin/nu'}
        {name: bash, shebang: '#!/usr/bin/env bash'}
        {name: similar, shebang: '#!/usr/bin/env nufmt'}
    ] {
        $script.shebang | save ($root | path join $script.name)
    }
    0x[000102ff] | save ($root | path join binary)
    '' | save ($root | path join empty)
    'echo nu' | save ($root | path join plain)
    assert equal (discover-in $root) ([direct env split]
        | each {|name| $root | path join $name }
        | sort)
    rm --permanent --recursive $root
}

def test-discover-empty-project []: nothing -> nothing {
    let root = fixture
    assert equal (discover-in $root) []
    rm --permanent --recursive $root
}
