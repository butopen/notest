import * as chokidar from "chokidar";
import {FSWatcher} from "chokidar";
import {FunctionInstrumenter} from "../instrumenter/function-instrumenter";
import {MethodInstrumenter} from "../instrumenter/method-instrumenter";

export class EventsListener {
  private watcher: FSWatcher;
  private functionInstrumenter: FunctionInstrumenter;
  private methodInstrumenter: MethodInstrumenter;
  private readonly path: string;

  constructor(path) {
    this.path = path
    this.watcher = chokidar.watch(path, {
      ignored: '**/instrumentation/**', // ignore dotfiles
      persistent: true
    });
    this.functionInstrumenter = new FunctionInstrumenter()
    this.methodInstrumenter = new MethodInstrumenter()
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

  async stopListen() {
    await this.watcher.close()
  }

  private addFunctions(path: string) {
    this.functionInstrumenter.instrumentFileFunctions(path)
    this.methodInstrumenter.instrumentFileMethods(path)
  }

  private controlChanges(path: string) {
    this.functionInstrumenter.instrumentFileFunctions(path)
    this.methodInstrumenter.instrumentFileMethods(path)
    this.stopListen()
  }
}