const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'Toolbox',
    extraResource: [
      './resources/bin/'
    ],
    osxSign: {},
    osxNotarize: {
      tool: 'notarytool',
    }
  },
  // 允许跨平台构建
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Toolbox',
        authors: '风清默',
        description: '工具箱',
        noMsi: true,
        setupExe: 'Toolbox-Setup.exe'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32'],
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        format: 'ULFO',
        contents: [
          {
            x: 130,
            y: 220,
            type: 'file',
            path: 'Toolbox.app'
          },
          {
            x: 410,
            y: 220,
            type: 'link',
            path: '/Applications'
          }
        ]
      }
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'FengQingMo',
          name: 'ToolBox'
        },
        prerelease: false,
        draft: true
      }
    }
  ],
  rebuildConfig: {},
  plugins: [
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
  ],
};
