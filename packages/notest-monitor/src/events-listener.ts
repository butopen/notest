import {FSWatcher} from "chokidar";
import {FunctionInstrumenter} from "./function-wrapper/wrapper";

const chokidar = require('chokidar');

export class EventsListener {
  private watcher: FSWatcher;
  private instrumenter: FunctionInstrumenter;

  constructor(path) {
    this.watcher = chokidar.watch(path, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });
    this.instrumenter = new FunctionInstrumenter()
  }

  async listen() {
    this.watcher
      .on('add', path => this.addFunctions(path))
      .on('change', path => this.controlChanges(path))

  }

  private addFunctions(path: string) {
    this.instrumenter.instrumentFileFunctions(path)
  }

  private controlChanges(path: string) {
    // controllo i cambiamenti, svuoto il file instrumentato e riaggiungo tutto?
  }
}