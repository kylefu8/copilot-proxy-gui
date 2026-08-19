const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  buildAccountCommand,
  buildAccountCommandEnvironment,
  exitMultiAccountMode,
  getProxyDataDir,
  getRequestedAccountId,
  isAllowedGitHubVerificationUrl,
  parseJsonOutput,
  readAccountsSnapshot,
  redactCommandOutput,
  runProxyCommand,
  summarizeCommandFailure,
} = require('./account-operations.cjs')

test('only treats a non-empty string as a requested account id', () => {
  assert.equal(getRequestedAccountId(undefined), undefined)
  assert.equal(getRequestedAccountId(null), undefined)
  assert.equal(getRequestedAccountId(''), undefined)
  assert.equal(getRequestedAccountId('   '), undefined)
  assert.equal(getRequestedAccountId('personal'), 'personal')
})

test('uses the requested proxy data-dir defaults', () => {
  assert.equal(
    getProxyDataDir({
      platform: 'win32',
      env: { LOCALAPPDATA: 'C:\\Users\\tester\\AppData\\Local' },
      homedir: 'C:\\Users\\tester',
    }),
    'C:\\Users\\tester\\AppData\\Local\\copilot-proxy',
  )
  assert.equal(
    getProxyDataDir({
      platform: 'linux',
      env: { XDG_DATA_HOME: '/tmp/test-data' },
      homedir: '/home/tester',
    }),
    '/tmp/test-data/copilot-proxy',
  )
  assert.equal(
    getProxyDataDir({ platform: 'linux', env: {}, homedir: '/home/tester' }),
    '/home/tester/.local/share/copilot-proxy',
  )
  assert.equal(
    getProxyDataDir({ platform: 'linux', env: { XDG_DATA_HOME: 'relative' }, homedir: '/home/tester' }),
    '/home/tester/.local/share/copilot-proxy',
  )
})

test('normalizes absent and explicit account configuration', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-proxy-gui-accounts-'))
  try {
    assert.deepEqual(readAccountsSnapshot({ dataDir }), {
      explicit: false,
      defaultAccount: null,
      accounts: [],
      routes: [],
      requiredRoutes: [],
    })

    fs.writeFileSync(path.join(dataDir, 'accounts.json'), JSON.stringify({
      version: 1,
      revision: 3,
      defaultAccount: 'work',
      accounts: [{ id: 'work', accountType: 'enterprise', githubLogin: 'alice', githubUserId: 7, token: 'never-expose' }],
      routes: [{ match: 'claude-*', account: 'work', ignored: true }],
      requiredRoutes: [{ surface: 'anthropic-messages', model: 'claude-opus-4.8' }],
    }))

    assert.deepEqual(readAccountsSnapshot({ dataDir }), {
      explicit: true,
      version: 1,
      revision: 3,
      defaultAccount: 'work',
      accounts: [{ id: 'work', accountType: 'enterprise', githubLogin: 'alice', githubUserId: 7 }],
      routes: [{ match: 'claude-*', account: 'work' }],
      requiredRoutes: [{ surface: 'anthropic-messages', model: 'claude-opus-4.8' }],
    })
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true })
  }
})

test('builds fixed account arguments and rejects option injection', () => {
  assert.deepEqual(buildAccountCommand('account_add_saved_token', {
    id: 'work',
    accountType: 'enterprise',
    proxyEnv: true,
  }), [
    'accounts', 'add', 'work',
    '--account-type', 'enterprise',
    '--token-stdin', '--proxy-env', '--yes',
  ])
  assert.deepEqual(buildAccountCommand('account_route_set', {
    match: 'claude-*',
    account: 'work',
  }), ['accounts', 'route', 'set', 'claude-*', 'work', '--yes'])
  assert.throws(
    () => buildAccountCommand('account_set_default', { id: '--help' }),
    /Invalid account id/,
  )
  assert.throws(
    () => buildAccountCommand('account_route_remove', { match: '--yes' }),
    /Invalid route match/,
  )
})

test('scrubs ambient tokens and captures stdin, stdout, stderr, and exit code', async () => {
  const command = {
    bin: process.execPath,
    args: ['-e', "let input=''; process.stdin.setEncoding('utf8'); process.stdin.on('data', chunk => input += chunk); process.stdin.on('end', () => { process.stdout.write(JSON.stringify({ input })); process.stderr.write('diagnostic'); })"],
    env: {},
  }
  const result = await runProxyCommand({
    command,
    args: ['accounts', 'add', 'work', '--token-stdin', '--yes'],
    baseEnv: { GH_TOKEN: 'ambient', GITHUB_TOKEN: 'ambient-2', PATH: process.env.PATH },
    dataDir: '/tmp/copilot-proxy-test',
    stdinToken: 'secret-token',
  })

  assert.equal(result.exitCode, 0)
  assert.deepEqual(JSON.parse(result.stdout), { input: 'secret-token\n' })
  assert.equal(result.stderr, 'diagnostic')
  assert.equal(command.args.includes('secret-token'), false)

  const env = buildAccountCommandEnvironment({
    baseEnv: { GH_TOKEN: 'ambient', GITHUB_TOKEN: 'ambient-2', PATH: 'path' },
    dataDir: '/tmp/copilot-proxy-test',
  })
  assert.equal('GH_TOKEN' in env, false)
  assert.equal('GITHUB_TOKEN' in env, false)
  assert.equal(env.COPILOT_PROXY_DATA_DIR, '/tmp/copilot-proxy-test')
})

test('parses machine-readable model output', () => {
  assert.deepEqual(parseJsonOutput('\n{"object":"models","data":[{"id":"gpt-5.4"}]}\n'), {
    object: 'models',
    data: [{ id: 'gpt-5.4' }],
  })
})

test('allows only the GitHub HTTPS device verification page', () => {
  assert.equal(isAllowedGitHubVerificationUrl('https://github.com/login/device'), true)
  assert.equal(isAllowedGitHubVerificationUrl('https://github.com/login/device/'), true)
  assert.equal(isAllowedGitHubVerificationUrl('http://github.com/login/device'), false)
  assert.equal(isAllowedGitHubVerificationUrl('https://github.com.evil.example/login/device'), false)
  assert.equal(isAllowedGitHubVerificationUrl('https://user@github.com/login/device'), false)
  assert.equal(isAllowedGitHubVerificationUrl('https://github.com:444/login/device'), false)
  assert.equal(isAllowedGitHubVerificationUrl('https://github.com/settings/tokens'), false)
})

function writeSingleAccountFixture(dataDir, options = {}) {
  const token = Object.prototype.hasOwnProperty.call(options, 'token')
    ? options.token
    : 'ghp-single-account-secret'
  const accounts = options.accounts
  const configuredAccounts = accounts || [{
    id: 'default',
    accountType: 'individual',
    githubLogin: 'tester',
    githubUserId: 42,
  }]
  fs.mkdirSync(path.join(dataDir, 'tokens'), { recursive: true })
  fs.writeFileSync(path.join(dataDir, 'accounts.json'), JSON.stringify({
    version: 1,
    revision: 2,
    defaultAccount: configuredAccounts[0]?.id || 'default',
    accounts: configuredAccounts,
    routes: configuredAccounts.length === 1
      ? [{ match: 'claude-*', account: configuredAccounts[0].id }]
      : [],
  }))
  if (token !== undefined && configuredAccounts.length > 0) {
    fs.writeFileSync(path.join(dataDir, 'tokens', configuredAccounts[0].id), `${token}\n`)
  }
  return token
}

test('exits multi-account mode by encrypting through the legacy callback and atomically backing up config', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-proxy-gui-exit-'))
  const token = writeSingleAccountFixture(dataDir)
  const configPath = path.join(dataDir, 'accounts.json')
  const configBefore = fs.readFileSync(configPath)
  let callbackToken = null

  try {
    const result = exitMultiAccountMode({
      dataDir,
      now: () => 1700000000000,
      writeToken(value) {
        callbackToken = value
      },
    })

    assert.deepEqual(result, {
      ok: true,
      backupFileName: 'accounts.json.gui-backup-1700000000000',
    })
    assert.equal(callbackToken, token)
    assert.equal(fs.existsSync(configPath), false)
    assert.deepEqual(
      fs.readFileSync(path.join(dataDir, result.backupFileName)),
      configBefore,
    )
    assert.equal(fs.readFileSync(path.join(dataDir, 'tokens', 'default'), 'utf8').trim(), token)
    assert.equal(JSON.stringify(result).includes(token), false)
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true })
  }
})

test('rejects exit when more than one account is configured', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-proxy-gui-exit-many-'))
  let callbackCalled = false
  try {
    writeSingleAccountFixture(dataDir, {
      accounts: [
        { id: 'default', accountType: 'individual', githubLogin: 'tester', githubUserId: 42 },
        { id: 'work', accountType: 'business', githubLogin: 'worker', githubUserId: 43 },
      ],
    })
    assert.throws(
      () => exitMultiAccountMode({
        dataDir,
        writeToken() {
          callbackCalled = true
        },
      }),
      /exactly one configured account is required/,
    )
    assert.equal(callbackCalled, false)
    assert.equal(fs.existsSync(path.join(dataDir, 'accounts.json')), true)
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true })
  }
})

test('rejects exit when the account token is missing or a lock may be active', () => {
  const missingTokenDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-proxy-gui-exit-no-token-'))
  const lockedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-proxy-gui-exit-lock-'))
  try {
    writeSingleAccountFixture(missingTokenDir, { token: undefined })
    assert.throws(
      () => exitMultiAccountMode({ dataDir: missingTokenDir, writeToken() {} }),
      /account token file is missing/,
    )

    writeSingleAccountFixture(lockedDir)
    fs.mkdirSync(path.join(lockedDir, 'runtime.lock'))
    assert.throws(
      () => exitMultiAccountMode({ dataDir: lockedDir, writeToken() {} }),
      /runtime\.lock.*may indicate another proxy process or account write/,
    )
    assert.equal(fs.existsSync(path.join(lockedDir, 'accounts.json')), true)
  } finally {
    fs.rmSync(missingTokenDir, { recursive: true, force: true })
    fs.rmSync(lockedDir, { recursive: true, force: true })
  }
})

test('refuses to rename when accounts.json changes after token preparation', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-proxy-gui-exit-race-'))
  try {
    writeSingleAccountFixture(dataDir)
    const configPath = path.join(dataDir, 'accounts.json')
    assert.throws(
      () => exitMultiAccountMode({
        dataDir,
        writeToken() {
          fs.writeFileSync(configPath, `${fs.readFileSync(configPath, 'utf8')}\n`)
        },
      }),
      /accounts\.json changed during the operation/,
    )
    assert.equal(fs.existsSync(configPath), true)
    assert.equal(fs.readdirSync(dataDir).some(name => name.startsWith('accounts.json.gui-backup-')), false)
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true })
  }
})

test('removes ANSI CSI sequences after redacting command output', () => {
  const output = '\x1b[41m\x1b[97msecret-token\x1b[0m command failed'
  const redacted = redactCommandOutput(output, ['secret-token'])
  assert.equal(redacted, '[redacted] command failed')
  assert.equal(redacted.includes('\x1b['), false)
})

test('summarizes a CLI failure without diagnostic and preview noise', () => {
  const output = [
    '\x1b[41m ERROR \x1b[0m add account work failed: GitHub identity tester is already configured',
    '\x1b[36mi\x1b[39m Configured Copilot upstream HTTP timeouts: headers=900000ms',
    '\x1b[36mi\x1b[39m Using built-in longer HTTP timeouts for githubcopilot.com upstreams',
    '\x1b[36mi\x1b[39m Change preview: Add account work (enterprise)',
  ].join('\n')
  assert.equal(
    summarizeCommandFailure(output),
    'add account work failed: GitHub identity tester is already configured',
  )
})
