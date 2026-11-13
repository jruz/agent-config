use std/assert
const WRAPPER = path self | path dirname | path join ../files/scripts/sandbox.nu
const DOCKER = path self | path dirname | path join sandbox.mock.nu
const READY = {cached: true, fail: none, code: 0}
const ENGINES = {bun: '1.2.3', node: '22.0.0', pnpm: '10.0.0'}
def fixture []: nothing -> string {
    let root = mktemp --directory
    mkdir ($root | path join project) ($root | path join home) ($root | path join bin)
    ^git init --initial-branch main ($root | path join project)
    cp $DOCKER ($root | path join bin docker)
    ^chmod +x ($root | path join bin docker)
    {engines: $ENGINES} | to json | save ($root | path join project package.json)
    '' | save ($root | path join calls)
    $root
}
def add-node-image [root: path]: nothing -> nothing {
    'FROM node:fixture' | save ($root | path join project Dockerfile.node)
}
def add-rust-image [root: path]: nothing -> nothing {
    'FROM rust:fixture' | save ($root | path join project Dockerfile.rust)
    '[toolchain]
channel = "1.85.0"
' | save ($root | path join project rust-toolchain.toml)
}
def invoke [root: path, args: list<string>]: record -> record { let state = $in
cd ($root | path join project)
with-env {
        HOME: ($root | path join home)
        PATH: ($env.PATH | prepend ($root | path join bin))
        NU_SANDBOX_TEST_CALLS: ($root | path join calls)
        NU_SANDBOX_TEST_CACHED: ($state.cached | into string)
        NU_SANDBOX_TEST_FAIL: $state.fail
        NU_SANDBOX_TEST_EXIT: ($state.code | into string)
        NU_SANDBOX_TEST_NOT_FORWARDED: synthetic-value
    } {
        ^nu $WRAPPER ...$args | complete
    } }
def calls [root: path]: nothing -> list<record> {
    open --raw ($root | path join calls) | lines | each { from json }
}
def run-image [root: path, args: list<string>]: nothing -> string {
    let result = $READY | invoke $root $args
    assert equal $result.exit_code 0 $result.stderr
    calls $root | last | get args | drop ($args | length) | last
}
def save-config [root: path]: record -> nothing {
    to json | save --force ($root | path join project sandbox.json)
}
def test-sandbox-selects-supported-runtimes []: nothing -> nothing {
    let root = fixture
    add-node-image $root
    add-rust-image $root
    for runtime in [
        {
            image: '^oven/bun:1\.2\.3$'
            commands: [bun]
        }
        {
            image: '^sandbox-node:'
            commands: [node pnpm]
        }
        {
            image: '^sandbox-rust:'
            commands: [
                cargo
                cargo-nextest
                rustc
                rustup
                rustfmt
                rust-analyzer
                sqlx
            ]
        }
    ] {
        for command in $runtime.commands { assert ((run-image $root [$command --version]) =~ $runtime.image) $command }
    }
    rm --permanent --recursive $root
}
def test-sandbox-rejects-unknown-commands []: nothing -> nothing {
    let root = fixture
    for command in [
        bash
        sh
        npm
        python
        bunx
        not-cargo
        cargofoo
    ] {
        let result = $READY | invoke $root [$command]
        assert equal $result.exit_code 1 $command
        assert str contains $result.stderr $"unknown command: ($command)"
    }
    assert equal (calls $root) []
    rm --permanent --recursive $root
}
def test-sandbox-accepts-valid-configuration []: nothing -> nothing {
    let root = fixture
    {entries: []} | to yaml | save ($root | path join project custom.yaml)
    for config in [
        {}
        {
            readonlyHomeDirectories: []
        }
        {
            readonlyHomeDirectories: [.config/example]
        }
        {agerManifest: custom.yaml}
        {
            agerManifest: custom.yaml
            readonlyHomeDirectories: []
        }
    ] {
        $config | save-config $root
        let result = $READY | invoke $root [bun --version]
        assert equal $result.exit_code 0 $result.stderr
    }
    rm --permanent --recursive $root
}
def test-sandbox-rejects-invalid-configuration []: nothing -> nothing {
    let root = fixture
    let manifest_cases = [
        42
        null
        []
        [manifest.yaml]
    ] | each {|value| {
        config: {agerManifest: $value}
        error: $"sandbox.json: agerManifest must be string, got ($value | describe)"
    } }
    let home_cases = [
        42
        null
        directory
        [directory 42]
    ] | each {|value| {
        config: {readonlyHomeDirectories: $value}
        error: $"sandbox.json: readonlyHomeDirectories must be list<string>, got ($value | describe)"
    } }
    let unknown_case = {
        config: {unexpected: []}
        error: 'sandbox.json: unsupported keys: unexpected'
    }
    for case in [...$manifest_cases ...$home_cases $unknown_case] {
        $case.config | save-config $root
        let result = $READY | invoke $root [bun --version]
        assert equal $result.exit_code 1 $case.error
        assert str contains $result.stderr $case.error
    }
    assert equal (calls $root) []
    rm --permanent --recursive $root
}
def test-sandbox-image-tags-track-build-inputs []: nothing -> nothing {
    let root = fixture
    add-node-image $root
    let tag = run-image $root [node --version]
    assert ($tag =~ '^sandbox-node:[0-9a-f]{16}$')
    assert equal $tag (run-image $root [node --version])
    'FROM node:changed' | save --force ($root | path join project Dockerfile.node)
    let rebuilt = run-image $root [node --version]
    assert not equal $tag $rebuilt
    {engines: ($ENGINES | update node '23.0.0')} | to json | save --force ($root | path join project package.json)
    assert not equal $rebuilt (run-image $root [node --version])
    rm --permanent --recursive $root
}
def test-sandbox-omitted-manifest-is-not-read []: nothing -> nothing {
    let root = fixture
    '[' | save ($root | path join project ager.yaml)
    let result = $READY | invoke $root [bun --version]
    assert equal $result.exit_code 0 $result.stderr
    let run = calls $root | last | get args
    assert ('oven/bun:1.2.3' in $run)
    assert not ($run | any {|arg| $arg =~ 'src=/dev/null' })
    rm --permanent --recursive $root
}
def test-sandbox-masks-declared-manifest-entries []: nothing -> nothing {
    let root = fixture
    'synthetic fixture data' | save ($root | path join project masked.txt)
    {
        entries: [masked.txt absent.txt]
    } | to yaml | save ($root | path join project custom.yaml)
    {agerManifest: custom.yaml} | to json | save ($root | path join project sandbox.json)
    let result = $READY | invoke $root [bun --version]
    assert equal $result.exit_code 0 $result.stderr
    let run = calls $root | last | get args
    assert ('type=bind,src=/dev/null,dst=/app/masked.txt,readonly' in $run)
    assert not ($run | any {|arg| $arg =~ 'absent.txt' })
    rm --permanent --recursive $root
}
def test-sandbox-declared-manifest-must-exist []: nothing -> nothing {
    let root = fixture
    {agerManifest: missing.yaml} | to json | save ($root | path join project sandbox.json)
    let result = $READY | invoke $root [bun --version]
    assert ($result.exit_code != 0)
    assert str contains $result.stderr 'missing.yaml'
    assert equal (calls $root) []
    rm --permanent --recursive $root
}
def test-sandbox-mounts-home-directories-readonly []: nothing -> nothing {
    let root = fixture
    let existing = $root | path join home .config fixture
    mkdir $existing
    {
        readonlyHomeDirectories: [.config/fixture .config/absent]
    } | to json | save ($root | path join project sandbox.json)
    let result = $READY | invoke $root [bun --version]
    assert equal $result.exit_code 0 $result.stderr
    let run = calls $root | last | get args
    assert ($"type=bind,src=($existing),dst=($existing),readonly" in $run)
    assert not ($run | any {|arg| $arg =~ '\.config/absent' })
    rm --permanent --recursive $root
}
def test-sandbox-bun-uses-hardened-container-arguments []: nothing -> nothing {
    let root = fixture
    let result = $READY | invoke $root [bun run 'file with spaces.ts' --flag=value]
    assert equal $result.exit_code 0 $result.stderr
    let recorded = calls $root
    assert equal ($recorded | length) 1
    let run = $recorded.0.args
    assert equal ($run | first 10) [
        run
        --interactive
        --rm
        --user
        $"(^id --user | str trim):(^id --group | str trim)"
        --read-only
        --cap-drop
        ALL
        --security-opt
        no-new-privileges
    ]
    assert equal ($run | last 5) [oven/bun:1.2.3 bun run 'file with spaces.ts' --flag=value]
    assert ('/tmp:exec' in $run)
    assert (($root | path join home) in $run)
    assert ($"HOME=($root | path join home)" in $run)
    assert ($"type=bind,src=($root | path join project),dst=/app" in $run)
    assert ('/app/' in $run)
    assert ('TMPDIR=/tmp' in $run)
    assert not ('--tty' in $run)
    assert not ($run | any {|arg| $arg =~ 'NU_SANDBOX_TEST_NOT_FORWARDED' })
    rm --permanent --recursive $root
}
def test-sandbox-node-uses-cached-image-and-pnpm-caches []: nothing -> nothing {
    let root = fixture
    add-node-image $root
    let result = $READY | invoke $root [pnpm --version]
    assert equal $result.exit_code 0 $result.stderr
    let recorded = calls $root
    assert equal ($recorded | each {|call| $call.args | first }) [image run]
    assert equal ($recorded.0.args | first 3) [image ls --quiet]
    let run = $recorded.1.args
    assert equal ($run | last 2) [pnpm --version]
    let store = $root | path join home .local share pnpm
    let cache = $root | path join home .cache pnpm
    assert ($"type=bind,src=($store),dst=($store)" in $run)
    assert ($"type=bind,src=($cache),dst=($cache)" in $run)
    assert ($"pnpm_config_store_dir=($store)/store" in $run)
    assert ($"pnpm_config_cache_dir=($cache)" in $run)
    assert ($store | path exists)
    assert ($cache | path exists)
    rm --permanent --recursive $root
}
def test-sandbox-rust-uses-only-rust-metadata-and-caches []: nothing -> nothing {
    let root = fixture
    add-rust-image $root
    rm --permanent ($root | path join project package.json)
    let result = $READY | invoke $root [cargo-nextest run]
    assert equal $result.exit_code 0 $result.stderr
    let run = calls $root | last | get args
    assert equal ($run | last 2) [cargo-nextest run]
    for directory in [registry git] {
        let cache = $root | path join home .cargo $directory
        assert ($"type=bind,src=($cache),dst=($cache)" in $run)
        assert ($cache | path exists)
    }
    assert ($"CARGO_HOME=($root | path join home .cargo)" in $run)
    assert ('CARGO_TARGET_DIR=/app/target/docker' in $run)
    rm --permanent --recursive $root
}
def test-sandbox-builds-missing-runtime-images []: nothing -> nothing {
    let root = fixture
    add-node-image $root
    let result = $READY | update cached false | invoke $root [node --version]
    assert equal $result.exit_code 0 $result.stderr
    let recorded = calls $root
    assert equal ($recorded | each {|call| $call.args | first }) [image build run]
    let build = $recorded.1
    assert equal $build.input 'FROM node:fixture'
    assert ('NODE_VERSION=22.0.0' in $build.args)
    assert ('PNPM_VERSION=10.0.0' in $build.args)
    assert equal ($build.args | last) '-'
    assert ($build.args.2 in $recorded.2.args)
    rm --permanent --recursive $root
}
def test-sandbox-build-skips-cached-images []: nothing -> nothing {
    let root = fixture
    add-node-image $root
    add-rust-image $root
    let result = $READY | invoke $root [build]
    assert equal $result.exit_code 0 $result.stderr
    assert equal (calls $root | each {|call| $call.args | first }) [image image]
    rm --permanent --recursive $root
}
def test-sandbox-build-force-rebuilds-all-runtime-images []: nothing -> nothing {
    let root = fixture
    add-node-image $root
    add-rust-image $root
    let result = $READY | invoke $root [build --force]
    assert equal $result.exit_code 0 $result.stderr
    let recorded = calls $root
    assert equal ($recorded | each {|call| $call.args | first }) [build build]
    assert equal ($recorded | get input) ['FROM node:fixture' 'FROM rust:fixture']
    assert ('RUST_VERSION=1.85.0' in $recorded.1.args)
    rm --permanent --recursive $root
}
def test-sandbox-docker-failures-propagate []: nothing -> nothing {
    for stage in [image build run] {
        let root = fixture
        add-node-image $root
        let state = {
            cached: false
            fail: $stage
            code: 17
        }
        let result = $state | invoke $root [node --version]
        assert equal $result.exit_code 17 $result.stderr
        assert str contains $result.stderr $"Mock Docker failure: ($stage)"
        assert equal (
            calls $root | last | get args | first
        ) $stage
        rm --permanent --recursive $root
    }
}
