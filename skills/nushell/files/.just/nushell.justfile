set working-directory := '..'

test *ARGS:
    nu scripts/nushell-test.nu . {{ARGS}}

check:
    #!/usr/bin/env nu
    use std/assert
    use '{{ justfile_directory() }}/scripts/nushell-files.nu' discover
    let files = discover
    for file in $files { assert (nu-check --debug $file) }
    if not ($files | is-empty) {
        ^nu-lint --config nu-lint.toml ...$files
    }

fix:
    #!/usr/bin/env nu
    use '{{ justfile_directory() }}/scripts/nushell-files.nu' discover
    let files = discover
    if not ($files | is-empty) {
        ^nu-lint --config nu-lint.toml --fix ...$files
    }
