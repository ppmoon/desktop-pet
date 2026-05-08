use serde::Serialize;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize)]
pub struct FileResult {
    pub path: String,
    pub name: String,
    pub is_dir: bool,
    pub size: Option<u64>,
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

#[tauri::command]
pub fn search_files(
    query: String,
    base_dir: Option<String>,
    limit: Option<usize>,
) -> Vec<FileResult> {
    let limit = limit.unwrap_or(20);
    let base = base_dir
        .map(PathBuf::from)
        .or_else(home_dir)
        .unwrap_or_else(|| PathBuf::from("."));

    let query_lower = query.to_lowercase();
    let mut results: Vec<FileResult> = Vec::new();

    walk_dir(&base, &query_lower, &mut results, limit, 0, 3);
    results
}

fn walk_dir(
    dir: &PathBuf,
    query: &str,
    results: &mut Vec<FileResult>,
    limit: usize,
    depth: u32,
    max_depth: u32,
) {
    if results.len() >= limit || depth > max_depth {
        return;
    }

    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        if results.len() >= limit {
            return;
        }
        let name = entry.file_name().to_string_lossy().into_owned();
        if name.starts_with('.') {
            continue;
        }
        if name.to_lowercase().contains(query) {
            let path = entry.path();
            let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
            let size = if is_dir {
                None
            } else {
                entry.metadata().ok().map(|m| m.len())
            };
            results.push(FileResult {
                path: path.to_string_lossy().into_owned(),
                name,
                is_dir,
                size,
            });
        }
        if entry.file_type().map(|t| t.is_dir()).unwrap_or(false) {
            walk_dir(&entry.path(), query, results, limit, depth + 1, max_depth);
        }
    }
}
