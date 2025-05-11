use anyhow::Result;
use tauri::AppHandle;
use tauri_nspanel::ManagerExt as _;

pub const SPOTLIGHT_LABEL: &str = "spotlight";

/// Create spotlight window for macos
pub fn launch_spotlight(app_handle: tauri::AppHandle) -> Result<()> {
  use std::path::PathBuf;

  use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};
  use tauri_nspanel::{
    cocoa::appkit::NSWindowCollectionBehavior, panel_delegate, WebviewWindowExt as _,
  };
  use thiserror::Error;

  #[derive(Error, Debug)]
  enum Error {
    #[error("Unable to convert window to panel")]
    Panel,
    #[error("Monitor with cursor not found")]
    MonitorNotFound,
  }

  #[allow(non_upper_case_globals)]
  const NSFloatingWindowLevel: i32 = 24;
  // const NSFloatingWindowLevel: i32 = 4;
  #[allow(non_upper_case_globals)]
  const NSWindowStyleMaskNonActivatingPanel: i32 = 1 << 7;

  let win_builder = WebviewWindowBuilder::new(
    &app_handle,
    SPOTLIGHT_LABEL,
    WebviewUrl::App(PathBuf::from("spotlight")),
  )
  .title("")
  .inner_size(900.0, 700.0)
  .min_inner_size(500.0, 550.0)
  .minimizable(false)
  .maximizable(false)
  .zoom_hotkeys_enabled(false)
  .decorations(false)
  .title_bar_style(TitleBarStyle::Transparent)
  .center()
  .closable(false)
  .resizable(false)
  .visible(true)
  .focused(false);

  log::info!("building spotlight panel");
  let window = win_builder.build().unwrap();

  // convert the window to a spotlight panel
  log::info!("converting spotlight panel");
  let panel = window
    .to_panel()
    .map_err(|_| tauri::Error::Anyhow(Error::Panel.into()))?;

  log::info!("configuring spotlight panel");
  panel.set_level(NSFloatingWindowLevel);
  panel.set_collection_behaviour(
    NSWindowCollectionBehavior::NSWindowCollectionBehaviorMoveToActiveSpace
      | NSWindowCollectionBehavior::NSWindowCollectionBehaviorManaged
      | NSWindowCollectionBehavior::NSWindowCollectionBehaviorIgnoresCycle
      | NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary,
  );
  // panel.set_style_mask(NSWindowStyleMaskNonActivatingPanel);

  // hide panel by default
  panel.order_out(None);

  let delegate = panel_delegate!(MyPanelDelegate {
    window_did_become_key,
    window_did_resign_key
  });

  let handle = app_handle.to_owned();

  delegate.set_listener(Box::new(move |delegate_name: String| {
    match delegate_name.as_str() {
      "window_did_become_key" => {
        let app_name = handle.package_info().name.to_owned();

        println!("[info]: {:?} panel becomes key window!", app_name);
      }
      "window_did_resign_key" => {
        println!("[info]: panel resigned from key window!");
      }
      _ => (),
    }
  }));

  panel.set_delegate(delegate);

  Ok(())
}

// TODO: only allow macos?
#[tauri::command]
pub fn show_spotlight_panel(handle: AppHandle) {
  log::debug!("Attempting to show spotlight panel");
  let panel = handle.get_webview_panel(SPOTLIGHT_LABEL).unwrap();

  panel.show();
}

// TODO: only allow macos?
#[tauri::command]
pub fn hide_spotlight_panel(handle: AppHandle) {
  log::debug!("Attempting to hide spotlight panel");
  let panel = handle.get_webview_panel(SPOTLIGHT_LABEL).unwrap();

  panel.order_out(None);
}

// TODO: only allow macos?
#[tauri::command]
pub fn close_spotlight_panel(handle: AppHandle) {
  log::debug!("Attempting to close spotlight panel");
  let panel = handle.get_webview_panel(SPOTLIGHT_LABEL).unwrap();

  panel.set_released_when_closed(true);

  panel.close();
}
