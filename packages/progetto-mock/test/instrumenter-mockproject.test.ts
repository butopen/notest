import {FunctionInstrumenter} from "../../notest-monitor/src/instrumenter/function-instrumenter";
import {MethodInstrumenter} from "../../notest-monitor/src/instrumenter/method-instrumenter";

import {Project} from "ts-morph";

test('tests for mock-project', () => {
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  })
  const instrumenterF = new FunctionInstrumenter(project)

  const instrumenterM = new MethodInstrumenter(project)

  instrumenterF.instrumentFileFunctions(
    'C:\\Users\\Emanuele\\Desktop\\UNI\\Tesi\\Progetto\\notest\\packages\\progetto-mock\\src\\adder.ts')

  instrumenterM.instrumentFileMethods(
    'C:\\Users\\Emanuele\\Desktop\\UNI\\Tesi\\Progetto\\notest\\packages\\progetto-mock\\src\\adder.ts')

  instrumenterF.instrumentFileFunctions(
    'C:\\Users\\Emanuele\\Desktop\\UNI\\Tesi\\Progetto\\notest\\packages\\progetto-mock\\src\\calculator.ts')

  instrumenterM.instrumentFileMethods(
    'C:\\Users\\Emanuele\\Desktop\\UNI\\Tesi\\Progetto\\notest\\packages\\progetto-mock\\src\\calculator.ts')
})
