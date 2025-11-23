pkgs:
let
    jq = pkgs.writeShellScriptBin "jq" ''
        exec ${pkgs.jq}/bin/jq --indent 4 "$@"
    '';
in
pkgs.mkShellNoCC {
  name = "obsidian-helix-dev-shell";
  nativeBuildInputs = [
    pkgs.nodejs_24
    pkgs.yarn
    pkgs.eslint
    pkgs.esbuild
    jq
  ];
  shellHook = ''
    export WORKSPACE="''${PWD}"
  '';
}
