## Install from releases

Replace `<project>` with the Cargo package name.

Download the binary for your platform from [the latest release](https://github.com/jruz/<project>/releases/latest):

| Platform            | Download                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Linux x86_64        | [Download](https://github.com/jruz/<project>/releases/latest/download/<project>-unknown-linux-musl-x86_64)  |
| Linux ARM64         | [Download](https://github.com/jruz/<project>/releases/latest/download/<project>-unknown-linux-musl-aarch64) |
| macOS Intel         | [Download](https://github.com/jruz/<project>/releases/latest/download/<project>-apple-darwin-x86_64)        |
| macOS Apple Silicon | [Download](https://github.com/jruz/<project>/releases/latest/download/<project>-apple-darwin-aarch64)       |

For example, on Linux x86_64:

```sh
curl --fail --location --output <project> \
  https://github.com/jruz/<project>/releases/latest/download/<project>-unknown-linux-musl-x86_64
chmod +x <project>
./<project> --version
```

Move the binary into a directory on your `PATH` to run it from anywhere.

## Install with Nix

Requires Nix with flakes enabled. Replace `<project>` with the Cargo package name.

```sh
nix profile add github:jruz/<project>
```

Installs a published binary without compiling Rust. Supports Linux and macOS on x86_64 and aarch64.

Verify the installation:

```sh
<project> --version
```

Upgrade:

```sh
nix profile upgrade <project>
```

Run without installing:

```sh
nix run github:jruz/<project> -- --help
```

Build from source instead:

```sh
nix build github:jruz/<project>#source
```
