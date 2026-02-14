import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'

export const packagerConfig = {
  asar: true,
  icon: 'src/assets/logo/favicon',
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
