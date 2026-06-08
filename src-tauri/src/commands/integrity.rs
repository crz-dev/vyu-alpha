use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use image::GenericImageView;

use crate::constants::CREATE_NO_WINDOW;
use crate::types::{FixResult, MediaIntegrity, MediaKind};
use crate::util::unique_path;

#[tauri::command]
pub fn check_media_integrity(path: String) -> Result<MediaIntegrity, String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Ok(MediaIntegrity {
            corrupted: true,
            reason: "File does not exist".into(),
        });
    }

    let ext = p
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();
    let kind = MediaKind::from_ext(&ext);

    if kind.is_document {
        let mut magic = [0u8; 5];
        let bytes_ok = fs::File::open(&path)
            .and_then(|mut f| std::io::Read::read_exact(&mut f, &mut magic))
            .is_ok();
        if !bytes_ok || &magic != b"%PDF-" {
            return Ok(MediaIntegrity {
                corrupted: true,
                reason: "Not a valid PDF file (missing %PDF- header)".into(),
            });
        }
        return Ok(MediaIntegrity {
            corrupted: false,
            reason: String::new(),
        });
    }

    if kind.is_image && !kind.is_ffmpeg_image && !kind.is_raw {
        match image::open(&path) {
            Ok(img) => {
                let (w, h) = img.dimensions();
                if w == 0 || h == 0 {
                    return Ok(MediaIntegrity {
                        corrupted: true,
                        reason: "Image has zero dimensions (corrupted header)".into(),
                    });
                }
                Ok(MediaIntegrity {
                    corrupted: false,
                    reason: String::new(),
                })
            }
            Err(e) => Ok(MediaIntegrity {
                corrupted: true,
                reason: format!("Image decode failed: {e}"),
            }),
        }
    } else if kind.is_video || kind.is_audio || kind.is_ffmpeg_image || kind.is_raw {
        let output = Command::new("ffprobe")
            .creation_flags(CREATE_NO_WINDOW)
            .args(["-v", "error", "-show_streams", "-show_format", &path])
            .output();

        match output {
            Ok(out) => {
                if out.status.success() {
                    let stderr = String::from_utf8_lossy(&out.stderr);
                    let corruption_keywords = [
                        "corrupt",
                        "invalid",
                        "truncated",
                        "incomplete",
                        "malformed",
                        "missing",
                        "broken",
                    ];
                    let lower = stderr.to_lowercase();
                    for kw in &corruption_keywords {
                        if lower.contains(kw) {
                            return Ok(MediaIntegrity {
                                corrupted: true,
                                reason: format!("ffprobe reported issue: {stderr}"),
                            });
                        }
                    }
                    let stdout = String::from_utf8_lossy(&out.stdout);
                    if !stdout.contains("\"codec_type\"") {
                        return Ok(MediaIntegrity {
                            corrupted: true,
                            reason: "No media streams found in file".into(),
                        });
                    }
                    Ok(MediaIntegrity {
                        corrupted: false,
                        reason: String::new(),
                    })
                } else {
                    let stderr = String::from_utf8_lossy(&out.stderr);
                    Ok(MediaIntegrity {
                        corrupted: true,
                        reason: format!("ffprobe failed: {stderr}"),
                    })
                }
            }
            Err(e) => {
                Ok(MediaIntegrity {
                    corrupted: false,
                    reason: format!("ffprobe unavailable: {e}"),
                })
            }
        }
    } else {
        Ok(MediaIntegrity {
            corrupted: false,
            reason: format!("Skipped integrity check for unsupported type: .{ext}"),
        })
    }
}

fn fix_image(input: &Path, output: &Path) -> Result<(), String> {
    let img = image::open(input).map_err(|e| format!("Failed to open image: {e}"))?;
    img.save(output)
        .map_err(|e| format!("Failed to save fixed image: {e}"))
}

fn fix_video_audio(input: &Path, output: &Path) -> Result<(), String> {
    let remux = Command::new("ffmpeg")
        .creation_flags(CREATE_NO_WINDOW)
        .args([
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            &input.to_string_lossy(),
            "-c",
            "copy",
            "-map",
            "0",
            &output.to_string_lossy(),
        ])
        .output()
        .map_err(|e| format!("Failed to start ffmpeg: {e}"))?;

    if remux.status.success() {
        return Ok(());
    }

    let reencode = Command::new("ffmpeg")
        .creation_flags(CREATE_NO_WINDOW)
        .args([
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-err_detect",
            "ignore_err",
            "-i",
            &input.to_string_lossy(),
            &output.to_string_lossy(),
        ])
        .output()
        .map_err(|e| format!("Failed to start ffmpeg re-encode: {e}"))?;

    if reencode.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&reencode.stderr).trim().to_string();
        Err(format!("Failed to fix media: {stderr}"))
    }
}

fn fix_document(input: &Path, output: &Path) -> Result<(), String> {
    let bytes = fs::read(input).map_err(|e| format!("Failed to read document: {e}"))?;
    if bytes.len() < 5 || &bytes[0..5] != b"%PDF-" {
        return Err("Not a valid PDF file (missing %PDF- header)".into());
    }
    fs::write(output, &bytes).map_err(|e| format!("Failed to write fixed document: {e}"))
}

#[tauri::command]
pub fn fix_media(path: String, mode: String) -> Result<FixResult, String> {
    let input = PathBuf::from(&path);
    if !input.exists() {
        return Ok(FixResult {
            success: false,
            output_path: String::new(),
            error: "Source file does not exist".into(),
        });
    }

    let ext = input
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();
    let kind = MediaKind::from_ext(&ext);

    let parent = input
        .parent()
        .unwrap_or_else(|| Path::new("."))
        .to_path_buf();
    let stem = input
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("fixed")
        .to_string();

    let output_path = if mode == "copy" {
        let fixed_name = format!("{stem}_fixed.{ext}");
        unique_path(parent.join(&fixed_name))
    } else {
        let stamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0);
        let tmp = std::env::temp_dir()
            .join("Vyu-temp")
            .join(format!("fix-{stamp}.{ext}"));
        if let Some(p) = tmp.parent() {
            let _ = fs::create_dir_all(p);
        }
        tmp
    };

    let fix_result: Result<(), String> = if kind.is_image && !kind.is_ffmpeg_image && !kind.is_raw {
        fix_image(&input, &output_path)
    } else if kind.is_video || kind.is_audio || kind.is_ffmpeg_image || kind.is_raw {
        fix_video_audio(&input, &output_path)
    } else if kind.is_document {
        fix_document(&input, &output_path)
    } else {
        Err(format!("Unsupported file type: .{ext}"))
    };

    match fix_result {
        Ok(()) => {
            if mode == "replace" {
                if let Err(e) = fs::remove_file(&input) {
                    let _ = fs::remove_file(&output_path);
                    return Ok(FixResult {
                        success: false,
                        output_path: String::new(),
                        error: format!("Failed to remove original: {e}"),
                    });
                }
                if let Err(e) = fs::rename(&output_path, &input) {
                    return Ok(FixResult {
                        success: false,
                        output_path: String::new(),
                        error: format!("Failed to replace original: {e}"),
                    });
                }
                Ok(FixResult {
                    success: true,
                    output_path: input.to_string_lossy().to_string(),
                    error: String::new(),
                })
            } else {
                Ok(FixResult {
                    success: true,
                    output_path: output_path.to_string_lossy().to_string(),
                    error: String::new(),
                })
            }
        }
        Err(e) => {
            let _ = fs::remove_file(&output_path);
            Ok(FixResult {
                success: false,
                output_path: String::new(),
                error: e,
            })
        }
    }
}
