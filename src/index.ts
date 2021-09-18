import ProxyList from 'free-proxy'
import { sleep } from 'time-helpers'


export type TProxyExtractOpts = {
  tryLimit?: number
}

async function extractProxy(opts: TProxyExtractOpts, tryIndex = 0): Promise<ProxyList.IFreeProxy[]> {
  const { tryLimit = 1 } = opts

  if (tryIndex >= tryLimit) {
    return []
  }

  const proxyList = new ProxyList()

  try {
    const proxies = await proxyList.get()
    console.log(proxies)
    return await Promise.all(proxies.filter(async (p) => await isOkProxy(p)))
  } catch (error) {
    await sleep(3e3 + tryIndex * 1000)
    return await extractProxy(opts, ++tryIndex)
  }
}

async function isOkProxy(proxy: ProxyList.IFreeProxy) {
   
  return false
}

extractProxy({ tryLimit: 5 }).then((x) => console.log(x))
