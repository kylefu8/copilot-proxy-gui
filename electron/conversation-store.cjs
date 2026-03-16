/**
 * Conversation storage for Electron main process.
 *
 * Saves conversation entries as JSON files organized by session.
 * Storage path: {userData}/conversations/
 *
 * File layout:
 *   conversations/
 *     index.json              — session index: [{sessionId, client, model, startTime, entryCount}]
 *     sess_xxxxxxxx.json      — entries for a single session
 */

const fs = require('node:fs')
const path = require('node:path')

let conversationsDir = null

function ensureDir() {
  if (!conversationsDir) throw new Error('Conversation store not initialized')
  if (!fs.existsSync(conversationsDir)) {
    fs.mkdirSync(conversationsDir, { recursive: true })
  }
}

/**
 * Initialize the store with the app's userData directory.
 * @param {string} userDataPath — e.g., app.getPath('userData')
 */
function init(userDataPath) {
  conversationsDir = path.join(userDataPath, 'conversations')
  ensureDir()
}

/**
 * Append a conversation entry to its session file and update the index.
 * @param {object} entry — parsed conversation entry from [CONV] line
 */
function appendConversation(entry) {
  ensureDir()

  const sessionId = entry.sessionId || 'unknown'
  const sessionFile = path.join(conversationsDir, `${sessionId}.json`)

  // Read or create session file
  let entries = []
  if (fs.existsSync(sessionFile)) {
    try {
      entries = JSON.parse(fs.readFileSync(sessionFile, 'utf8'))
    } catch {
      entries = []
    }
  }
  entries.push(entry)
  fs.writeFileSync(sessionFile, JSON.stringify(entries, null, 2), 'utf8')

  // Update index
  updateIndex(entry)
}

/**
 * Update the session index file.
 */
function updateIndex(entry) {
  const indexFile = path.join(conversationsDir, 'index.json')
  let index = []
  if (fs.existsSync(indexFile)) {
    try {
      index = JSON.parse(fs.readFileSync(indexFile, 'utf8'))
    } catch {
      index = []
    }
  }

  const sessionId = entry.sessionId || 'unknown'
  const existing = index.find(s => s.sessionId === sessionId)
  if (existing) {
    existing.entryCount = (existing.entryCount || 0) + 1
    existing.lastTime = entry.timestamp
    // Update model if changed within session
    existing.model = entry.model
  } else {
    index.push({
      sessionId,
      client: entry.client?.type || 'unknown',
      model: entry.model,
      startTime: entry.timestamp,
      lastTime: entry.timestamp,
      entryCount: 1,
    })
  }

  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf8')
}

/**
 * List all sessions from the index.
 * @returns {Array} session summaries sorted by most recent first
 */
function listSessions() {
  ensureDir()
  const indexFile = path.join(conversationsDir, 'index.json')
  if (!fs.existsSync(indexFile)) return []
  try {
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'))
    return index.sort((a, b) => (b.lastTime || '').localeCompare(a.lastTime || ''))
  } catch {
    return []
  }
}

/**
 * Load all entries for a specific session.
 * @param {string} sessionId
 * @returns {Array} conversation entries
 */
function loadSession(sessionId) {
  ensureDir()
  const sessionFile = path.join(conversationsDir, `${sessionId}.json`)
  if (!fs.existsSync(sessionFile)) return []
  try {
    return JSON.parse(fs.readFileSync(sessionFile, 'utf8'))
  } catch {
    return []
  }
}

/**
 * Delete specific sessions by their IDs.
 * @param {string[]} sessionIds
 */
function deleteSessions(sessionIds) {
  ensureDir()
  const idSet = new Set(sessionIds)

  // Delete session files
  for (const id of idSet) {
    const sessionFile = path.join(conversationsDir, `${id}.json`)
    if (fs.existsSync(sessionFile)) {
      fs.unlinkSync(sessionFile)
    }
  }

  // Update index
  const indexFile = path.join(conversationsDir, 'index.json')
  if (fs.existsSync(indexFile)) {
    try {
      let index = JSON.parse(fs.readFileSync(indexFile, 'utf8'))
      index = index.filter(s => !idSet.has(s.sessionId))
      fs.writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf8')
    } catch { /* ignore */ }
  }
}

/**
 * Delete all conversation data.
 */
function clearAll() {
  ensureDir()
  const files = fs.readdirSync(conversationsDir)
  for (const file of files) {
    fs.unlinkSync(path.join(conversationsDir, file))
  }
}

/**
 * Get the storage directory path.
 */
function getStoragePath() {
  return conversationsDir
}

module.exports = { init, appendConversation, listSessions, loadSession, deleteSessions, clearAll, getStoragePath }
