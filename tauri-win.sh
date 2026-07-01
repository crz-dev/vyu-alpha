#!/usr/bin/env bash
set -euo pipefail

# Cross-compile Vyu for Windows via cargo-xwin from WSL.
#
# Prerequisites:
#   cargo install cargo-xwin
#   rustup target add x86_64-pc-windows-msvc
#   sudo apt install lld clang
#   sudo ln -sf /usr/bin/clang-cl-19   /usr/local/bin/clang-cl
#   sudo ln -sf /usr/bin/llvm-lib-19   /usr/local/bin/llvm-lib
#   sudo ln -sf /usr/bin/llvm-rc-19    /usr/local/bin/llvm-rc
#
# Usage: ./tauri-win.sh [--run]
#   --run    launch the .exe from Windows side after build

FAIL=
for cmd in clang-cl llvm-lib llvm-rc; do
  if ! command -v "$cmd" &>/dev/null; then echo "[ERROR] $cmd not found on PATH"; FAIL=1; fi
done
[ -n "$FAIL" ] && exit 1
! command -v cargo-xwin &>/dev/null && echo "[ERROR] cargo-xwin not found" && exit 1

PLACEHOLDER="src-tauri/binaries/songrec-x86_64-pc-windows-msvc.exe"
[ ! -f "$PLACEHOLDER" ] && touch "$PLACEHOLDER"

WSL_IP="$(hostname -I | awk '{print $1}')"
echo "[tauri-win] WSL IP: $WSL_IP"

# Vite dev server must already be running — this script does not manage it.
# It must be listening on 0.0.0.0 so the Windows WebView2 can reach it via the WSL IP.
if ! ss -tlnp 'sport = :1420' 2>/dev/null | grep -q .; then
  echo "[ERROR] No Vite dev server detected on port 1420."
  echo "        Start it in a separate terminal first:"
  echo ""
  echo "          TAURI_DEV_HOST=$WSL_IP pnpm dev"
  echo ""
  exit 1
fi

if curl -s -o /dev/null "http://$WSL_IP:1420/" 2>/dev/null; then
  echo "[tauri-win] Vite dev server reachable at http://$WSL_IP:1420"
elif curl -s -o /dev/null http://127.0.0.1:1420/ 2>/dev/null; then
  echo "[ERROR] Vite is running on 127.0.0.1 but not on $WSL_IP."
  echo "        It was started without TAURI_DEV_HOST, so it only binds to localhost."
  echo "        Restart it with:"
  echo ""
  echo "          TAURI_DEV_HOST=$WSL_IP pnpm dev"
  echo ""
  exit 1
else
  echo "[ERROR] Port 1420 is open but Vite is not responding."
  echo "        The dev server may be starting or crashed."
  echo "        Restart it with:"
  echo ""
  echo "          TAURI_DEV_HOST=$WSL_IP pnpm dev"
  echo ""
  exit 1
fi

# Build TAURI_CONFIG with devUrl pointing at WSL IP for Windows WebView2
TAURI_CONFIG="$(python3 -c "
import json
with open('src-tauri/tauri.conf.json') as f:
    c = json.load(f)
c['build']['devUrl'] = 'http://$WSL_IP:1420'
print(json.dumps(c))
")"

export TAURI_CONFIG
echo "[tauri-win] devUrl -> http://$WSL_IP:1420"

echo "[tauri-win] Cross-compiling for x86_64-pc-windows-msvc (debug)..."
(cd src-tauri && cargo xwin build --target x86_64-pc-windows-msvc)

EXE_PATH="src-tauri/target/x86_64-pc-windows-msvc/debug/vyu.exe"
WIN_PATH="$(wslpath -w "$(pwd)/$EXE_PATH")"

echo ""
echo "============================================"
echo "  Build complete!"
echo "  Binary: $WIN_PATH"
echo "  Vite:   http://$WSL_IP:1420"
echo ""
echo "  Run from Windows:"
echo "    $WIN_PATH"
echo "============================================"

if [[ "${1:-}" == "--run" ]]; then
  echo "[tauri-win] Launching..."
  cmd.exe /c start "" "$WIN_PATH" &>/dev/null &
fi
