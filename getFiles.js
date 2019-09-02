const fs = require('fs')

const getFiles = (source, type) => {
  const re = new RegExp(`.*\.${type}`, 'g')
  const files = []
  const folderContent = fs.readdirSync(source)
  for (let i = 0; i < folderContent.length; i++) {
    const dir = folderContent[i]
    if (!dir.split('.')[1] && dir.split('.')[0] !== '') {
      const folder = dir
      // copy embed folder
      files.push(...getFiles(`${source}/${folder}`, type))
    } else {
      // upload file
      const file = dir
      if (file.match(re)) {
        files.push(source + '/' + file)
      }
    }
  }
  return files
}

module.exports = { getFiles }
