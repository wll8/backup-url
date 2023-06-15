// 判断数据是否为 type, 或返回 type
function isType(data, type = undefined) {
  const dataType = Object.prototype.toString.call(data).match(/\s(.+)]/)[1].toLowerCase()
  return type ? (dataType === type.toLowerCase()) : dataType
}

// 深度排序 json 中的 key
function sortJsonKeys(obj) {
  if (typeof obj !== `object`) return obj

  if (Array.isArray(obj)) {
    return obj.map(sortJsonKeys)
  }

  const keys = Object.keys(obj).sort()

  const result = {}
  keys.forEach(key => {
    result[key] = sortJsonKeys(obj[key])
  })

  return result
}


/**
 * 保存文件
 * @param {string} filePath 文件的路径
 * @param {binary} bin 二进制内容
 */
function saveFile(filePath, bin) {
  const fs = require(`fs`)
  fs.writeFileSync(filePath, bin, { encoding: `binary` })
}

/**
 * 时间格式化
 * @param {string} fmt 格式
 * @param {Date} date 时间对象
 */
function dateFormat(fmt, date) {
  let ret
  const opt = {
    'Y+': date.getFullYear().toString(),        // 年
    'M+': (date.getMonth() + 1).toString(),     // 月
    'D+': date.getDate().toString(),            // 日
    'h+': date.getHours().toString(),           // 时
    'm+': date.getMinutes().toString(),         // 分
    's+': date.getSeconds().toString(),          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  }
  for (let k in opt) {
    ret = new RegExp(`(${k})`).exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, `0`)))
    }
  }
  return fmt
}

/**
 * 获取文件 md5 - 同步版
 * @param {*} pathOrBuffer 文件路径或 buffer
 * @param {*} type 如果是文件路径时, type 为 path
 * @returns
 */
function getFileMd5(pathOrBuffer, type) {
  const fs = require(`fs`)
  const buffer = type === `path` ? fs.readFileSync(pathOrBuffer) : pathOrBuffer
  const crypto = require(`crypto`)
  const md5 = crypto.createHash(`md5`).update(buffer).digest(`hex`)
  return md5
}

/**
 * 根据 url 获取文件的存储路径以及文件名, 避免特殊字符
 * @param {string} url http 地址
 * @returns {object} {pathname, fileName} fileName 是 query 参数生成的名字
 */
function getFilePath(url) {
  const filenamify = require(`filenamify`)
  const {
    pathname,
    search = ``,
  } = new URL(url)
  const fileName = filenamify(
    search,
    { maxLength: 255, replacement: `_` },
  )
  return {
    pathname,
    fileName,
  }
}

/**
 * 获取远程 url 的
 * @param {string} url http url
 * @returns {object} {data, ext} binary 和后缀名
 */
function getFile(url) {
  const [, tag = ``, username, password] = url.match(/:\/\/((.+):(.+)@)/) || []
  url = url.replace(tag, ``)
  return new Promise((resolve, reject) => {
    const http = require(url.replace(/(:\/\/.*)/, ``).trim()) // 获取 http 或 https
    http.get(url, {
      auth: username ? `${username}:${password}` : undefined,
    }, res => {
      const { statusCode } = res
      if (statusCode !== 200) {
        reject(statusCode)
      }
      let data = ``
      res.setEncoding(`binary`)
      res.on(`data`, (chunk) => {
        data += chunk
      })
      res.on(`end`, () => {
        const mime = require(`mime`)
        const ext = mime.getExtension(res.headers[`content-type`]) || ``
        resolve({
          data,
          ext,
        })
      })
    }).on(`error`, (e) => {
      reject(e.message)
    })
  })
}

/**
 * 给定目录和文件名, 获取最新文件和它的时间
 */
function getNewFile({dir, fileName}) {
  const fs = require(`fs`)
  const newFile = fs.readdirSync(dir).reduce((acc, curFileName) => {
    const re = new RegExp(`${fileName}_(\\d{4}-\\d{2}-\\d{2} \\d{2}-\\d{2}-\\d{2})\\.`)
    const [, tag = ``] = curFileName.match(re) || []
    const curTime = Number(tag.replace(/\D/g, ``))
    return {
      maxTime: acc.maxTime < curTime ? curTime : acc.maxTime,
      curFileName: acc.maxTime < curTime ? curFileName : acc.curFileName,
    }
  }, {maxTime: 0, curFileName: ``})
  return newFile
}

module.exports = {
  getNewFile,
  isType,
  sortJsonKeys,
  saveFile,
  dateFormat,
  getFileMd5,
  getFilePath,
  getFile,
}
