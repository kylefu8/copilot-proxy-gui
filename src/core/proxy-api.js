export async function getHealth(baseUrl) {
  const response = await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(5000) })
  if (!response.ok)
    throw new Error(`Health check failed: ${response.status}`)

  return response.text()
}

export async function getUsage(baseUrl) {
  const response = await fetch(`${baseUrl}/usage`, { signal: AbortSignal.timeout(5000) })
  if (!response.ok)
    throw new Error(`Usage request failed: ${response.status}`)

  return response.json()
}

/**
 * Poll the health endpoint until the server is ready.
 * Retries up to `maxRetries` times with `interval` ms between attempts.
 */
export async function waitForReady(baseUrl, { maxRetries = 30, interval = 1000 } = {}) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await getHealth(baseUrl)
      return true
    }
    catch {
      await new Promise(r => setTimeout(r, interval))
    }
  }
  throw new Error('Service start timeout, please check the logs')
}
