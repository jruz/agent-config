package-name := `nu --commands 'open Cargo.toml | get package.name'`
host-os := if os() == 'macos' { 'apple-darwin' } else { 'unknown-linux-musl' }
host-binary := 'target/dist/' + package-name + '-' + host-os + '-' + arch()

build TARGET PROFILE:
    nu scripts/build.nu {{ TARGET }} {{ PROFILE }}

build-host:
    just rust::build {{ arch() }}-{{ host-os }} fast

install:
    just rust::build-host
    install \
        --directory \
        --mode=755 \
        "$HOME/.cargo/bin"
    install \
        --mode=755 \
        {{ host-binary }} \
        "$HOME/.cargo/bin/{{ package-name }}"

run *ARGS='':
    just rust::build-host
    {{ host-binary }} {{ ARGS }}
