// Velocity Launcher - Rust Backend
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct LaunchOptions {
    pub instance_id: String,
    pub java_path: String,
    pub jvm_args: Vec<String>,
    pub memory_min: i32,
    pub memory_max: i32,
    pub game_directory: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os_type: String,
    pub arch: String,
    pub version: String,
    pub total_memory: u64,
    pub available_memory: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MojangArticle {
    pub title: String,
    pub description: String,
    pub url: String,
    pub published_at: String,
    pub category: String,
}

/// Get system information for optimization suggestions
#[tauri::command]
async fn get_system_info() -> Result<SystemInfo, String> {
    let os_type = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();
    
    // Get memory info using sysinfo or similar
    let total_memory = 16 * 1024 * 1024 * 1024u64; // Placeholder: 16GB
    let available_memory = 8 * 1024 * 1024 * 1024u64; // Placeholder: 8GB
    
    Ok(SystemInfo {
        os_type,
        arch,
        version: "Unknown".to_string(),
        total_memory,
        available_memory,
    })
}

/// Calculate optimal JVM arguments based on system specs
#[tauri::command]
async fn calculate_optimal_jvm_args(total_memory_mb: i32) -> Result<Vec<String>, String> {
    let mut args = vec![
        "-XX:+UseG1GC".to_string(),
        "-XX:+ParallelRefProcEnabled".to_string(),
        "-XX:MaxGCPauseMillis=200".to_string(),
        "-XX:+UnlockExperimentalVMOptions".to_string(),
        "-XX:+DisableExplicitGC".to_string(),
        "-XX:+AlwaysPreTouch".to_string(),
        "-XX:G1NewSizePercent=30".to_string(),
        "-XX:G1MaxNewSizePercent=40".to_string(),
        "-XX:G1HeapRegionSize=8M".to_string(),
        "-XX:G1ReservePercent=20".to_string(),
        "-XX:G1HeapWastePercent=5".to_string(),
    ];
    
    // Add large page support for high-memory systems
    if total_memory_mb > 8192 {
        args.push("-XX:+UseLargePages".to_string());
    }
    
    Ok(args)
}

/// Launch a Minecraft instance
#[tauri::command]
async fn launch_minecraft(options: LaunchOptions) -> Result<String, String> {
    // This is a placeholder - in production, this would:
    // 1. Authenticate with Microsoft/Mojang
    // 2. Download necessary files
    // 3. Construct the launch command
    // 4. Spawn the Java process
    
    println!("Launching instance: {}", options.instance_id);
    println!("Java path: {}", options.java_path);
    println!("Memory: {}M - {}M", options.memory_min, options.memory_max);
    
    Ok(format!("Launched instance {}", options.instance_id))
}

/// Get the default instance directory path
#[tauri::command]
async fn get_default_instance_path() -> Result<String, String> {
    let home_dir = dirs::home_dir()
        .ok_or_else(|| "Could not find home directory".to_string())?;
    
    let instance_path = home_dir
        .join("AppData")
        .join("Roaming")
        .join("VelocityLauncher")
        .join("instances");
    
    Ok(instance_path.to_string_lossy().to_string())
}

/// Open a folder in the system file manager
#[tauri::command]
async fn open_folder(path: String) -> Result<(), String> {
    let path_buf = PathBuf::from(path);
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(path_buf)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(path_buf)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(path_buf)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    Ok(())
}

/// Fetch Mojang news from their RSS feed
#[tauri::command]
async fn fetch_mojang_news() -> Result<Vec<MojangArticle>, String> {
    // For now, return mock data - in production this would fetch from Mojang's API
    let articles = vec![
        MojangArticle {
            title: "Minecraft 1.21 Update: The Tricky Trials".to_string(),
            description: "Explore new trial chambers, meet the breeze, and craft with the mace!".to_string(),
            url: "https://www.minecraft.net/article/tricky-trials-update".to_string(),
            published_at: chrono::Utc::now().to_rfc3339(),
            category: "Update".to_string(),
        },
        MojangArticle {
            title: "Minecraft Realms Plus - New Content".to_string(),
            description: "Discover new maps, skins, and texture packs available now.".to_string(),
            url: "https://www.minecraft.net/realms".to_string(),
            published_at: (chrono::Utc::now() - chrono::Duration::days(1)).to_rfc3339(),
            category: "Realms".to_string(),
        },
        MojangArticle {
            title: "Community Spotlight: Amazing Builds".to_string(),
            description: "Check out the most impressive community creations this week.".to_string(),
            url: "https://www.minecraft.net/community".to_string(),
            published_at: (chrono::Utc::now() - chrono::Duration::days(2)).to_rfc3339(),
            category: "Community".to_string(),
        },
        MojangArticle {
            title: "Java Edition Technical Updates".to_string(),
            description: "Performance improvements and bug fixes in the latest snapshot.".to_string(),
            url: "https://www.minecraft.net/snapshots".to_string(),
            published_at: (chrono::Utc::now() - chrono::Duration::days(3)).to_rfc3339(),
            category: "Technical".to_string(),
        },
    ];
    
    Ok(articles)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Register plugins
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        // Register commands
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            calculate_optimal_jvm_args,
            launch_minecraft,
            get_default_instance_path,
            open_folder,
            fetch_mojang_news,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
