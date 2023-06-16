const cp = require(`child_process`)
cp.execSync(`cd ../ && yarn pack --filename pkg.tgz`, {stdio: `inherit`})
cp.execSync(`yarn add ../pkg.tgz --cache-folder node_modules`, {stdio: `inherit`})

const { BackupUrl } = require(`backup-url`)
new BackupUrl({
  dir: `./backup`,
  interval: 5 * 1000,
  url: [`http://127.0.0.1:8999/doc/openApi.json`],
  format: `json`,
})
