import ProxyList from 'free-proxy'
import { sleep } from 'time-helpers'
import fetch from 'node-fetch'
import HttpsProxyAgent from 'https-proxy-agent'

export type TProxyExtractOpts = {
  count?: number
  tryLimit?: number
  tryIndex?: number
}

export async function extractProxy(opts: TProxyExtractOpts): Promise<ProxyList.IFreeProxy[]> {
  const { tryLimit = 1, count = 1, tryIndex = 0 } = opts

  if (tryIndex >= tryLimit) {
    return []
  }

  try {
    const proxyList = new ProxyList()
    const proxies = await proxyList.get()
    return await getProxyLimit(proxies, count)
  } catch (error) {
    await sleep(3e3 + tryIndex * 1000)
    return await extractProxy({ ...opts, tryIndex: tryIndex + 1 })
  }
}

async function getProxyLimit(proxies: ProxyList.IFreeProxy[], count: number) {
  const result: ProxyList.IFreeProxy[] = []

  for (const proxy of proxies) {
    try {
      if (result.length >= count) {
        break
      }

      if (await isOkProxy(proxy)) {
        result.push(proxy)
      }
    } catch {
      // log
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

export { ProxyList }
