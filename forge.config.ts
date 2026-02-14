import { utils } from '@electron-forge/core'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'

export const packagerConfig = {
  asar: true,
  icon: 'src/assets/logo/favicon',
  appBundleId: utils.fromBuildIdentifier({
    beta: 'top.summonhim.serenity.l4d2.beta',
    prod: 'top.summonhim.serenity.l4d2',
  }),
  appCopyright:
    '© 2026 SummonHIM. Left 4 Dead 2 and related assets are trademarks and/or copyrights of Valve Corporation. This project is not affiliated with or endorsed by Valve.',
  ignore: [
    // 文件夹
    '.github/',
    '.vscode/',
    'e2e/',
    'playwright-report/',
    'public/',
    'test-results/',

    // tsconfig 文件
    'tsconfig.json',
    'env.d.ts',
    /tsconfig\..*\.json/,

    // vite 相关配置
    /vite\.config\..*/,
    /jsconfig.*/,
    /vitest\.config.*/,
    /cypress\.config.*/,
    /playwright\.config.*/,
    'components.d.ts',

    // package / yarn / lint / prettier 配置
    'package-lock.json',
    /pnpm.*/,
    /\.yarnrc.*/,
    /yarn.*/,
    /\.eslint.*/,
    /eslint.*/,
    /\.oxlint.*/,
    /oxlint.*/,
    /\.oxfmt.*/,
    /\.prettier.*/,
    /prettier.*/,
    /\.editorconfig/,

    // 环境变量 .env
    '.env',
    /\.env\..*/,

    // Git
    '.gitattributes',
    '.gitignore',
    '.npmrc',

    // Electron
    'forge.config.ts',
  ],
}
export const rebuildConfig = {}
export const makers = [
  {
    name: '@electron-forge/maker-squirrel',
    config: {
      setupIcon: 'src/assets/logo/favicon.ico',
    },
  },
  {
    name: '@electron-forge/maker-zip',
  },
  {
    name: '@electron-forge/maker-deb',
  },
  {
    name: '@electron-forge/maker-rpm',
  },
  {
    name: '@electron-forge/maker-dmg',
  },
]
export const publishers = [
  {
    name: '@electron-forge/publisher-github',
    config: {
      draft: true,
      generateReleaseNotes: true,
      repository: {
        owner: 'SummonHIM',
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
