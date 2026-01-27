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
          packages = with pkgs; [
            erlang
            gleam
            just
            rebar3
            ripgrep
            watchexec
          ];

          shellHook = ''
            echo ""
            echo "  Gleam Development Shell"
            echo "  ───────────────────────"
            printf "  %-9s %s\n" "erlang:" "${pkgs.erlang.version}"
            printf "  %-9s %s\n" "gleam:" "${pkgs.gleam.version}"
            printf "  %-9s %s\n" "rebar3:" "${pkgs.rebar3.version}"
            echo ""
          '';
        };
      }
    );
}
