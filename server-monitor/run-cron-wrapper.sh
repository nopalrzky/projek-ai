#!/usr/bin/env bash
# Auto-switch model wrapper per minute
# Detects user intent (coding vs casual) and updates ~/.hermes/config.yaml model.default

SCRIPT_PATH="/Users/naufalrizky/projek ai/server-monitor/api/cron-model-switch.js"
LOG_DIR="/Users/naufalrizky/projek ai/server-monitor/logs"
LOGFILE="${LOG_DIR}/cron-model-switch.log"
mkdir -p "${LOG_DIR}"

# Ensure script path quoting is correct
if [ ! -f "${SCRIPT_PATH}" ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') — ERROR: Script not found at ${SCRIPT_PATH}" >> "${LOGFILE}"
  exit 1
fi

while true; do
  echo "$(date '+%Y-%m-%d %H:%M:%S') — menjalankan model switch" >> "${LOGFILE}"

  # Run with correct node path
  /usr/local/bin/node "${SCRIPT_PATH}" >> "${LOGFILE}" 2>&1

  if [ $? -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') — Model switch completed successfully" >> "${LOGFILE}"
  else
    echo "$(date '+%Y-%m-%d %H:%M:%S') — ERROR: Model switch failed" >> "${LOGFILE}"
  fi

  sleep 60
done