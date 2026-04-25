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
#[serde(rename_all = "camelCase")]
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

/// Mojang API response structures
#[derive(Debug, Deserialize)]
struct MojangNewsResponse {
    entries: Vec<MojangNewsEntry>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct MojangNewsEntry {
    title: String,
    #[serde(rename = "shortTitle")]
    short_title: Option<String>,
    #[serde(rename = "newsType")]
    news_type: String,
    #[serde(rename = "publishDate")]
    publish_date: String,
    #[serde(rename = "readMoreLink")]
    read_more_link: String,
    #[serde(rename = "playPageImage")]
    #[allow(dead_code)]
    play_page_image: Option<MojangImage>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct MojangImage {
    url: String,
}

/// Fetch Mojang news from official API
#[tauri::command]
async fn fetch_mojang_news() -> Result<Vec<MojangArticle>, String> {
    let url = "https://launchercontent.mojang.com/v2/news.json";
    
    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch news: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }
    
    let news_data: MojangNewsResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse news: {}", e))?;
    
    let articles: Vec<MojangArticle> = news_data
        .entries
        .into_iter()
        .take(6)
        .map(|entry| {
            let category = match entry.news_type.as_str() {
                "NEWS" => "News",
                "UPDATE" => "Update",
                "EVENT" => "Event",
                "MARKETPLACE" => "Marketplace",
                _ => "News",
            };
            
            MojangArticle {
                title: entry.title,
                description: entry.short_title.unwrap_or_else(|| "Read more on Minecraft.net".to_string()),
                url: entry.read_more_link,
                published_at: entry.publish_date,
                category: category.to_string(),
            }
        })
        .collect();
    
    Ok(articles)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub download_url: String,
    pub icon_url: Option<String>,
    pub description: String,
    pub downloads: i64,
}

/// Search mods from CurseForge
#[tauri::command]
async fn search_mods_curseforge(_query: String, _game_version: String, _mod_loader: String) -> Result<Vec<ModInfo>, String> {
    // Mock implementation - replace with actual CurseForge API
    let mods = vec![
        ModInfo {
            id: "1".to_string(),
            name: "Sodium".to_string(),
            version: "0.5.8".to_string(),
            author: "CaffeineMC".to_string(),
            download_url: "https://curseforge.com/sodium".to_string(),
            icon_url: None,
            description: "Modern rendering engine and client-side optimization mod for Minecraft".to_string(),
            downloads: 25000000,
        },
        ModInfo {
            id: "2".to_string(),
            name: "Iris Shaders".to_string(),
            version: "1.7.2".to_string(),
            author: "IrisShaders".to_string(),
            download_url: "https://curseforge.com/iris".to_string(),
            icon_url: None,
            description: "A shaders mod for Minecraft intended to be compatible with OptiFine shaders".to_string(),
            downloads: 18000000,
        },
        ModInfo {
            id: "3".to_string(),
            name: "JourneyMap".to_string(),
            version: "5.10.0".to_string(),
            author: "techbrew".to_string(),
            download_url: "https://curseforge.com/journeymap".to_string(),
            icon_url: None,
            description: "Real-time mapping in game or in a web browser as you explore".to_string(),
            downloads: 12000000,
        },
    ];
    
    Ok(mods)
}

/// Download and install a mod
#[tauri::command]
async fn download_mod(instance_path: String, mod_info: ModInfo) -> Result<(), String> {
    println!("Downloading mod: {} to {}", mod_info.name, instance_path);
    
    // In production, this would:
    // 1. Download the mod file from the URL
    // 2. Save it to instance_path/mods/
    // 3. Verify the download
    
    tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
    
    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MinecraftVersion {
    pub id: String,
    pub release_type: String,
    pub release_time: String,
}

/// Get available Minecraft versions
#[tauri::command]
async fn get_minecraft_versions() -> Result<Vec<MinecraftVersion>, String> {
    // In production, fetch from Mojang's version manifest
    let versions = vec![
        MinecraftVersion { id: "1.21.4".to_string(), release_type: "release".to_string(), release_time: "2024-12-03".to_string() },
        MinecraftVersion { id: "1.21.3".to_string(), release_type: "release".to_string(), release_time: "2024-10-23".to_string() },
        MinecraftVersion { id: "1.21.1".to_string(), release_type: "release".to_string(), release_time: "2024-08-08".to_string() },
        MinecraftVersion { id: "1.20.6".to_string(), release_type: "release".to_string(), release_time: "2024-04-29".to_string() },
        MinecraftVersion { id: "1.20.4".to_string(), release_type: "release".to_string(), release_time: "2023-12-07".to_string() },
        MinecraftVersion { id: "1.20.1".to_string(), release_type: "release".to_string(), release_time: "2023-06-12".to_string() },
        MinecraftVersion { id: "1.19.4".to_string(), release_type: "release".to_string(), release_time: "2023-03-14".to_string() },
        MinecraftVersion { id: "1.18.2".to_string(), release_type: "release".to_string(), release_time: "2022-02-28".to_string() },
        MinecraftVersion { id: "1.16.5".to_string(), release_type: "release".to_string(), release_time: "2021-01-14".to_string() },
    ];
    
    Ok(versions)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JavaInfo {
    pub version: String,
    pub path: String,
    pub is_valid: bool,
}

/// Detect available Java installations
#[tauri::command]
async fn detect_java_installations() -> Result<Vec<JavaInfo>, String> {
    // In production, scan common Java installation paths
    let java_installs = vec![
        JavaInfo {
            version: "21.0.1".to_string(),
            path: "/usr/lib/jvm/java-21".to_string(),
            is_valid: true,
        },
        JavaInfo {
            version: "17.0.8".to_string(),
            path: "/usr/lib/jvm/java-17".to_string(),
            is_valid: true,
        },
    ];
    
    Ok(java_installs)
}

/// Install a mod loader (Forge/Fabric) for a specific version
#[tauri::command]
async fn install_mod_loader(version: String, loader: String, instance_path: String) -> Result<(), String> {
    println!("Installing {} for Minecraft {} to {}", loader, version, instance_path);
    
    // In production:
    // 1. Download the mod loader installer
    // 2. Run the installer with --install-server or equivalent
    // 3. Set up the libraries
    
    tokio::time::sleep(tokio::time::Duration::from_millis(2000)).await;
    
    Ok(())
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
            search_mods_curseforge,
            download_mod,
            get_minecraft_versions,
            detect_java_installations,
            install_mod_loader,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
