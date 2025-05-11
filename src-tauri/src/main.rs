// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  // configure logging env
  // TODO: load from config?
  env_logger::init();

  workspace_lib::run()
}
