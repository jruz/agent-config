{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";
    composeSrc.url = "git+https://codeberg.org/jruz/compose.git?ref=refs/tags/v0.4.1";
  };

  outputs = { nixpkgs, composeSrc, ... }:
    let
      supportedSystems = [ "aarch64-darwin" "aarch64-linux" "x86_64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
          compose = composeSrc.packages.${system}.default;
        in
        {
          default = pkgs.mkShell {
            buildInputs = [
              compose
            ];

            shellHook = ''
              echo "compose  ${compose.version}"
              echo ""
            '';
          };
        });
    };
}
