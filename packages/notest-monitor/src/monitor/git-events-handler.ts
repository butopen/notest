import simpleGit, {SimpleGit} from "simple-git";

export class GitEventsHandler {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit()
  }

  async getIdxsFromDiff(path: string) {
    const changes = await this.git.diff(['-U0', path])
    return getIdxsFromString(changes)
  }
}

export function getIdxsFromString(changes: string) {
  return changes
    .split('@@')
    .filter((value, index) => index % 2 == 1)
    .map(val => val.split('+')[1].replace(' ', ''))
    .map(elem => {
      const values = elem.split(',')
      if (!values[1]) {
        values[1] = '0'
      }
      return {start: parseInt(values[0]), end: parseInt(values[0]) + parseInt(values[1])}
    })
}
