pkgs:
  pkgs.mkShellNoCC {
    name = "obsidian-helix-dev-shell";
    nativeBuildInputs = [
      pkgs.nodejs_24
      pkgs.yarn
    ];
    shellHook = ''
      export WORKSPACE="''${PWD}"
     '';
  }
