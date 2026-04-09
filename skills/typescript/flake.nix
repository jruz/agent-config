{
  description = "TypeScript Development Shell - merge into project flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun
            just
          ];

          shellHook = ''
            echo ""
            echo "  TypeScript Development Shell"
            echo "  ────────────────────────────"
            printf "  %-9s %s\n" "bun:" "${pkgs.bun.version}"
            echo ""
          '';
        };
      }
    );
}
