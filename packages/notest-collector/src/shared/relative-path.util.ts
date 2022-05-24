import path from "path";

export function relativePathFromSource(pathAbs: string) {
  let relPath = path.relative(path.resolve("."), pathAbs).toString()
  return relPath.replace(/\\/g, '/')
}
