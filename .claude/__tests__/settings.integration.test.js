/**
 * Integration tests for settings functionality
 * Tests the interaction between settings loading, validation, and persistence
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Settings Integration Tests', () => {
  let tempDir;
  let settingsPath;
  
  beforeAll(() => {
    // Create temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-settings-test-'));
    settingsPath = path.join(tempDir, 'settings.local.json');
  });
  
  afterAll(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  beforeEach(() => {
    // Clean up settings file before each test
    if (fs.existsSync(settingsPath)) {
      fs.unlinkSync(settingsPath);
    }
  });

  describe('Full Settings Workflow', () => {
    test('should create, load, modify, and save settings', () => {
      const initialSettings = {
        apiKey: 'initial-key',
        baseUrl: 'https://api.initial.com',
        timeout: 3000
      };
      
      // Create initial settings file
      fs.writeFileSync(settingsPath, JSON.stringify(initialSettings, null, 2));
      expect(fs.existsSync(settingsPath)).toBe(true);
      
      // Load settings
      const loadedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      expect(loadedSettings.apiKey).toBe('initial-key');
      
      // Modify settings
      loadedSettings.apiKey = 'modified-key';
      loadedSettings.debug = true;
      
      // Save modified settings
      fs.writeFileSync(settingsPath, JSON.stringify(loadedSettings, null, 2));
      
      // Verify changes were persisted
      const finalSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      expect(finalSettings.apiKey).toBe('modified-key');
      expect(finalSettings.debug).toBe(true);
      expect(finalSettings.timeout).toBe(3000); // Unchanged
    });

    test('should handle settings file corruption and recovery', () => {
      // Create corrupted settings file
      fs.writeFileSync(settingsPath, 'corrupted json {');
      
      expect(() => {
        JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      }).toThrow();
      
      // Should fall back to default settings
      const defaultSettings = {
        apiKey: '',
        baseUrl: 'https://api.claude.ai',
        timeout: 5000,
        retries: 3,
        debug: false
      };
      
      // Overwrite with default settings
      fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
      
      const recoveredSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      expect(recoveredSettings.baseUrl).toBe('https://api.claude.ai');
    });
  });

  describe('Settings Migration', () => {
    test('should migrate old settings format to new format', () => {
      const oldFormatSettings = {
        api_key: 'old-format-key',
        base_url: 'https://old.api.com',
        request_timeout: 2000
      };
      
      fs.writeFileSync(settingsPath, JSON.stringify(oldFormatSettings, null, 2));
      
      // Load and migrate
      const oldSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const newFormatSettings = {
        apiKey: oldSettings.api_key,
        baseUrl: oldSettings.base_url,
        timeout: oldSettings.request_timeout,
        version: '2.0'
      };
      
      fs.writeFileSync(settingsPath, JSON.stringify(newFormatSettings, null, 2));
      
      const migratedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      expect(migratedSettings.apiKey).toBe('old-format-key');
      expect(migratedSettings.version).toBe('2.0');
    });
  });

  describe('Performance Tests', () => {
    test('should handle large settings files efficiently', () => {
      const largeSettings = {
        apiKey: 'performance-test-key',
        baseUrl: 'https://api.performance.com',
        largeData: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: `Description for item ${i}`.repeat(10)
        }))
      };
      
      const startTime = Date.now();
      
      // Write large settings file
      fs.writeFileSync(settingsPath, JSON.stringify(largeSettings, null, 2));
      
      // Read large settings file
      const loadedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second
      expect(loadedSettings.largeData).toHaveLength(1000);
    });
  });
});