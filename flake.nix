{
  description = "Claude Code Config Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        sandboxPath = pkgs.lib.makeBinPath [
          pkgs.bash
          pkgs.bun
          pkgs.coreutils
          pkgs.git
          pkgs.gnugrep
          pkgs.gnused
        ];
        sandbox = pkgs.writeShellScriptBin "sandbox" ''
          ARGS=(
            --unshare-user
            --unshare-ipc
            --unshare-uts
            --unshare-cgroup
            --share-net
            --die-with-parent
            --ro-bind /nix /nix
            --ro-bind /etc/resolv.conf /etc/resolv.conf
            --ro-bind /etc/ssl /etc/ssl
            --ro-bind-try /etc/static /etc/static
            --ro-bind-try /etc/nix /etc/nix
            --ro-bind-try /run/current-system/sw /run/current-system/sw
            --symlink ${pkgs.coreutils}/bin/env /usr/bin/env
            --symlink ${pkgs.bash}/bin/bash /bin/sh
            --tmpfs "$HOME"
            --dir "$HOME/.codex"
            --bind-try "$HOME/.codex/config.toml" "$HOME/.codex/config.toml"
            --bind "$(pwd)" "$(pwd)"
            --bind /tmp /tmp
            --bind-try "$HOME/.bun" "$HOME/.bun"
            --setenv PATH "${sandboxPath}"
            --setenv HOME "$HOME"
            --dev /dev
            --proc /proc
          )
          exec ${pkgs.bubblewrap}/bin/bwrap "''${ARGS[@]}" -- "$@"
        '';
        defaultPackages = with pkgs; [
          deadnix
          fd
          just
          nixfmt
          nushell
          ripgrep
          sandbox
          statix
          woodpecker-cli
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = defaultPackages;

          shellHook = ''
            echo ""
            echo "  Claude Code Config Shell"
            echo "  ───────────────────────────"
            echo "  bun          ${pkgs.bun.version} (sandbox)"
            echo "  woodpecker   ${pkgs.woodpecker-cli.version}"
            echo ""
          '';
        };
      }
    );
}
