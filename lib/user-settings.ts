import fs from 'fs';
import path from 'path';

// File-based storage for user LinkedIn settings
// TODO: Replace with database storage when schema is updated
const SETTINGS_FILE = path.join(process.cwd(), '.user-settings.json');

interface UserSettings {
  [userId: string]: {
    linkedinUsername?: string;
  };
}

function loadSettings(): UserSettings {
  try {
    console.log('📖 Attempting to load settings from:', SETTINGS_FILE);
    console.log('📖 File exists:', fs.existsSync(SETTINGS_FILE));
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const settings = JSON.parse(data);
      console.log('📖 Loaded settings:', JSON.stringify(settings, null, 2));
      return settings;
    } else {
      console.log('📖 Settings file does not exist, returning empty settings');
    }
  } catch (error) {
    console.error('❌ Error loading user settings:', error);
  }
  return {};
}

function saveSettings(settings: UserSettings): void {
  try {
    console.log('💾 Attempting to save settings to:', SETTINGS_FILE);
    console.log('💾 Settings data:', JSON.stringify(settings, null, 2));
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    console.log('✅ Settings saved successfully');
  } catch (error) {
    console.error('❌ Error saving user settings:', error);
    console.error('❌ Settings file path:', SETTINGS_FILE);
    console.error('❌ Process CWD:', process.cwd());
  }
}

export function getUserLinkedInUsername(userId: string): string | null {
  const settings = loadSettings();
  return settings[userId]?.linkedinUsername || null;
}

export function setUserLinkedInUsername(userId: string, username: string): void {
  const settings = loadSettings();
  if (!settings[userId]) {
    settings[userId] = {};
  }
  settings[userId].linkedinUsername = username;
  saveSettings(settings);
}

export function deleteUserLinkedInUsername(userId: string): void {
  const settings = loadSettings();
  if (settings[userId]) {
    delete settings[userId].linkedinUsername;
    if (Object.keys(settings[userId]).length === 0) {
      delete settings[userId];
    }
    saveSettings(settings);
  }
}

export function getAllUserSettings(): UserSettings {
  return loadSettings();
}
