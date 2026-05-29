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
    jq
  ];
  shellHook = ''
    export WORKSPACE="''${PWD}"
  '';
}
