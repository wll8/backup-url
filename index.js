const fs = require(`fs`)
const os = require(`os`)
const util = require(`./util.js`)

class BackupUrl {
  constructor({
    url = ``, // url 地址, 支持 string 或 string[]
    interval =  10 * 1000, // 每次备份间隔毫秒, 0 表示不备份
    dir = `${__dirname}/backup`, // 备份到什么目录
    format = undefined, // 备份前格式化所用的函数, 支持 `json` | function
  }) {
    // 定时备份 openApi
    this.url = Boolean(url && interval) === false ? [] : {
      string: () => [url],
      array: () => url,
    }[util.isType(url)]()
    this.interval = interval
    this.format = {
      json: data => { // 格式化 openApi 后再保存, 避免压缩的内容不易比较变更
        return JSON.stringify(util.sortJsonKeys(JSON.parse(data)), null, 2) // 排序 obj, 因为 openApi 中的顺序不确定会导致变更过多
      },
    }[format] || format
    const backupFn = () => {
      this.url.forEach(item => {
        this.backupUrl(dir, item, this.format)
      })
    }
    setInterval(backupFn, interval)
  }
  /**
   * 备份一个 http url 对应的文件
   * @param {string} baseDir 要备份于什么目录之下
   * @param {string} fileUrl 文件 url
   * @param {function} format 备份前格式化数据
   */
  async backupUrl(baseDir = __dirname, fileUrl, format) {
    let { data: fileData, ext: fileExt } = (await util.getFile(fileUrl).catch(err => {
      console.log(err)
    })) || {}
    if(fileData === undefined) {
      return false
    }
    if(fileData && format) {
      fileData = format(fileData)
    }
    const {
      pathname,
      fileName,
    } = util.getFilePath(fileUrl)
    const dir = `${baseDir}/${pathname}`
    fs.mkdirSync(dir, { recursive: true })
    // 从符合备份文件名规则的所有文件中找到最新备份的那个文件名和时间, 获取文件的 md5 与请求的 md5 做比较
    const newFile = util.getNewFile({dir, fileName})
    const nextName = util.dateFormat(`YYYY-MM-DD hh-mm-ss`, new Date())
    if (newFile.maxTime) {
      const oldMd5 = util.getFileMd5(fs.readFileSync(`${dir}/${newFile.curFileName}`))
      const tempFile = `${os.tmpdir()}/${Date.now()}`
      util.saveFile(tempFile, fileData)
      const newMd5 = util.getFileMd5(fs.readFileSync(tempFile))
      fs.unlinkSync(tempFile)
      if (oldMd5 !== newMd5) {
        util.saveFile(`${dir}/${fileName}_${nextName}.${fileExt}`, fileData)
      }
    } else {
      util.saveFile(`${dir}/${fileName}_${nextName}.${fileExt}`, fileData)
    }
  }
}

module.exports = {
  BackupUrl,
}
