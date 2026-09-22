// flake.nix — entorno de desarrollo reproducible para MicroZombiesZ.
// Uso: nix develop   (requiere Nix con flakes habilitado)
{
  description = "MicroZombiesZ — devShell reproducible (Nuxt 4 + Node 22)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          name = "microzombiesz-dev";
          packages = with pkgs; [
            nodejs_22          # runtime y CLI (npm/npx)
            git
            bash
            # utilidades de QA
            nodePackages.npm-check-updates
          ];

          shellHook = ''
            echo "🧟 MicroZombiesZ devShell — node $(node --version)"
            echo "  npm install  → dependencias"
            echo "  npm run qa   → QA completa (lint+tipos+tests+build)"
            echo "  npm run dev  → juego en http://localhost:3000"
          '';
        };
      });
}
