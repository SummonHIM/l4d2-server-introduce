export enum DNSStatus {
  NOERROR = 0, // 正常
  FORMERR = 1, // 格式错误
  SERVFAIL = 2, // 服务器失败
  NXDOMAIN = 3, // 域名不存在
  NOTIMP = 4, // 不支持的查询类型
  REFUSED = 5, // 被拒绝
}

export interface DNSQuestion {
  name: string
  type: number
}

export interface DNSAnswer {
  name: string
  type: number
  TTL: number
  data: string
}

export interface APIDNS {
  Status: DNSStatus
  TC: boolean
  RD: boolean
  RA: boolean
  AD: boolean
  CD: boolean
  Question: DNSQuestion[]
  Answer?: DNSAnswer[]
  Authority?: DNSAnswer[]
  Comment?: string
}
