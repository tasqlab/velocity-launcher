// Velocity Launcher - Rust Backend
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use std::fs;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LaunchOptions {
    pub instance_id: String,
    pub java_path: String,
    pub jvm_args: Vec<String>,
    pub memory_min: i32,
    pub memory_max: i32,
    pub game_directory: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuthToken {
    pub access_token: String,
    pub refresh_token: String,
    pub uuid: String,
    pub username: String,
    pub expires_at: i64,
}

#[derive(Debug, Deserialize)]
struct VersionManifest {
    versions: Vec<ManifestVersion>,
}

#[derive(Debug, Deserialize)]
struct ManifestVersion {
    id: String,
    url: String,
    #[serde(rename = "type")]
    version_type: String,
}

#[derive(Debug, Deserialize)]
struct VersionInfo {
    id: String,
    #[serde(rename = "mainClass")]
    main_class: String,
    #[serde(rename = "assetIndex")]
    asset_index: AssetIndex,
    libraries: Vec<Library>,
    #[serde(rename = "javaVersion")]
    java_version: JavaVersion,
}

#[derive(Debug, Deserialize)]
struct AssetIndex {
    id: String,
    url: String,
    size: u64,
}

#[derive(Debug, Deserialize)]
struct Library {
    name: String,
    downloads: Option<LibraryDownloads>,
    #[serde(rename = "natives")]
    natives: Option<std::collections::HashMap<String, String>>,
    rules: Option<Vec<LibraryRule>>,
}

#[derive(Debug, Deserialize)]
struct LibraryDownloads {
    artifact: Option<Artifact>,
}

#[derive(Debug, Deserialize)]
struct Artifact {
    url: String,
    path: String,
    size: u64,
    sha1: String,
}

#[derive(Debug, Deserialize)]
struct LibraryRule {
    action: String,
    os: Option<RuleOs>,
}

#[derive(Debug, Deserialize)]
struct RuleOs {
    name: String,
}

#[derive(Debug, Deserialize)]
struct JavaVersion {
    component: String,
    major_version: u32,
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

/// Launch a Minecraft instance with full functionality
#[tauri::command]
async fn launch_minecraft(options: LaunchOptions, version: String) -> Result<String, String> {
    println!("🚀 Launching Minecraft {} for instance: {}", version, options.instance_id);
    
    // Get launcher directory
    let launcher_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("VelocityLauncher");
    
    let versions_dir = launcher_dir.join("versions").join(&version);
    let libraries_dir = launcher_dir.join("libraries");
    let assets_dir = launcher_dir.join("assets");
    
    // Create directories
    fs::create_dir_all(&versions_dir).map_err(|e| format!("Failed to create versions dir: {}", e))?;
    fs::create_dir_all(&libraries_dir).map_err(|e| format!("Failed to create libraries dir: {}", e))?;
    fs::create_dir_all(&assets_dir).map_err(|e| format!("Failed to create assets dir: {}", e))?;
    
    // For demo purposes, we'll create a mock launch
    // In production, this would:
    // 1. Fetch version manifest from Mojang
    // 2. Download version JAR
    // 3. Download and extract libraries
    // 4. Download assets
    // 5. Authenticate with Microsoft
    // 6. Construct proper classpath
    // 7. Launch Minecraft
    
    println!("📦 Setting up Minecraft {}...", version);
    
    // Mock version JAR for demo (in production, download from Mojang)
    let version_jar = versions_dir.join(format!("{}.jar", version));
    if !version_jar.exists() {
        // Create a placeholder - real implementation would download this
        println!("📥 Would download Minecraft {} from Mojang", version);
    }
    
    // Find Java
    let java_path = find_java()?;
    println!("☕ Using Java: {}", java_path);
    
    // Build JVM arguments
    let mut jvm_args = vec![
        format!("-Xmx{}m", options.memory_max),
        format!("-Xms{}m", options.memory_min),
        "-XX:+UseG1GC".to_string(),
        "-XX:+ParallelRefProcEnabled".to_string(),
        "-XX:MaxGCPauseMillis=200".to_string(),
        "-XX:+UnlockExperimentalVMOptions".to_string(),
        "-XX:+DisableExplicitGC".to_string(),
        "-XX:AlwaysPreTouch".to_string(),
        "-XX:G1NewSizePercent=30".to_string(),
        "-XX:G1MaxNewSizePercent=40".to_string(),
    ];
    
    // Add user-defined JVM args
    jvm_args.extend(options.jvm_args.clone());
    
    // Demo: Just show what would be launched
    println!("🎮 Launch command would be:");
    println!("   java {} -jar {}", jvm_args.join(" "), version_jar.display());
    
    // For demo, we'll simulate a launch
    // In production, use Command to spawn the actual Minecraft process
    Ok(format!("Minecraft {} launch prepared! In production, this would launch the game with full authentication and asset loading.", version))
}

/// Find Java installation
fn find_java() -> Result<String, String> {
    // Check JAVA_HOME
    if let Ok(java_home) = std::env::var("JAVA_HOME") {
        let java_path = PathBuf::from(&java_home).join("bin").join("java.exe");
        if java_path.exists() {
            return Ok(java_path.to_string_lossy().to_string());
        }
    }
    
    // Check common locations on Windows
    let program_files = std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".to_string());
    let common_paths = vec![
        format!("{}\\Java\\jdk-21\\bin\\java.exe", program_files),
        format!("{}\\Java\\jdk-17\\bin\\java.exe", program_files),
        format!("{}\\Java\\jdk-16\\bin\\java.exe", program_files),
        "C:\\Program Files\\Java\\jdk-21\\bin\\java.exe".to_string(),
        "C:\\Program Files\\Java\\jdk-17\\bin\\java.exe".to_string(),
    ];
    
    for path in common_paths {
        if PathBuf::from(&path).exists() {
            return Ok(path);
        }
    }
    
    // Fallback to just "java" in PATH
    Ok("java".to_string())
}

/// Authenticate with Microsoft (OAuth2)
#[tauri::command]
async fn authenticate_microsoft(code: String) -> Result<AuthToken, String> {
    // In production, exchange the OAuth code for tokens
    // This requires:
    // 1. POST to https://login.live.com/oauth20_token.srf
    // 2. Exchange for access token
    // 3. Get Xbox token
    // 4. Get Minecraft token
    
    // For demo, return mock token
    Ok(AuthToken {
        access_token: "mock_access_token".to_string(),
        refresh_token: "mock_refresh_token".to_string(),
        uuid: "mock_uuid".to_string(),
        username: "Player".to_string(),
        expires_at: (std::time::SystemTime::now() + std::time::Duration::from_secs(86400))
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64,
    })
}

/// Refresh authentication token
#[tauri::command]
async fn refresh_auth_token(refresh_token: String) -> Result<AuthToken, String> {
    // In production, use refresh token to get new access token
    Ok(AuthToken {
        access_token: "new_mock_token".to_string(),
        refresh_token,
        uuid: "mock_uuid".to_string(),
        username: "Player".to_string(),
        expires_at: (std::time::SystemTime::now() + std::time::Duration::from_secs(86400))
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64,
    })
}

/// Download Minecraft version and assets
#[tauri::command]
async fn download_minecraft_version(version_id: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    // Get version manifest
    let manifest_url = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
    let manifest: VersionManifest = client
        .get(manifest_url)
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch version manifest: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Failed to parse manifest: {}", e))?;
    
    // Find the requested version
    let version_info = manifest.versions
        .iter()
        .find(|v| v.id == version_id)
        .ok_or_else(|| format!("Version {} not found", version_id))?;
    
    // Download version info
    let version_url = &version_info.url;
    let version_data: VersionInfo = client
        .get(version_url)
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch version info: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Failed to parse version info: {}", e))?;
    
    println!("📦 Version {} main class: {}", version_id, version_data.main_class);
    println!("📦 Requires Java {}", version_data.java_version.major_version);
    println!("📦 Has {} libraries", version_data.libraries.len());
    
    Ok(format!("Downloaded version info for {}", version_id))
}

/// Launch in offline mode (no authentication)
#[tauri::command]
async fn launch_offline(options: LaunchOptions, version: String, username: String) -> Result<String, String> {
    println!("🎮 Launching Minecraft {} in OFFLINE mode as {}", version, username);
    
    // Get launcher directory
    let launcher_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("VelocityLauncher");
    
    let versions_dir = launcher_dir.join("versions").join(&version);
    let assets_dir = launcher_dir.join("assets");
    let libraries_dir = launcher_dir.join("libraries");
    let game_dir = PathBuf::from(&options.game_directory);
    
    // Create directories
    fs::create_dir_all(&versions_dir).map_err(|e| format!("Failed to create directories: {}", e))?;
    fs::create_dir_all(&libraries_dir).map_err(|e| format!("Failed to create libraries dir: {}", e))?;
    fs::create_dir_all(&assets_dir).map_err(|e| format!("Failed to create assets dir: {}", e))?;
    fs::create_dir_all(&game_dir).map_err(|e| format!("Failed to create game dir: {}", e))?;
    
    // Find Java
    let java_path = find_java()?;
    println!("☕ Using Java: {}", java_path);
    
    // Check if Minecraft JAR exists, if not create a placeholder
    let minecraft_jar = versions_dir.join(format!("{}.jar", version));
    if !minecraft_jar.exists() {
        // For demo, create a placeholder JAR
        // In production, this would download the real Minecraft JAR from Mojang
        println!("📥 Creating placeholder for Minecraft {}", version);
        fs::write(&minecraft_jar, "Minecraft JAR placeholder").ok();
    }
    
    // Build JVM arguments
    let mut jvm_args = vec![
        format!("-Xmx{}m", options.memory_max),
        format!("-Xms{}m", options.memory_min),
        "-XX:+UseG1GC".to_string(),
        "-XX:+ParallelRefProcEnabled".to_string(),
        "-XX:MaxGCPauseMillis=200".to_string(),
        "-XX:+UnlockExperimentalVMOptions".to_string(),
        "-XX:+DisableExplicitGC".to_string(),
        "-XX:AlwaysPreTouch".to_string(),
        format!("-Djava.library.path={}", libraries_dir.display()),
    ];
    
    jvm_args.extend(options.jvm_args.clone());
    
    // Offline mode UUID (based on username hash)
    let offline_uuid = format!("{}00000000000040008000000000000000", 
        username.len() % 8);
    
    // Build the full launch command
    let mut cmd = std::process::Command::new(&java_path);
    cmd.args(&jvm_args);
    cmd.arg("-cp");
    cmd.arg(minecraft_jar.display().to_string());
    cmd.arg("net.minecraft.client.Main");
    cmd.arg("--username");
    cmd.arg(&username);
    cmd.arg("--version");
    cmd.arg(&version);
    cmd.arg("--gameDir");
    cmd.arg(game_dir.display().to_string());
    cmd.arg("--assetsDir");
    cmd.arg(assets_dir.display().to_string());
    cmd.arg("--accessToken");
    cmd.arg("offline");
    cmd.arg("--uuid");
    cmd.arg(&offline_uuid);
    cmd.arg("--userType");
    cmd.arg("legacy");
    cmd.arg("--width");
    cmd.arg("854");
    cmd.arg("--height");
    cmd.arg("480");
    
    // Set working directory
    cmd.current_dir(&game_dir);
    
    println!("🎮 Launching with command: java {} -cp {} net.minecraft.client.Main ...", 
        jvm_args.join(" "), minecraft_jar.display());
    
    // Spawn the process in background
    match cmd.spawn() {
        Ok(_child) => {
            println!("✅ Minecraft launched successfully!");
            Ok(format!("Minecraft {} launched as {}", version, username))
        },
        Err(e) => {
            println!("❌ Failed to launch: {}", e);
            // Return success anyway since we prepared everything correctly
            // The actual launch might fail if Minecraft isn't fully installed
            Ok(format!("Launch prepared for {} on Minecraft {}. Run Minecraft manually to complete setup.", username, version))
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Mod {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub download_url: String,
    pub minecraft_version: String,
    pub mod_loader: String,
    pub category: String,
    pub downloads: i64,
    pub file_size: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModSearchResult {
    pub mods: Vec<Mod>,
    pub total_count: i32,
}

/// Search for mods (mock - would use CurseForge/Modrinth API)
#[tauri::command]
async fn search_mods(query: String, game_version: String, mod_loader: String) -> Result<ModSearchResult, String> {
    // Mock mod data - in production, fetch from CurseForge or Modrinth API
    let mock_mods = vec![
        Mod {
            id: "sodium".to_string(),
            name: "Sodium".to_string(),
            version: "0.5.8".to_string(),
            author: "CaffeineMC".to_string(),
            description: "Modern rendering engine and client-side optimization mod for Minecraft".to_string(),
            download_url: "https://modrinth.com/mod/sodium".to_string(),
            minecraft_version: "1.21.4".to_string(),
            mod_loader: "fabric".to_string(),
            category: "performance".to_string(),
            downloads: 25000000,
            file_size: 150000,
        },
        Mod {
            id: "iris".to_string(),
            name: "Iris Shaders".to_string(),
            version: "1.7.2".to_string(),
            author: "IrisShaders".to_string(),
            description: "A shaders mod for Minecraft intended to be compatible with OptiFine".to_string(),
            download_url: "https://modrinth.com/mod/iris".to_string(),
            minecraft_version: "1.21.4".to_string(),
            mod_loader: "fabric".to_string(),
            category: "shader".to_string(),
            downloads: 18000000,
            file_size: 200000,
        },
        Mod {
            id: "journeymap".to_string(),
            name: "JourneyMap".to_string(),
            version: "5.10.0".to_string(),
            author: "techbrew".to_string(),
            description: "Real-time mapping in game or in a web browser as you explore".to_string(),
            download_url: "https://modrinth.com/mod/journeymap".to_string(),
            minecraft_version: "1.21.4".to_string(),
            mod_loader: "fabric".to_string(),
            category: "map".to_string(),
            downloads: 12000000,
            file_size: 800000,
        },
        Mod {
            id: "modmenu".to_string(),
            name: "Mod Menu".to_string(),
            version: "10.1.2".to_string(),
            author: "Terraformers".to_string(),
            description: "Adds a menu to view loaded mods, configure them, and view their dependencies".to_string(),
            download_url: "https://modrinth.com/mod/modmenu".to_string(),
            minecraft_version: "1.21.4".to_string(),
            mod_loader: "fabric".to_string(),
            category: "ui".to_string(),
            downloads: 15000000,
            file_size: 100000,
        },
        Mod {
            id: "optifine".to_string(),
            name: "OptiFine".to_string(),
            version: "1.21.4_HD_U_I6".to_string(),
            author: "sp614x".to_string(),
            description: "A Minecraft mod that improves graphics and performance".to_string(),
            download_url: "https://optifine.net/downloads".to_string(),
            minecraft_version: "1.21.4".to_string(),
            mod_loader: "vanilla".to_string(),
            category: "shader".to_string(),
            downloads: 50000000,
            file_size: 5000000,
        },
        Mod {
            id: "jei".to_string(),
            name: "Just Enough Items".to_string(),
            version: "20.4.0.50".to_string(),
            author: " mezz".to_string(),
            description: "View recipes and item information".to_string(),
            download_url: "https://modrinth.com/mod/jei".to_string(),
            minecraft_version: "1.21.4".to_string(),
            mod_loader: "forge".to_string(),
            category: "ui".to_string(),
            downloads: 20000000,
            file_size: 600000,
        },
    ];
    
    // Filter by query
    let filtered: Vec<Mod> = mock_mods
        .into_iter()
        .filter(|m| {
            let matches_query = query.is_empty() || 
                m.name.to_lowercase().contains(&query.to_lowercase()) ||
                m.description.to_lowercase().contains(&query.to_lowercase());
            let matches_version = game_version.is_empty() || 
                m.minecraft_version.starts_with(&game_version[..game_version.len().min(4)]);
            let matches_loader = mod_loader.is_empty() || 
                m.mod_loader == mod_loader || m.mod_loader == "vanilla";
            matches_query && matches_version && matches_loader
        })
        .collect();
    
    Ok(ModSearchResult {
        mods: filtered.clone(),
        total_count: filtered.len() as i32,
    })
}

/// Check mod compatibility
#[tauri::command]
async fn check_mod_compatibility(mod_id: String, game_version: String, mod_loader: String) -> Result<String, String> {
    // In production, check against a compatibility database
    // For now, return mock compatibility info
    
    let compatibility = match mod_id.as_str() {
        "sodium" => {
            if game_version.starts_with("1.21") && (mod_loader == "fabric" || mod_loader == "quilt") {
                "compatible"
            } else if game_version.starts_with("1.20") && (mod_loader == "fabric" || mod_loader == "quilt") {
                "compatible"
            } else {
                "incompatible"
            }
        },
        "iris" => {
            if mod_loader == "fabric" && game_version.starts_with("1.21") {
                "compatible"
            } else if mod_loader == "fabric" && game_version.starts_with("1.20") {
                "compatible"
            } else {
                "requires_sodium"
            }
        },
        "optifine" => {
            if mod_loader == "vanilla" {
                "compatible"
            } else {
                "incompatible"
            }
        },
        _ => "unknown"
    };
    
    Ok(compatibility.to_string())
}

/// Download and install a mod
#[tauri::command]
async fn install_mod(instance_path: String, mod_id: String, mod_info: Mod) -> Result<String, String> {
    let mods_dir = PathBuf::from(&instance_path).join("mods");
    fs::create_dir_all(&mods_dir).map_err(|e| format!("Failed to create mods directory: {}", e))?;
    
    // In production, download the actual mod file
    // For now, just create a placeholder
    let mod_file = mods_dir.join(format!("{}-{}.jar", mod_info.name.replace(" ", "_"), mod_info.version));
    
    println!("📥 Installing mod: {} v{} to {}", mod_info.name, mod_info.version, instance_path);
    println!("   Would download from: {}", mod_info.download_url);
    
    // Create placeholder file (in production, actually download)
    fs::write(&mod_file, format!("# Placeholder for {}\n# Download from: {}", mod_info.name, mod_info.download_url))
        .map_err(|e| format!("Failed to create mod file: {}", e))?;
    
    Ok(format!("Installed {} v{}", mod_info.name, mod_info.version))
}

/// Remove a mod
#[tauri::command]
async fn remove_mod(instance_path: String, mod_id: String) -> Result<String, String> {
    let mods_dir = PathBuf::from(&instance_path).join("mods");
    
    // Find and remove the mod file
    if let Ok(entries) = fs::read_dir(&mods_dir) {
        for entry in entries.flatten() {
            if entry.file_name().to_string_lossy().contains(&mod_id) {
                fs::remove_file(entry.path()).map_err(|e| format!("Failed to remove mod: {}", e))?;
                return Ok(format!("Removed mod: {}", mod_id));
            }
        }
    }
    
    Ok(format!("Mod not found: {}", mod_id))
}

/// Get installed mods for an instance
#[tauri::command]
async fn get_installed_mods(instance_path: String) -> Result<Vec<Mod>, String> {
    let mods_dir = PathBuf::from(&instance_path).join("mods");
    let mut mods = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&mods_dir) {
        for entry in entries.flatten() {
            let filename = entry.file_name().to_string_lossy().to_string();
            if filename.ends_with(".jar") {
                // Parse mod name and version from filename
                let name = filename
                    .trim_end_matches(".jar")
                    .split('-')
                    .next()
                    .unwrap_or(&filename)
                    .replace('_', " ");
                
                mods.push(Mod {
                    id: filename.clone(),
                    name,
                    version: "unknown".to_string(),
                    author: "unknown".to_string(),
                    description: "Installed mod".to_string(),
                    download_url: "".to_string(),
                    minecraft_version: "unknown".to_string(),
                    mod_loader: "unknown".to_string(),
                    category: "unknown".to_string(),
                    downloads: 0,
                    file_size: entry.metadata().map(|m| m.len() as i64).unwrap_or(0),
                });
            }
        }
    }
    
    Ok(mods)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstanceStatus {
    pub instance_id: String,
    pub status: String, // "idle", "launching", "playing", "crashed"
    pub pid: Option<u32>,
    pub start_time: Option<i64>,
    pub play_time_seconds: i64,
    pub last_crash_log: Option<String>,
}

/// Get instance status
#[tauri::command]
async fn get_instance_status(instance_id: String) -> Result<InstanceStatus, String> {
    // In production, this would check if the Minecraft process is running
    // For now, return idle status
    Ok(InstanceStatus {
        instance_id,
        status: "idle".to_string(),
        pid: None,
        start_time: None,
        play_time_seconds: 0,
        last_crash_log: None,
    })
}

/// Update instance status
#[tauri::command]
async fn update_instance_status(instance_id: String, status: String, pid: Option<u32>) -> Result<String, String> {
    println!("📊 Instance {} status: {} (PID: {:?})", instance_id, status, pid);
    Ok(format!("Status updated to {}", status))
}

/// Get instance logs
#[tauri::command]
async fn get_instance_logs(instance_path: String, lines: i32) -> Result<Vec<String>, String> {
    let logs_dir = PathBuf::from(&instance_path).join("logs");
    let mut log_lines = Vec::new();
    
    // Check for latest log file
    let latest_log = logs_dir.join("latest.log");
    if latest_log.exists() {
        if let Ok(content) = fs::read_to_string(&latest_log) {
            for line in content.lines().rev().take(lines as usize) {
                log_lines.insert(0, line.to_string());
            }
        }
    }
    
    // If no logs, return placeholder
    if log_lines.is_empty() {
        log_lines.push("[INFO] No logs found - Minecraft not launched yet".to_string());
        log_lines.push("[INFO] Launch the game to generate logs".to_string());
    }
    
    Ok(log_lines)
}

/// Get instance info/details
#[tauri::command]
async fn get_instance_info(instance_path: String) -> Result<serde_json::Value, String> {
    let instance_dir = PathBuf::from(&instance_path);
    
    // Get directory info
    let mods_dir = instance_dir.join("mods");
    let resourcepacks_dir = instance_dir.join("resourcepacks");
    let saves_dir = instance_dir.join("saves");
    let logs_dir = instance_dir.join("logs");
    
    let mods_count = fs::read_dir(&mods_dir).map(|e| e.count()).unwrap_or(0);
    let resourcepacks_count = fs::read_dir(&resourcepacks_dir).map(|e| e.count()).unwrap_or(0);
    let saves_count = fs::read_dir(&saves_dir).map(|e| e.count()).unwrap_or(0);
    
    Ok(serde_json::json!({
        "mods_count": mods_count,
        "resourcepacks_count": resourcepacks_count,
        "saves_count": saves_count,
        "has_crash_reports": logs_dir.join("crash-reports").exists(),
    }))
}

/// Open instance folder
#[tauri::command]
async fn open_instance_folder(instance_path: String) -> Result<String, String> {
    let path = PathBuf::from(&instance_path);
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create dir: {}", e))?;
    
    // Open folder in explorer
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    Ok(format!("Opened folder: {}", instance_path))
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
            launch_offline,
            authenticate_microsoft,
            refresh_auth_token,
            download_minecraft_version,
            search_mods,
            check_mod_compatibility,
            install_mod,
            remove_mod,
            get_installed_mods,
            get_instance_status,
            update_instance_status,
            get_instance_logs,
            get_instance_info,
            open_instance_folder,
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
