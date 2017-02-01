import { of } from 'most'
import { create } from '@most/create'
import which from 'which'

export default function appPath (appCmd) {
  return create((add, end, error) => {
    which(appCmd, function (err, resolvedPath) {
      // console.log("is xvfb-run in path ?",error, resolvedPath)
      // er is returned if no "node" is found on the PATH
      // if it is found, then the absolute path to the exec is returned
      if (err) {
        error(err)
      } else {
        add(resolvedPath)
        end()
      }
    })
  })
}

export function appInPath (appCmd) {
  return appPath(appCmd)
    .map(e => true)
    .flatMapError(e => of(false))
}
