use tauri::Manager;
use std::path::PathBuf;

#[tauri::command]
fn delete_file(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err("File does not exist".into());
    }
    std::fs::remove_file(&p).map_err(|e| e.to_string())
}

#[tauri::command]
fn trash_file(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err("File does not exist".into());
    }
    trash::delete(&p).map_err(|e| e.to_string())
}

#[tauri::command]
fn show_in_explorer(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err("File does not exist".into());
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .args(["-R", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(p.parent().unwrap_or(&p))
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![delete_file, trash_file, show_in_explorer])
        .setup(|app| {
            let args: Vec<String> = std::env::args().collect();
            if args.len() > 1 {
                let file_path = args[1].clone();
                let window = app.get_webview_window("main").unwrap();
                window
                    .eval(&format!(
                        "window.__INITIAL_FILE__ = '{}'",
                        file_path.replace('\'', "\\'").replace('\\', "\\\\")
                    ))
                    .unwrap();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}