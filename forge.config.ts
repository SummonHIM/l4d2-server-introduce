import { utils } from '@electron-forge/core'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'
import 'dotenv/config'

const currentYear = new Date().getFullYear()
const serverAddr = process.env.VITE_SRCDS_SERVER_ADDRESS ?? 'example.com'
const serverProvider = process.env.VITE_SRCDS_SERVER_PROVIDER ?? 'Somebody'
const pkgName =
  serverProvider == 'SummonHIM' ? 'summonl4d2-server-launcher' : 'l4d2-server-introduce'

function domainToBundleId(domain: string): string {
  return domain.split('.').reverse().join('.')
}

export const packagerConfig = {
  asar: true,
  executableName: pkgName,
  icon: 'src/assets/logo/favicon',
  appBundleId: utils.fromBuildIdentifier({
    beta: domainToBundleId(serverAddr) + '.beta',
    prod: domainToBundleId(serverAddr),
  }),
  appCopyright: `© ${currentYear} ${serverProvider}. Left 4 Dead 2 and related assets are trademarks and/or copyrights of Valve Corporation. This project is not affiliated with or endorsed by Valve.`,
  ignore: [
    // 只匹配根目录文件夹
    /^\.github($|\/)/,
    /^\.vscode($|\/)/,
    /^public($|\/)/,
    /^e2e($|\/)/,
    /^test-results($|\/)/,
    /^playwright-report($|\/)/,

    // tsconfig
    /^tsconfig\.json$/,
    /^env\.d\.ts$/,
    /^tsconfig\..*\.json$/,

    // vite / test config
    /^vite\.config\..*$/,
    /^vitest\.config\..*$/,
    /^cypress\.config\..*$/,
    /^playwright\.config\..*$/,
    /^components\.d\.ts$/,

    // lock files（仅根目录）
    /^package-lock\.json$/,
    /^pnpm-lock\.yaml$/,
    /^yarn\.lock$/,

    // lint prettier（仅根目录）
    /^\.eslint.*$/,
    /^\.prettier.*$/,
    /^\.editorconfig$/,

    // env（仅根目录）
    /^\.env$/,
    /^\.env\..*$/,

    // git（仅根目录）
    /^\.gitattributes$/,
    /^\.gitignore$/,
    /^\.npmrc$/,

    // forge config
    /^forge\.config\.ts$/,
  ],
}
export const rebuildConfig = {}
export const makers = [
  {
    name: '@electron-forge/maker-squirrel',
    config: {
      name: pkgName,
      setupIcon: 'src/assets/logo/favicon.ico',
    },
  },
  {
    name: '@electron-forge/maker-zip',
  },
  {
    name: '@electron-forge/maker-deb',
    config: {
      options: {
        bin: pkgName,
        name: pkgName,
        categories: ['Game'],
        icon: 'src/assets/logo/favicon.png',
      },
    },
  },
  {
    name: '@electron-forge/maker-rpm',
    config: {
      options: {
        bin: pkgName,
        name: pkgName,
        categories: ['Game'],
        icon: 'src/assets/logo/favicon.png',
      },
    },
  },
]
export const publishers = [
  {
    name: '@electron-forge/publisher-github',
    config: {
      draft: true,
      generateReleaseNotes: true,
      repository: {
        owner: serverProvider,
        name: 'l4d2-server-introduce',
      },
    },
  },
]
export const plugins = [
  {
    name: '@electron-forge/plugin-auto-unpack-natives',
    config: {},
  },
  // Fuses are used to enable/disable various Electron functionality
  // at package time, before code signing the application
  new FusesPlugin({
    version: FuseVersion.V1,
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
  }),
]
