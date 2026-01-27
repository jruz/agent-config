{
  description = "DevShell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-25.11";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, rust-overlay, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
        rustVersion = "1.92.0";
        rust = pkgs.rust-bin.stable.${rustVersion}.default.override {
          extensions = [ "rust-analyzer" "rust-src" ];
        };
        commonPackages = with pkgs; [
          cargo-edit
          cargo-nextest
          cargo-outdated
          cargo-watch
          fd
          openssl
          pkg-config
          ripgrep
          rust
          sqlx-cli
        ];
        darwinPackages = with pkgs; [
          libiconv
        ];
        linuxPackages = with pkgs; [
          glibc
          glibcLocales
        ];
        platformPackages =
          if pkgs.stdenv.isDarwin then
            commonPackages ++ darwinPackages
          else
            commonPackages ++ linuxPackages;
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = platformPackages;

          env = {
            OPENSSL_DIR = "${pkgs.openssl.dev}";
            OPENSSL_LIB_DIR = "${pkgs.openssl.out}/lib";
            OPENSSL_INCLUDE_DIR = "${pkgs.openssl.dev}/include";
            PKG_CONFIG_PATH = "${pkgs.openssl.dev}/lib/pkgconfig";
          };

          shellHook = ''
            export C_INCLUDE_PATH="${pkgs.openssl.dev}/include''${C_INCLUDE_PATH:+:$C_INCLUDE_PATH}"
            export LIBRARY_PATH="${pkgs.openssl.out}/lib''${LIBRARY_PATH:+:$LIBRARY_PATH}"
            export LD_LIBRARY_PATH="${pkgs.openssl.out}/lib''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
            echo ""
            echo "  Rust Development Shell"
            echo "  ───────────────────────────"
            echo "  Rust:        ${rustVersion}"
            echo "  Nextest:     ${pkgs.cargo-nextest.version}"
            echo "  SQLx:        ${pkgs.sqlx-cli.version}"
            echo ""
          '' + pkgs.lib.optionalString pkgs.stdenv.isLinux ''
            export LOCALE_ARCHIVE="${pkgs.glibcLocales}/lib/locale/locale-archive"
          '';
        };
      });
}
