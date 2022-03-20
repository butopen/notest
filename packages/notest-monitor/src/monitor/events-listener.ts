import * as chokidar from "chokidar";
import {FSWatcher} from "chokidar";
import {FunctionInstrumenter} from "../function-wrapper/wrapper";

export class EventsListener {
  private watcher: FSWatcher;
  private instrumenter: FunctionInstrumenter;
  private readonly path: string;

  constructor(path) {
    this.path = path
    this.watcher = chokidar.watch(path, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });
    this.instrumenter = new FunctionInstrumenter()
  }

  async listen() {
    this.watcher
      .on('add', path => console.log("added " + path))
      .on('change', path => console.log("created " + path))
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