{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.swiftformat
            pkgs.swiftlint
            pkgs.just
          ];

          shellHook = ''
            export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
            unset LD CC CXX SDKROOT NIX_LDFLAGS NIX_CC
          '';
        };
      }
    );
}
