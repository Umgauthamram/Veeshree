export function handleCompletionCommand(shell: string = "bash"): void {
  const commands = [
    "init",
    "migrate",
    "watch",
    "capture",
    "review",
    "accept",
    "reject",
    "proposals",
    "context",
    "search",
    "decisions",
    "sync",
    "status",
    "gc",
    "undo",
    "export",
    "import",
    "mcp",
    "hooks",
    "rules",
    "ci",
    "keys",
    "models",
    "config",
    "doctor",
    "completion",
  ];

  if (shell === "powershell") {
    console.log(`Register-ArgumentCompleter -Native -CommandName vee,veeshree -ScriptBlock {
  param($wordToComplete, $commandAst, $cursorPosition)
  $commands = @(${commands.map((c) => `"${c}"`).join(",")})
  $commands | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
    [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
  }
}`);
    return;
  }

  if (shell === "zsh") {
    console.log(`#compdef vee veeshree
_vee() {
  local -a commands
  commands=(${commands.join(" ")})
  _describe 'command' commands
}
compdef _vee vee veeshree`);
    return;
  }

  if (shell === "fish") {
    console.log(`complete -c vee -f -a "${commands.join(" ")}"
complete -c veeshree -f -a "${commands.join(" ")}"`);
    return;
  }

  // Default: bash
  console.log(`_vee_completions() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local commands="${commands.join(" ")}"
  COMPREPLY=($(compgen -W "\${commands}" -- "\${cur}"))
}
complete -F _vee_completions vee
complete -F _vee_completions veeshree`);
}
