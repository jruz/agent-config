{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-26.05";
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
            just
            swiftformat
            swiftlint
          ];

          shellHook = ''
            export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
            unset LD CC CXX SDKROOT NIX_LDFLAGS NIX_CC
            echo ""
            echo "  Development Shell"
            echo "  ─────────────────"
            echo "  nixpkgs      ${pkgs.lib.trivial.release}"
            echo "  swift        $(swift --version 2>&1 | head -n 1) (Xcode)"
            echo ""
          '';
        };
      }
    );
}
