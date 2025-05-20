### Development

```bash
# install rust
# https://www.rust-lang.org/tools/install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default nightly
#rustup default nightly-2025-01-09
rustup component add rustfmt --toolchain nightly

# install tauri through cargo
cargo install tauri-cli --version "^2.0.0" --locked

# install node support
# https://github.com/Schniz/fnm
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 20
fnm default 20
eval "$(fnm env --use-on-cd --shell zsh)" # put this into your terminal config to be persistant

# install bun
curl -fsSL https://bun.sh/install | bash

# configure repo
bun i

# develop (ENSURE YOU ARE IN THE ROOT DIRECTORY)
bun run tauri dev # vite reads the config from PWD and should run on port 1420

```
