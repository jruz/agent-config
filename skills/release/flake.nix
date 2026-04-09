{
  description = "REPLACE_ME";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-25.11";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      rust-overlay,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ rust-overlay.overlays.default ];
        };
        cargoToml = builtins.fromTOML (builtins.readFile ./Cargo.toml);
        revision = self.rev or "dirty";
      in
      {
        packages.default = pkgs.rustPlatform.buildRustPackage {
          pname = cargoToml.package.name;
          inherit (cargoToml.package) version;
          src = ./.;
          cargoLock.lockFile = ./Cargo.lock;
          REVISION = revision;
          CARGO_HOME = "$TMPDIR";
          doCheck = false;
          buildInputs = pkgs.lib.optionals pkgs.stdenv.isDarwin [ pkgs.libiconv ];
        };

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            (rust-bin.fromRustupToolchainFile ./rust-toolchain.toml)
          ];

          shellHook = ''
            echo ""
            echo "  ${cargoToml.package.name} Development Shell"
            echo "  ───────────────────────────"
            echo "  rustc $(rustc --version | cut -d' ' -f2)"
            echo ""
          '';
        };
      }
    );
}
