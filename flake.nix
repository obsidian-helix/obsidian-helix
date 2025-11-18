rec {
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:

    flake-utils.lib.eachDefaultSystem (system:

      let
        overlays = [ ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };
      in {
        devShells.default = import ./shell.nix pkgs;
      }
    );  
}
