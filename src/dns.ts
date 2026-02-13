import axios from 'axios'

import { type APIDNS, DNSStatus } from './interfaces'

/**
 * DNS错误
 */
export class DNSError extends Error {
  public readonly status?: DNSStatus
  public readonly host?: string

  constructor(options: { message: string; status?: DNSStatus; host?: string }) {
    super(options.message)

    this.name = 'DNSError'
    this.status = options.status
    this.host = options.host

    // 修正 instanceof（在某些编译目标下需要）
    Object.setPrototypeOf(this, DNSError.prototype)
  }
}

/**
 * 将DNS解析状态 (Status) 解析为中文
 * @param status DNS解析状态
 * @returns 详细的状态中文
 */
export function getDNSStatusMessage(status: DNSStatus | undefined): string {
  switch (status) {
    case DNSStatus.NOERROR:
      return '解析成功'
    case DNSStatus.NXDOMAIN:
      return '域名不存在'
    case DNSStatus.SERVFAIL:
      return 'DNS服务器失败'
    case DNSStatus.REFUSED:
      return 'DNS请求被拒绝'
    default:
      return '未知DNS错误'
  }
}

/**
 * 检测字符串是否为IPv4地址
 * @param address 地址
 * @returns 是否为IPv4地址
 */
export function isIPv4(address: string): boolean {
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
  return ipv4Regex.test(address)
}

/**
 * 通过阿里云DNS解析域名为IP地址
 * @param host 地址
 * @returns IP
 */
export async function resolveHostToIPv4(host: string): Promise<string> {
  if (isIPv4(host)) return host

  const res = await axios.get<APIDNS>(`https://dns.alidns.com/resolve?name=${host}&type=A`, {
    headers: { Accept: 'application/dns-json' },
    timeout: 5000,
  })
  const data = res.data

  // DNS 状态错误
  if (data.Status !== DNSStatus.NOERROR) {
    throw new DNSError({
      message: `DNS error: ${DNSStatus[data.Status]}`,
      host,
      status: data.Status,
    })
  }

  // 没有返回记录
  if (!data.Answer?.length) {
    throw new DNSError({
      message: 'No DNS answer record',
      host,
    })
  }

  // 找 A 记录
  const record = data.Answer.find((r) => r.type === 1)

  if (!record) {
    throw new DNSError({
      message: 'No A record found',
      host,
    })
  }

  return record.data
}
