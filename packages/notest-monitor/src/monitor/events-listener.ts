import * as chokidar from "chokidar";
import {FSWatcher} from "chokidar";
import {FunctionInstrumenter} from "../instrumenter/function-instrumenter";
import {MethodInstrumenter} from "../instrumenter/method-instrumenter";
import {Project} from "ts-morph";
import {GitEventsHandler} from "./git-events-handler";

export class EventsListener {
  private watcher: FSWatcher;
  private functionInstrumenter: FunctionInstrumenter;
  private methodInstrumenter: MethodInstrumenter;
  private readonly path: string;
  private project: Project;

  constructor(path) {
    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
    this.path = path
    this.watcher = chokidar.watch(path, {
      ignored: '**/instrumentation/**', // ignore dotfiles
      persistent: true
    });
    this.functionInstrumenter = new FunctionInstrumenter(this.project)
    this.methodInstrumenter = new MethodInstrumenter(this.project)
  }

  async listen() {
    this.watcher
      .on('add', path => {
        console.log("added file at " + path)
      })
      .on('change', path => {
        console.log("changed file at " + path)
        this.controlChanges(path)
      })
    return this.path
  }

  async restartListen() {
    await this.listen()
  }

  async stopListen() {
    await this.watcher.close()
  }

  private addFunctions(pathFile: string) {
    this.functionInstrumenter.instrumentFileFunctions(pathFile)
    this.methodInstrumenter.instrumentFileMethods(pathFile)
  }

  private async controlChanges(pathFile: string) {
    const idxs = await new GitEventsHandler().getIdxsFromDiff(pathFile)
    const functionNames = this.getFunctionsNameFromIdx(idxs, pathFile)
    functionNames.forEach(name => this.functionInstrumenter.instrument(pathFile, name))

    const methodsNames = this.getMethodsNameFromIdxs(idxs, pathFile)
    console.log(methodsNames)
    methodsNames.forEach(elem => this.methodInstrumenter.instrument(pathFile, elem.className, elem.methodName))
  }

  getFunctionsNameFromIdx(idxs: { start: number, end: number }[], path) {
    let functionNames: string[] = []
    idxs.forEach(idx => {
      let file = this.project.getSourceFile(path)
      const interestFunctions = file!
        .getFunctions()
        .filter((fun) => {
          return idx.start <= fun.getEndLineNumber() && fun.getStartLineNumber() <= idx.end
        })
      interestFunctions.forEach(interestFunc => {
        if (interestFunc.getName()) {
          functionNames.push(interestFunc.getName()!)
        }
      })
    })
    return functionNames
  }

  getMethodsNameFromIdxs(idxs: { start: number, end: number }[], path) {
    let methodsName: { className: string, methodName: string }[] = []
    let file = this.project.getSourceFile(path)
    idxs.forEach(idx => {
      const interestClasses = file!
        .getClasses()
        .filter(clas => idx.start <= clas.getEndLineNumber() && clas.getStartLineNumber() <= idx.end)
      interestClasses.forEach(clas => {
        const interestMethods = clas
          .getMethods()
          .filter(method => idx.start <= method.getEndLineNumber() && method.getStartLineNumber() <= idx.end)
        interestMethods.forEach(method => methodsName.push({className: clas.getName()!, methodName: method.getName()}))
      })
    })
    return methodsName;
  }
}