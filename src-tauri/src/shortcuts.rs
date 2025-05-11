use anyhow::Result;
use tauri::App;

#[cfg(desktop)]
pub fn register_desktop_shortcuts(app: &App) -> Result<()> {
  use tauri::Manager as _;
  use tauri_nspanel::ManagerExt as _;
  use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

  log::info!("Registering desktop shortcuts");
  let spotlight_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::Space);

  app.handle().plugin(
    tauri_plugin_global_shortcut::Builder::new()
      .with_handler(move |app, shortcut, event| {
        log::debug!("pressed shortcut{:?}", shortcut);
        if shortcut == &spotlight_shortcut {
          match event.state() {
            ShortcutState::Pressed => {
              if let Some(window) = app.get_webview_window(super::spotlight::SPOTLIGHT_LABEL) {
                match app.get_webview_panel(super::spotlight::SPOTLIGHT_LABEL) {
                  Ok(panel) => {
                    if panel.is_visible() {
                      panel.order_out(None);
                    } else {
                      // window.center_at_cursor_monitor().unwrap();

                      panel.show();
                    }
                  }
                  Err(e) => {
                    log::error!("Issue locating spotlight panel: {:?}", e);
                  }
                }
              } else {
                log::error!("Issue locating spotlight window");
              }
            }
            ShortcutState::Released => {}
          }
        }
      })
      .build(),
  )?;

  app.global_shortcut().register(spotlight_shortcut)?;

  Ok(())
}
