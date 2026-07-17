const assert = require('node:assert/strict')
const test = require('node:test')

const { buildProxyLaunch } = require('./proxy-launch.cjs')

test('moves the GUI token out of argv and into the one-shot startup environment', () => {
  const launch = buildProxyLaunch({
    args: ['start', '--port', '4399', '--github-token', 'legacy-argv-token'],
    token: 'encrypted-gui-token',
    baseEnv: { PATH: 'test-path' },
  })

  assert.deepEqual(launch.args, ['start', '--port', '4399'])
  assert.equal(launch.env.GH_TOKEN, 'encrypted-gui-token')
  assert.equal(launch.env.PATH, 'test-path')
  assert.equal(launch.args.some(arg => arg.includes('token')), false)
})

test('removes short and inline github-token forms from long-running args', () => {
  for (const args of [
    ['start', '-g', 'secret', '--verbose'],
    ['start', '-gsecret', '--verbose'],
    ['start', '--github-token=secret', '--verbose'],
  ]) {
    const launch = buildProxyLaunch({ args, token: 'gui-token', baseEnv: {} })
    assert.deepEqual(launch.args, ['start', '--verbose'])
  }
})

test('preserves configured hosts and adds every GUI loopback hostname', () => {
  const launch = buildProxyLaunch({
    args: ['start'],
    token: 'gui-token',
    baseEnv: { COPILOT_PROXY_ALLOWED_HOSTS: 'proxy.internal,LOCALHOST' },
  })

  const hosts = new Set(launch.env.COPILOT_PROXY_ALLOWED_HOSTS.split(',').map(host => host.toLowerCase()))
  assert.deepEqual(hosts, new Set(['proxy.internal', 'localhost', '127.0.0.1', '::1']))
})

test('passes conversation logging without inventing a token', () => {
  const launch = buildProxyLaunch({
    args: ['start'],
    token: '',
    baseEnv: {},
    conversationLog: true,
  })

  assert.equal(launch.env.COPILOT_PROXY_CONVERSATION_LOG, '1')
  assert.equal('GH_TOKEN' in launch.env, false)
})
