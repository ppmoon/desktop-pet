mod commands;

use std::fs;
use std::path::PathBuf;
use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[tauri::command]
fn get_home_dir() -> String {
    home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .to_string_lossy()
        .into_owned()
}

#[tauri::command]
fn list_pet_dirs() -> Vec<String> {
    let home = home_dir().unwrap_or_else(|| PathBuf::from("."));
    let pets_dir = home.join(".pet").join("pets");
    let mut dirs = Vec::new();
    if let Ok(entries) = fs::read_dir(&pets_dir) {
        for entry in entries.flatten() {
            if entry.file_type().map(|t| t.is_dir()).unwrap_or(false) {
                if let Some(name) = entry.file_name().to_str() {
                    dirs.push(name.to_string());
                }
            }
        }
    }
    dirs
}

#[tauri::command]
fn read_pet_manifest(pet_id: String) -> Result<String, String> {
    let home = home_dir().ok_or("Cannot determine home directory")?;
    let path = home
        .join(".pet")
        .join("pets")
        .join(&pet_id)
        .join("pet.json");
    fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path.display(), e))
}

#[tauri::command]
fn read_pet_spritesheet(pet_id: String) -> Result<Vec<u8>, String> {
    let home = home_dir().ok_or("Cannot determine home directory")?;
    let path = home
        .join(".pet")
        .join("pets")
        .join(&pet_id)
        .join("spritesheet.png");
    // Also try .webp if .png not found
    let path = if path.exists() {
        path
    } else {
        let webp = home
            .join(".pet")
            .join("pets")
            .join(&pet_id)
            .join("spritesheet.webp");
        if webp.exists() {
            webp
        } else {
            return Err(format!("Spritesheet not found for pet: {}", pet_id));
        }
    };
    fs::read(&path).map_err(|e| format!("Failed to read {}: {}", path.display(), e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_home_dir,
            list_pet_dirs,
            read_pet_manifest,
            read_pet_spritesheet,
            commands::search::search_files,
            commands::open::open_path,
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            app.global_shortcut()
                .on_shortcut("Alt+Space", move |_app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        let visible = window.is_visible().unwrap_or(false);
                        if visible {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .expect("Failed to register Alt+Space shortcut");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn home_dir() -> Option<PathBuf> {
    #[cfg(target_os = "linux")]
    {
        std::env::var_os("HOME").map(PathBuf::from)
    }

    #[cfg(target_os = "macos")]
    {
        std::env::var_os("HOME").map(PathBuf::from)
    }

    #[cfg(target_os = "windows")]
    {
        std::env::var_os("USERPROFILE").map(PathBuf::from)
    }
}
