import {Project, SourceFile} from "ts-morph";
import {MethodInstrumenter} from "../../src/instrumenter/method-instrumenter";


describe(`Testing Instrumentation Methods`, () => {
  const pathTestFunction: string = "./test/test-space-instrumentation/test.ts"
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  test("test function with parameters and old statements of instrumentation", async () => {
    const functionCode = `
    
    export class TestClass{
      testMethod(par1:string,par2:string){
      
          const var1 = 1
          const {var3, var4, var5} = t.f1(var1)
          const {var6, var7, var8} = t.f2(var1)
      }
    }
    
    /*ignore it*/if( instrumentationRules.check() ) {instrument_testMethod(TestClass)}
    
    `

    const fileSource = project.createSourceFile(pathTestFunction, functionCode)
    fileSource.saveSync()
    const methodInstrumenter = new MethodInstrumenter(project)

    const result: SourceFile = methodInstrumenter.instrument(fileSource.getFilePath(), "TestClass", "testMethod")
    result.saveSync()

  })
})
