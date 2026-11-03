{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-26.05";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      rust-overlay,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
        rust = pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
        rustPlatform = pkgs.makeRustPlatform {
          cargo = rust;
          rustc = rust;
        };
        rustToolchain = builtins.fromTOML (builtins.readFile ./rust-toolchain.toml);
        rustVersion = rustToolchain.toolchain.channel;
        cargoToml = builtins.fromTOML (builtins.readFile ./Cargo.toml);
        revision = self.rev or "dirty";
        playwrightBrowsers = pkgs.playwright-driver.browsers;
        pnpmPackage = pkgs.pnpm.override { nodejs-slim = pkgs.nodejs-slim_24; };
        sandboxPath = pkgs.lib.makeBinPath (
          with pkgs;
          [
            rust
            bash
            cargo-edit
            cargo-machete
            cargo-nextest
            cargo-outdated
            cargo-watch
            coreutils
            findutils
            git
            gnugrep
            gnused
            just
            mold
            nodejs_24
            nushell
            pnpmPackage
            stdenv.cc
          ]
        );
        sandbox = pkgs.writeShellScriptBin "sandbox" ''
          SELF_DIR="$(dirname "$(readlink -f "$0")")"
          ARGS=(
            --unshare-all
            --share-net
            --die-with-parent
            --clearenv
            --ro-bind /nix /nix
            --ro-bind /etc/resolv.conf /etc/resolv.conf
            --ro-bind /etc/ssl /etc/ssl
            --ro-bind-try /etc/static /etc/static
            --ro-bind-try /etc/nix /etc/nix
            --ro-bind-try /run/current-system/sw /run/current-system/sw
            --symlink ${pkgs.coreutils}/bin/env /usr/bin/env
            --symlink ${pkgs.bash}/bin/bash /bin/sh
            --tmpfs "$HOME"
            --tmpfs /tmp
            --bind "$(pwd)" "$(pwd)"
            --ro-bind "$(git rev-parse --path-format=absolute --git-common-dir)" "$(git rev-parse --path-format=absolute --git-common-dir)"
            --ro-bind-try "$HOME/.gitconfig" "$HOME/.gitconfig"
            --ro-bind-try "$HOME/.ssh/known_hosts" "$HOME/.ssh/known_hosts"
            --setenv PATH "${sandboxPath}:$SELF_DIR"
            --setenv HOME "$HOME"
            --setenv TMPDIR /tmp
            --setenv PLAYWRIGHT_BROWSERS_PATH "${playwrightBrowsers}"
            --setenv PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS "true"
            --setenv pnpm_config_store_dir "$HOME/.local/share/pnpm/store"
            --dev /dev
            --proc /proc
          )
          ARGS+=(
            --bind-try "$HOME/.cargo/registry" "$HOME/.cargo/registry"
            --bind-try "$HOME/.cargo/git" "$HOME/.cargo/git"
            --bind-try "$HOME/.local/share/pnpm" "$HOME/.local/share/pnpm"
            --bind-try "$HOME/.cache/pnpm" "$HOME/.cache/pnpm"
            --setenv pnpm_config_cache_dir "$HOME/.cache/pnpm"
          )
          exec ${pkgs.bubblewrap}/bin/bwrap "''${ARGS[@]}" -- "$@"
        '';
        defaultPackages =
          with pkgs;
          [
            deadnix
            fd
            just
            nixfmt
            nu-lint
            nushell
            sandbox
            statix
          ]
          ++ pkgs.lib.optionals pkgs.stdenv.isLinux [
            glibc
            glibcLocales
          ];
      in
      {
        packages.default = rustPlatform.buildRustPackage {
          pname = cargoToml.package.name;
          inherit (cargoToml.package) version;
          src = ./.;
          cargoLock.lockFile = ./Cargo.lock;
          REVISION = revision;
          CARGO_HOME = "$TMPDIR";
          doCheck = false;
          nativeBuildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.mold ];
          buildInputs = pkgs.lib.optionals pkgs.stdenv.isDarwin [ pkgs.libiconv ];
        };

        devShells.default = pkgs.mkShell {
          packages = defaultPackages;

          shellHook = ''
            echo ""
            echo "  ${cargoToml.package.name} Development Shell"
            echo "  ───────────────────────────"
            echo "  nixpkgs      ${pkgs.lib.trivial.release}"
            echo "  rust         ${rustVersion} (sandbox)"
            echo "  node         ${pkgs.nodejs_24.version} (sandbox)"
            echo "  pnpm         ${pnpmPackage.version} (sandbox)"
            echo "  playwright   ${pkgs.playwright-driver.version} (sandbox)"
            echo ""
          ''
          + pkgs.lib.optionalString pkgs.stdenv.isLinux ''
            export LOCALE_ARCHIVE="${pkgs.glibcLocales}/lib/locale/locale-archive"
          '';
        };
      }
    );
}
