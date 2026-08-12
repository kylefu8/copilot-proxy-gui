const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  buildAccountCommand,
  buildAccountCommandEnvironment,
  getProxyDataDir,
  parseJsonOutput,
  readAccountsSnapshot,
  runProxyCommand,
} = require('./account-operations.cjs')

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
