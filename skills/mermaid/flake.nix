{
  description = "Mermaid diagrams - merge into project flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.chromium
            pkgs.mermaid-cli
          ];

          shellHook = ''
            export PUPPETEER_EXECUTABLE_PATH="${pkgs.chromium}/bin/chromium"
          '';
        };
      }
    );
}
