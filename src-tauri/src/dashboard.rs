use std::path::PathBuf;

use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

pub fn launch_dashboard(app_handle: tauri::AppHandle) {
  let win_builder =
    WebviewWindowBuilder::new(&app_handle, "main", WebviewUrl::App(PathBuf::from("main")))
      .title("")
      .inner_size(900.0, 700.0)
      .min_inner_size(500.0, 550.0)
      .minimizable(true)
      .maximizable(true)
      .zoom_hotkeys_enabled(true)
      .decorations(true)
      .title_bar_style(TitleBarStyle::Visible)
      // .skip_taskbar(false)
      .center()
      .closable(true)
      .resizable(true)
      .visible(true)
      .focused(true);

  // set transparent title bar only when building for macOS
  // #[cfg(target_os = "macos")]
  // let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);

  let window = win_builder.build().unwrap();

  // #[cfg(target_os = "macos")]
  // window_vibrancy::apply_vibrancy(
  //     &window,
  //     window_vibrancy::NSVisualEffectMaterial::Dark,
  //     Some(window_vibrancy::NSVisualEffectState::FollowsWindowActiveState),
  //     Some(16.0),
  // )
  // .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

  let window_clone = window.clone();
  window.on_window_event(move |event| {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
      // Prevent the window from closing
      api.prevent_close();

      // Minimize the window instead
      window_clone.minimize().unwrap();
    }
  });
}
