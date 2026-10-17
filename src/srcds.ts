import { resolveHostToIPv4 } from './dns'

export const srcdsEnv = {
  provider: String(import.meta.env.VITE_SRCDS_SERVER_PROVIDER ?? '好心人'),
  name: String(import.meta.env.VITE_SRCDS_SERVER_NAME ?? 'Counter-Strike 2'),
  addr: String(import.meta.env.VITE_SRCDS_SERVER_ADDRESS ?? 'example.com'),
  port: String(import.meta.env.VITE_SRCDS_SERVER_PORT ?? '27015'),
}

export async function generateSteamBrowserProtocol(
  address: string,
  port?: string,
  password?: string,
): Promise<string> {
  const ip = await resolveHostToIPv4(address)

  let url = `steam://connect/${ip}`

  if (port) {
    url += `:${port}`
  }

  if (password) {
    url += `/${encodeURIComponent(password)}`
  }

  return url
}
