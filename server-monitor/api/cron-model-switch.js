/*
 * Model Switcher for 9Router - Auto detects task context and switches models
 * 
 * This script reads actual Hermes session messages from the database
 * and automatically switches to the most appropriate AI model based on content.
 * 
 * Detection Logic:
 * - Coding/Debugging tasks → Use koding (deepseek-v4-pro via 9Router)
 * - Casual/General conversation → Use chattan-biasa (gemini-flash via 9Router)
 * - Everything else → Keep current default
 */

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const CONFIG_PATH = '/Users/naufalrizky/.hermes/config.yaml';
const DB_PATH = '/Users/naufalrizky/.hermes/state.db';

/**
 * Analyze recent messages and determine the appropriate model
 * @param {Array} messages - Recent chat messages
 * @returns {string} Model name to use
 */
function detectModel(messages = []) {
    const recent = messages.slice(-5);
    const combined = recent
        .map(m => (m.content || m.context || '').toLowerCase())
        .join(' ');

    // Coding/debugging detection
    if (/code|debug|fix|implement|build|test|compile|git|api|backend|frontend|refactor/.test(combined)) {
        console.log('[MODEL-DETECT] Detected coding/debugging task, switching to koding');
        return 'koding';
    }

    // Casual/general conversation detection
    if (/chat|talk|explain|summary|normal|greeting|apa|saja|kenapa|bagaimana|mana|ok|aku|minta|tolong|ga|bisa|ngerti|halo|blm|apa|jadike|lah|gini|coba/.test(combined)) {
        console.log('[MODEL-DETECT] Detected casual task, switching to chattan-biasa');
        return 'chattan-biasa';
    }

    console.log('[MODEL-DETECT] No clear indicators, keeping default model (chattan-biasa)');
    return 'chattan-biasa';
}

/**
 * Fetch recent user messages from Hermes session database
 * @returns {Promise<Array>} Array of recent message objects
 */
function fetchRecentMessages() {
    return new Promise((resolve) => {
        const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error('[MODEL-SWITCH] Database connection error:', err.message);
                resolve([]);
                return;
            }

            // Get the most recent session ID
            db.get("SELECT id FROM sessions ORDER BY started_at DESC LIMIT 1", [], (err, session) => {
                if (err || !session) {
                    console.log('[MODEL-SWITCH] No active session found, using default model');
                    db.close();
                    resolve([]);
                    return;
                }

                // Get recent user messages from this session (exclude system messages)
                db.all(
                    `SELECT content FROM messages 
                     WHERE session_id = ? AND role = 'user' AND content IS NOT NULL 
                     AND content NOT LIKE '[System:%'
                     ORDER BY id DESC LIMIT 10`,
                    [session.id],
                    (err, rows) => {
                        db.close();
                        if (err) {
                            console.error('[MODEL-SWITCH] Query error:', err.message);
                            resolve([]);
                        } else {
                            const messages = rows.map(r => ({ content: r.content }));
                            console.log(`[MODEL-SWITCH] Fetched ${messages.length} recent user messages`);
                            resolve(messages);
                        }
                    }
                );
            });
        });
    });
}

/**
 * Read current default model from config
 */
function getCurrentDefault() {
    try {
        const config = fs.readFileSync(CONFIG_PATH, 'utf8');
        const match = config.match(/^\s*default:\s*["']?(\w+)["']?/m);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}

// Main execution
async function main() {
    try {
        // Fetch real recent messages from Hermes session database
        const sampleMessages = await fetchRecentMessages();
        
        if (sampleMessages.length === 0) {
            console.log('[MODEL-DETECT] No recent user messages found, skipping');
            process.exit(0);
        }

        // Determine which model to use based on actual conversation history
        const selectedModel = detectModel(sampleMessages);

        // Read current config
        const configLines = fs.readFileSync(CONFIG_PATH, 'utf8').split('\n');
        const currentDefault = getCurrentDefault();

        // Only switch if model actually changes
        if (currentDefault === selectedModel) {
            console.log(`[MODEL-SWITCH] Already using ${selectedModel}, no change needed`);
            process.exit(0);
        }

        console.log(`[MODEL-SWITCH] Switching from ${currentDefault} to ${selectedModel}`);

        // Find the indices for key configuration fields
        const defaultIdx = configLines.findIndex(line => line.trim().startsWith('default:'));
        const providerIdx = configLines.findIndex(line => line.trim().startsWith('provider:'));
        const baseUrlIdx = configLines.findIndex(line => line.trim().startsWith('base_url:'));

        const updates = [];

        if (defaultIdx !== -1) {
            const oldDefault = configLines[defaultIdx].trim();
            configLines[defaultIdx] = `  default: "${selectedModel}"\n`;
            updates.push(`default changed from ${oldDefault} to ${selectedModel}`);
        }

        if (providerIdx !== -1) {
            configLines[providerIdx] = `  provider: "custom:local-(localhost:20128)"\n`;
            updates.push('provider set to custom:local-(localhost:20128)');
        }

        if (baseUrlIdx !== -1) {
            configLines[baseUrlIdx] = `  base_url: "http://localhost:20128/v1"\n`;
            updates.push('base_url set to http://localhost:20128/v1');
        }

        // Write the updated configuration back to file
        fs.writeFileSync(CONFIG_PATH, configLines.join('\n'), 'utf8');
        console.log(`[MODEL-SWITCH] Configuration updated successfully`);
        updates.forEach(update => console.log(`[MODEL-SWITCH] ${update}`));

        console.log('[MODEL-SWITCH] Model switching completed');

    } catch (error) {
        console.error('[MODEL-SWITCH] Error:', error.message);
        process.exit(1);
    }
}

main();