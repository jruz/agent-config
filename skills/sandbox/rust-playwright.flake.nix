{
  description = "DevShell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-25.11";
    nixpkgs-unstable.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
    compose.url = "git+https://codeberg.org/jruz/compose.git?ref=refs/tags/v0.4.1";
  };

  outputs =
    {
      nixpkgs,
      nixpkgs-unstable,
      rust-overlay,
      flake-utils,
      compose,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
        pkgs-unstable = import nixpkgs-unstable { inherit system; };
        rustToolchain = builtins.fromTOML (builtins.readFile ./rust-toolchain.toml);
        rustVersion = rustToolchain.toolchain.channel;
        rust = pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
        composePackage = compose.packages.${system}.default;

        commonPackages = with pkgs; [
          composePackage
          git
          just
          pkgs-unstable.nushell
          ripgrep
          sops
          taplo
        ];

        sandboxPackages = with pkgs; [
          cargo-nextest
          cargo-watch
          nodePackages.pnpm
          nodejs_24
          openssl
          pkg-config
          rust
          sqlx-cli
        ];

        sandboxPath = pkgs.lib.makeBinPath (
          commonPackages
          ++ sandboxPackages
          ++ (with pkgs; [
            bash
            coreutils
            gnugrep
            gnused
            stdenv.cc
          ])
        );

        sandbox = pkgs.writeShellScriptBin "sandbox" ''
          ARGS=(
            --unshare-user
            --unshare-ipc
            --unshare-uts
            --unshare-cgroup
            --die-with-parent
            --dev /dev
            --proc /proc
            --ro-bind /nix /nix
            --ro-bind /etc/resolv.conf /etc/resolv.conf
            --symlink ${pkgs.coreutils}/bin/env /usr/bin/env
            --symlink ${pkgs.bash}/bin/bash /bin/sh
            --tmpfs "$HOME"
            --bind "$(pwd)" "$(pwd)"
            --bind /tmp /tmp
            --setenv PATH "${sandboxPath}"
            --setenv HOME "$HOME"
            --setenv TERM "''${TERM:-xterm}"
            --setenv OPENSSL_DIR "${pkgs.openssl.dev}"
            --setenv OPENSSL_LIB_DIR "${pkgs.openssl.out}/lib"
            --setenv OPENSSL_INCLUDE_DIR "${pkgs.openssl.dev}/include"
            --setenv PKG_CONFIG_PATH "${pkgs.openssl.dev}/lib/pkgconfig"
            --setenv C_INCLUDE_PATH "${pkgs.openssl.dev}/include"
            --setenv LIBRARY_PATH "${pkgs.openssl.out}/lib"
            --setenv LD_LIBRARY_PATH "${pkgs.openssl.out}/lib"
            --setenv npm_config_store_dir "$HOME/.local/share/pnpm/store"
          )

          [[ -d /etc/ssl ]] && ARGS+=(--ro-bind /etc/ssl /etc/ssl)
          [[ -d /etc/static ]] && ARGS+=(--ro-bind /etc/static /etc/static)
          [[ -d /run/current-system/sw ]] && ARGS+=(--ro-bind /run/current-system/sw /run/current-system/sw)

          [[ -f "$HOME/.gitconfig" ]] && ARGS+=(--ro-bind "$HOME/.gitconfig" "$HOME/.gitconfig")
          [[ -f "$HOME/.ssh/known_hosts" ]] && ARGS+=(--ro-bind "$HOME/.ssh/known_hosts" "$HOME/.ssh/known_hosts")

          mkdir -p "$HOME/.cargo"
          ARGS+=(--bind "$HOME/.cargo" "$HOME/.cargo")

          mkdir -p "$HOME/.local/share/pnpm"
          ARGS+=(--bind "$HOME/.local/share/pnpm" "$HOME/.local/share/pnpm")


          ${pkgs.lib.optionalString pkgs.stdenv.isLinux ''
            ARGS+=(
              --setenv LOCALE_ARCHIVE "${pkgs.glibcLocales}/lib/locale/locale-archive"
              --setenv NIX_LD_LIBRARY_PATH "${
                pkgs.lib.makeLibraryPath [
                  pkgs.stdenv.cc.cc
                  pkgs.openssl
                  pkgs.glibc
                ]
              }"
              --setenv NIX_LD "${pkgs.stdenv.cc.bintools.dynamicLinker}"
            )
          ''}

          exec ${pkgs.bubblewrap}/bin/bwrap "''${ARGS[@]}" -- "$@"
        '';

        darwinPackages = with pkgs; [
          libiconv
        ];

        linuxPackages = with pkgs; [
          docker-client
          glibc
          glibcLocales
        ];

        platformPackages = if pkgs.stdenv.isDarwin then darwinPackages else linuxPackages;

      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = commonPackages ++ platformPackages ++ [ sandbox ];

          shellHook = ''
            echo ""
            echo "  Trader Dev Shell"
            echo "  ───────────────────────────"
            echo "  rust         ${rustVersion} (sandbox)"
            echo "  node         ${pkgs.nodejs_24.version} (sandbox)"
            echo "  pnpm         ${pkgs.nodePackages.pnpm.version} (sandbox)"
            echo "  compose      ${composePackage.version}"
            echo ""
          '';
        };
      }
    );
}
