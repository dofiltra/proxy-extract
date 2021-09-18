import ProxyList from 'free-proxy'
import { sleep } from 'time-helpers'
import fetch from 'node-fetch'
import HttpsProxyAgent from 'https-proxy-agent'

export type TProxyExtractOpts = {
  count?: number
  tryLimit?: number
}

export async function extractProxy(opts: TProxyExtractOpts, tryIndex = 0): Promise<ProxyList.IFreeProxy[]> {
  const { tryLimit = 1, count = 1 } = opts

  if (tryIndex >= tryLimit) {
    return []
  }

  const proxyList = new ProxyList()

  try {
    const proxies = await proxyList.get()
    return await getProxyLimit(proxies, count)
  } catch (error) {
    await sleep(3e3 + tryIndex * 1000)
    return await extractProxy(opts, ++tryIndex)
  }
}

async function getProxyLimit(proxies: ProxyList.IFreeProxy[], count: number) {
  const result: ProxyList.IFreeProxy[] = []

  for (const proxy of proxies) {
    if (result.length >= count) {
      break
    }

    if (await isOkProxy(proxy)) {
      result.push(proxy)
    }
  }

  return result
}

async function isOkProxy(proxy: ProxyList.IFreeProxy) {
  const result = await (async () => {
    try {
      const proxyAgent = HttpsProxyAgent(`${proxy.protocol}://${proxy.ip}:${proxy.port}`)
      const response = await fetch('https://httpbin.org/ip?json', { agent: proxyAgent })
      const body = await response.text()
      return body?.includes(proxy.ip)
    } catch {
      // false
    }
  })()

  return !!result
}
