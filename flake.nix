{
  description = "Claude Code Config Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            fd
            just
            nodejs
            ripgrep
          ];

          shellHook = ''
            echo ""
            echo "  Claude Code Config Shell"
            echo "  ───────────────────────────"
            echo "  bun ${pkgs.bun.version}"
            echo "  node ${pkgs.nodejs.version}"
            echo ""
          '';
        };
      });
}
