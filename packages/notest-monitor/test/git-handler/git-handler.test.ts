import simpleGit from "simple-git";

test("git handler", async () => {
  const git = simpleGit()
  const changes = await git.diff(['-U0', 'C:\\Users\\Emanuele\\Desktop\\UNI\\Tesi\\Progetto\\notest\\packages\\notest-monitor\\test\\esempi\\test-class.ts'])
  const array = changes
    .split('@@')
    .filter((value, index) => index % 2 == 1)
    .map(val => val.split('+')[1].replace(' ', ''))
    .map(elem => {
      const values = elem.split(',')
      return {start: parseInt(values[0]), end: parseInt(values[0]) + parseInt(values[1])}
    })
  console.log(array)
  console.log(changes)
})