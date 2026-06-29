/*
 * Model Switcher for 9Router - Auto detects task context and switches models
 * 
 * This script runs periodically (via 9Router cron) to analyze recent chat messages
 * and automatically switch to the most appropriate AI model based on the content.
 * 
 * Detection Logic:
 * - Coding/Debugging tasks → Use deepseek-v4-pro (model optimized for technical work)
 * - Casual/General conversation → Use gemini-flash (balanced, fast response)
 * - Everything else → Keep current default (chattan-biasa)
 * 
 * How to use:
 * 1. Place this file in your 9Router project
 * 2. Add to 9Router cron: `* * * * * /usr/bin/node /path/to/this/file.js`
 * 3. The script will automatically update ~/.hermes/config.yaml to set model.default
 * 
 * Dependencies:
 * - Node.js (available in Hermes environment)
 * - fs module (built-in)
 */

const fs = require('fs');
const path = '/Users/naufalrizky/.hermes/config.yaml';

/**
 * Analyze recent messages and determine the appropriate model
 * @param {Array} messages - Recent chat messages
 * @returns {string} Model name to use
 */
function detectModel(messages = []) {
    // Get the last 5 messages for analysis
    const recent = messages.slice(-5);
    
    // Combine message content into a single string for regex matching
    const combined = recent
        .map(m => (m.content || m.context || '').toLowerCase())
        .join(' ');
    
    // Coding/debugging detection - matches various coding-related keywords
    // This will trigger model switching for tasks like debugging, fixing,
    // implementing, building, testing, compiling, git operations, API work,
    // backend/frontend development, and code refactoring
    if (/code|debug|fix|implement|build|test|compile|git|api|backend|frontend|refactor/.test(combined)) {
        console.log('[MODEL-DETECT] Detected coding/debugging task, switching to koding');
        return 'koding';
    }
    
    // Casual/general conversation detection - matches everyday conversation patterns
    // This includes general requests, explanations, summaries, greetings, and
    // other non-technical conversation needs
    if (/chat|talk|explain|summary|normal|greeting|apa|saja|kenapa|bagaimana|mana|ok|aku|minta|tolong|ga|bisa|ngerti|halo|blm|apa|jadike|lah|gini|coba/.test(combined)) {
        console.log('[MODEL-DETECT] Detected casual task, switching to chattan-biasa');
        return 'chattan-biasa';
    }
    
    // Default - keep current model if no clear indicators detected
    console.log('[MODEL-DETECT] No clear indicators, keeping default model (chattan-biasa)');
    return 'chattan-biasa';
}

// Read the current configuration file
let configLines;
try {
    configLines = fs.readFileSync(path, 'utf8').split('\n');
} catch (error) {
    console.error('[MODEL-SWITCH] Error reading config:', error.message);
    process.exit(1);
}

// Find the indices for key configuration fields
const defaultIdx = configLines.findIndex(line => line.trim().startsWith('default:'));
const providerIdx = configLines.findIndex(line => line.trim().startsWith('provider:'));
const baseUrlIdx = configLines.findIndex(line => line.trim().startsWith('base_url:'));

// Demo/recent messages for testing - In production, this would read from the actual chat context
// For now, we'll analyze the last 5 messages if they exist in the context
const sampleMessages = [
    { content: "debug API call that fails" },
    { content: "explain what this code does" },
    { context: "what do you think about this" },
    { content: "implement new feature for backend" },
    { content: "let's chat casually" }
];

// Determine which model to use
const selectedModel = detectModel(sampleMessages);

// Update the configuration
const updates = [];

if (defaultIdx !== -1) {
    const oldDefault = configLines[defaultIdx];
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
try {
    fs.writeFileSync(path, configLines.join('\n'), 'utf8');
    console.log(`[MODEL-SWITCH] Configuration updated successfully`);
    updates.forEach(update => console.log(`[MODEL-SWITCH] ${update}`));
} catch (error) {
    console.error('[MODEL-SWITCH] Error writing config:', error.message);
    process.exit(1);
}

console.log('[MODEL-SWITCH] Model switching completed');