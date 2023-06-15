const { BackupUrl } = require(`backup-url`)
new BackupUrl({
  dir: `./backup`,
  interval: 5 * 1000,
  url: [`http://127.0.0.1:8999/doc/openApi.json`],
  format: `json`,
})
