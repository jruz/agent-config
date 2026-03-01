{
  description = "Simple Compose - merge into project flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    simple-compose.url = "git+https://codeberg.org/jruz/simple-compose.git?ref=refs/tags/v0.1.1";
  };

  outputs = { self, nixpkgs, flake-utils, simple-compose }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        sc = simple-compose.packages.${system}.default;
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            sc
          ];

          shellHook = ''
            echo ""
            echo "  simple-compose  ${sc.version}"
            echo ""
          '';
        };
      }
    );
}
