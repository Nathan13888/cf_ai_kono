use dashboard::launch_dashboard;
#[cfg(target_os = "macos")]
use spotlight::launch_spotlight;

mod dashboard;
mod shortcuts;
#[cfg(target_os = "macos")]
mod spotlight;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // panic hook
  std::panic::set_hook(Box::new(|panic_info| {
    // Print detailed panic information
    eprintln!("!!! PANIC OCCURRED !!!");
    eprintln!("Panic info: {}", panic_info);

    // Get location information if available
    if let Some(location) = panic_info.location() {
      eprintln!(
        "Panic occurred in file '{}' at line {}",
        location.file(),
        location.line()
      );
    }

    // Force print the backtrace
    eprintln!("Backtrace:");
    let backtrace = backtrace::Backtrace::new();
    eprintln!("{:?}", backtrace);
  }));

  tauri::Builder::default()
    .plugin(tauri_plugin_global_shortcut::Builder::new().build())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_nspanel::init())
    .invoke_handler(tauri::generate_handler![])
    .setup(|app| {
      // Register global shortcuts
      #[cfg(desktop)]
      if let Err(e) = shortcuts::register_desktop_shortcuts(app) {
        log::error!("Failed to register desktop shortcuts: {:?}", e);
      }

      // Launch Dashboard
      launch_dashboard(app.handle().clone());

      // Launch Spotlight on macOS
      #[cfg(target_os = "macos")]
      let _ = launch_spotlight(app.handle().clone());
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
