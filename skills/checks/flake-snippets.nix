{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    rust-overlay = {
      url = "github:oxalica/rust-overlay";
    };

  };

  packages = {
    biome = "pkgs.biome";
    deadnix = "pkgs.deadnix";
    fd = "pkgs.fd";
    just = "pkgs.just";
    markdownlint-cli2 = "pkgs.markdownlint-cli2";
    nixfmt = "pkgs.nixfmt-classic";
    ripgrep = "pkgs.ripgrep";
    selene = "pkgs.selene";
    shellcheck = "pkgs.shellcheck";
    shfmt = "pkgs.shfmt";
    sqlx-cli = "pkgs.sqlx-cli";
    statix = "pkgs.statix";
    stylua = "pkgs.stylua";
    taplo = "pkgs.taplo";
    woodpecker-cli = "pkgs.woodpecker-cli";
    yamllint = "pkgs.yamllint";
  };

  rust-overlay-setup = ''
    overlays = [ (import rust-overlay) ];
    pkgs = import nixpkgs { inherit system overlays; };
    rust-version = pkgs.rust-bin.stable."1.92.0".default.override {
      extensions = [ "rust-analyzer" "rust-src" ];
    };
  '';

  minimal-flake = ''
    {
      description = "DevShell";

      inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
        flake-utils.url = "github:numtide/flake-utils";
      };

      outputs = { nixpkgs, flake-utils, ... }:
        flake-utils.lib.eachDefaultSystem (system:
          let
            pkgs = nixpkgs.legacyPackages.''${system};
          in
          {
            devShells.default = pkgs.mkShell {
              buildInputs = with pkgs; [
                fd
                just
                ripgrep
              ];
            };
          });
    }
  '';

  full-linting-flake = ''
    {
      description = "DevShell with full linting";

      inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
        flake-utils.url = "github:numtide/flake-utils";
        rust-overlay.url = "github:oxalica/rust-overlay";
      };

      outputs = { nixpkgs, flake-utils, rust-overlay, ... }:
        flake-utils.lib.eachDefaultSystem (system:
          let
            overlays = [ (import rust-overlay) ];
            pkgs = import nixpkgs { inherit system overlays; };
            rust-version = pkgs.rust-bin.stable."1.92.0".default.override {
              extensions = [ "rust-analyzer" "rust-src" ];
            };
          in
          {
            devShells.default = pkgs.mkShell {
              buildInputs = [
                rust-version
              ] ++ (with pkgs; [
                biome
                deadnix
                fd
                just
                markdownlint-cli2
                nixfmt-classic
                ripgrep
                selene
                shellcheck
                shfmt
                statix
                stylua
                taplo
                woodpecker-cli
                yamllint
              ]);
            };
          });
    }
  '';
}
