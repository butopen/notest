import {FunctionDeclaration, Project} from "ts-morph";
import {FunctionInstrumenter} from "../src/function-wrapper/wrapper";

test("test function simple is generated correctly", async () => {

  const functionCode = `
    
    export function add(x:number, y:number) {
        return x + y
    }
    
    `

  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  const fileSource = project.createSourceFile("./test/test.ts", functionCode)
  fileSource.saveSync()
  const functionInstrumenter = new FunctionInstrumenter()

  const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "add")
  const instFunction = result.getFunctionOrThrow('add')

  expect(instFunction.getName()).toEqual("add")
  expect(instFunction.getParameters().map(p => p.getName()).join(",")).toEqual("x,y")
  expect(instFunction.getParameters().map(p => p.getType().getText()).join(",")).toEqual("number,number")

  fileSource.deleteImmediatelySync()
})

test("test function with variable declaration is generated correctly", async () => {

  const functionCode = `
    
    function test(){
        const var1 = 1
        const {var3, var4, var5} = t.func(var1)
        return var1;
    }
    
    `

  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  const fileSource = project.createSourceFile("./test/test.ts", functionCode)
  fileSource.saveSync()
  const functionInstrumenter = new FunctionInstrumenter()

  const result: FunctionDeclaration = functionInstrumenter.instrument(fileSource.getFilePath(), "test")
})

test("test function with nested statements is generated correctly", async () => {

  const functionCode = `
  
    function test(){
        while(var1 == 1){
          const var2 = var1
          var1 = var1 + 1
          return var1
        }
        return var2
    }
    
    `

  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  const fileSource = project.createSourceFile("./test/test.ts", functionCode)
  fileSource.saveSync()
  const functionInstrumenter = new FunctionInstrumenter()

  const result: FunctionDeclaration = functionInstrumenter.instrument(fileSource.getFilePath(), "test")

})

