const helper = {
  normalizeString: (string) => {
    if (string === undefined) return 'undefined'
    if (string === null) return 'null'
    let res = string.replace(/\s/g, '-')
    res = res.toLowerCase()
    return res
  },
}
export default helper
