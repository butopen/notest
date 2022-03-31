import * as chokidar from "chokidar";
import {FSWatcher} from "chokidar";
import {FunctionInstrumenter} from "../instrumenter/function-instrumenter";

export class EventsListener {
  private watcher: FSWatcher;
  private instrumenter: FunctionInstrumenter;
  private readonly path: string;

  constructor(path) {
    this.path = path
    this.watcher = chokidar.watch(path, {
      ignored: '**/instrumentation/**', // ignore dotfiles
      persistent: true
    });
    this.instrumenter = new FunctionInstrumenter()
  }

  async listen() {
    this.watcher
      .on('add', path => {
        console.log("added file at " + path)
      })
      .on('change', path => {
        console.log("changed file at " + path)
        this.addFunctions(path)
      })
    return this.path
  }

  async stopListen() {
    await this.watcher.close()
  }

  private addFunctions(path: string) {
    this.instrumenter.instrumentFileFunctions(path)
  }

  private controlChanges(path: string) {
    this.instrumenter.instrumentFileFunctions(path)
  }
}