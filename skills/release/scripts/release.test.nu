use std/assert

const SCRIPT = path self | path dirname | path join ../files/scripts/release.nu
const MOCK = path self | path dirname | path join release.mock.nu
const DIGEST = 'sha256:0000000000000000000000000000000000000000000000000000000000000000'
const HASH = 'sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
const PLATFORMS = {
    x86_64-linux: {asset: fixture-unknown-linux-musl-x86_64, hash: $HASH}
    aarch64-linux: {asset: fixture-unknown-linux-musl-aarch64, hash: $HASH}
    x86_64-darwin: {asset: fixture-apple-darwin-x86_64, hash: $HASH}
    aarch64-darwin: {asset: fixture-apple-darwin-aarch64, hash: $HASH}
}

def fixture []: nothing -> path {
    let root = (mktemp --directory)
    mkdir ($root | path join project) ($root | path join bin)
    cp $MOCK ($root | path join bin gh)
    ^chmod +x ($root | path join bin gh)
    '[package]
name = "fixture"
version = "0.1.0"
' | save ($root | path join project Cargo.toml)
    $root
}

def invoke [root: path, arguments: list<string>]: nothing -> record {
    cd ($root | path join project)
    let assets = ($PLATFORMS
        | values
        | each {|platform| {name: $platform.asset, digest: $DIGEST} })
    with-env {
        PATH: ($env.PATH | prepend ($root | path join bin))
        NU_RELEASE_TEST_RESPONSE: ({tag_name: v1.2.3, assets: $assets} | to json)
    } {
        ^nu $SCRIPT ...$arguments | complete
    }
}

def test-manifest-generate-creates-manifest-without-git []: nothing -> nothing {
    let root = fixture
    let result = (invoke $root [manifest-generate])
    assert equal $result.exit_code 0 $result.stderr
    let manifest = (open ($root | path join project release.json))
    assert equal $manifest {version: '1.2.3', platforms: $PLATFORMS}
    assert not ($root | path join project .git | path exists)
    rm --permanent --recursive $root
}

def test-manifest-generate-replaces-an-existing-manifest []: nothing -> nothing {
    let root = fixture
    '{}' | save ($root | path join project release.json)
    let result = (invoke $root [manifest-generate])
    assert equal $result.exit_code 0 $result.stderr
    let manifest = (open ($root | path join project release.json))
    assert equal $manifest {version: '1.2.3', platforms: $PLATFORMS}
    rm --permanent --recursive $root
}

def test-publish-skips-when-manifest-matches-cargo-version []: nothing -> nothing {
    let root = fixture
    {version: '0.1.0', platforms: $PLATFORMS} | to json | save ($root | path join project release.json)
    let result = (invoke $root [publish])
    assert equal $result.exit_code 0 $result.stderr
    assert str contains $result.stderr 'release.json already at 0.1.0, skipping'
    rm --permanent --recursive $root
}
