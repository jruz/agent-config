{
  description = "DevShell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            babashka
            clj-kondo
            zprint
          ];

          shellHook = ''
            echo ""
            echo "  Babashka Development Shell"
            echo "  ───────────────────────────"
            echo "  Babashka:  ${pkgs.babashka.version}"
            echo ""
          '';
        };
      });
}
