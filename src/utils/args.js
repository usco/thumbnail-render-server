export function getArgs () {
  let args = process.argv.slice(2)

  let params = {}
  if (args.length > 0) {
    params = args.reduce(function (combo, cur) {
      let [name, val] = cur.split('=')
      combo[name] = val
      return combo
    }, {})
  }
  return params
}
