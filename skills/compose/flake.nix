{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
    composeSrc.url = "git+https://codeberg.org/jruz/compose.git?ref=refs/tags/v0.5.0";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      composeSrc,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        compose = composeSrc.packages.${system}.default;
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            compose
          ];

          shellHook = ''
            echo "compose  ${compose.version}"
            echo ""
          '';
        };
      }
    );
}
