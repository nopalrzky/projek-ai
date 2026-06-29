#!/usr/bin/env node

/**
 * Model Switch Wrapper for 9Router Auto-Switch System
 * This wrapper script runs the core model switching logic and logs the results.
 * 
 * The script is designed to be called via 9Router's cron scheduler:
 * "* * * * * /path/to/this/wrapper.js"
 * 
 * Features:
 * - Executes the model switching logic
 * - Logs all activity for debugging
 * - Handles script execution errors gracefully
 * - Provides clear logging for monitoring
 */

const path = require('path');
const { spawnSync } = require('child_process');

// Determine the directory this script is in (project root)
const scriptDir = path.dirname(__dirname);
const scriptPath = path.join(scriptDir, 'api', 'cron-model-switch.js');
const logPath = path.join(scriptDir, 'logs', 'cron-model-switch.log');

// Ensure logs directory exists
const logDir = path.dirname(logPath);
const fs = require('fs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Log the execution start
console.log(`[WRAPPER] Starting model switch at ${new Date().toISOString()}`);
console.log(`[WRAPPER] Project root: ${scriptDir}`);
console.log(`[WRAPPER] Script path: ${scriptPath}`);

// Execute the core model switching logic
console.log(`[WRAPPER] Executing model switching script...
`);
const result = spawnSync(process.execPath, [scriptPath], {
    cwd: scriptDir,
    stdio: 'pipe',
    encoding: 'utf-8'
});

// Log the core script's output to the log file
const logEntry = `
=== Model Switch Execution (${new Date().toISOString()}) ===\n` +
    (result.stdout || '') + '\n' +
    (result.stderr || '') + '\n' +
    `Exit code: ${result.status || 'N/A'}\n\n';

fs.appendFileSync(logPath, logEntry, 'utf-8');

// Show a summary to the console
console.log(`[WRAPPER] Model switch completed`);
console.log(`[WRAPPER] Exit status: ${result.status || 'N/A'}`);
console.log(`[WRAPPER] Logged to: ${logPath}`);

// If the script failed, log an error message
if (result.error) {
    console.error(`[WRAPPER] Error executing model switch: ${result.error.message}`);
}