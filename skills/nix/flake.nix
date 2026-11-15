{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            deadnix
            fd
            nixfmt
            statix
          ];

          shellHook = ''
            echo ""
            echo "  Development Shell"
            echo "  ─────────────────"
            echo "  nixpkgs      ${pkgs.lib.trivial.release}"
            echo ""
          '';
        };
      }
    );
}
