# Snapshot file
# Unset all aliases to avoid conflicts with functions
unalias -a 2>/dev/null || true
shopt -s expand_aliases
# Check for rg availability
if ! command -v rg >/dev/null 2>&1; then
  alias rg='/home/khkuk0510/.nvm/versions/node/v20.19.4/lib/node_modules/\@anthropic-ai/claude-code/vendor/ripgrep/x64-linux/rg'
fi
export PATH='/home/khkuk0510/.vscode-server/bin/0f0d87fa9e96c856c5212fc86db137ac0d783365/bin/remote-cli:/home/khkuk0510/.nvm/versions/node/v20.19.4/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/wsl/lib:/mnt/c/WINDOWS/system32:/mnt/c/WINDOWS:/mnt/c/WINDOWS/System32/Wbem:/mnt/c/WINDOWS/System32/WindowsPowerShell/v1.0/:/mnt/c/WINDOWS/System32/OpenSSH/:/mnt/c/Program Files/dotnet/:/mnt/c/Users/khkuk/AppData/Local/Programs/Python/Python310/Scripts/:/mnt/c/Users/khkuk/AppData/Local/Programs/Python/Python310/:/mnt/c/Users/khkuk/AppData/Local/Programs/Python/Launcher/:/mnt/c/Users/khkuk/AppData/Local/Microsoft/WindowsApps:/mnt/c/Users/khkuk/AppData/Local/Programs/Microsoft VS Code/bin:/snap/bin:/home/khkuk0510/.vscode-server/data/User/globalStorage/github.copilot-chat/debugCommand'
