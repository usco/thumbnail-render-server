import most from 'most'
import Subject from './subject/subject'
import which  from 'which'


export default function appPath(appCmd){
  const {sink, stream} = Subject()

  which(appCmd, function (error, resolvedPath) {
    //console.log("is xvfb-run in path ?",error, resolvedPath)
    // er is returned if no "node" is found on the PATH 
    // if it is found, then the absolute path to the exec is returned 
    if(error){
      sink.error(error)
    }
    else{
      sink.add(resolvedPath)
      sink.end()
    }
  })

  return stream
}


export function appInPath(appCmd){
  return appPath(appCmd)
    .tap(e=>console.log("gna",e))
    .map(e=>true)
    .flatMapError(e=> most.of(false))
    
}