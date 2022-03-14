import {Project, SourceFile, SyntaxKind} from "ts-morph";
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
    }
    
    `

  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  const fileSource = project.createSourceFile("./test/test.ts", functionCode)
  fileSource.saveSync()
  const functionInstrumenter = new FunctionInstrumenter()

  const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "test")
  const instFunction = result.getFunctionOrThrow("test")
  expect(instFunction.getStatements().length).toBe(2 + 2) // 2 variable Statement, 2 expression collect()
  fileSource.deleteImmediatelySync()
})

test("test function with nested statements is generated correctly", async () => {

  const functionCode = `
  
    function test(){
        while(var1 == 1){
          const var2 = var1
        }
    }
    
    `

  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  const fileSource = project.createSourceFile("./test/test.ts", functionCode)
  fileSource.saveSync()
  const functionInstrumenter = new FunctionInstrumenter()

  const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "test")
  const numberStatementNestedInWhileStatement = result
    .getFunctionOrThrow("test")
    .getStatementByKindOrThrow(SyntaxKind.WhileStatement)
    .getDescendantStatements().length
  expect(numberStatementNestedInWhileStatement).toBe(2) // variable statement + expression collect()
  // result.saveSync()
  fileSource.deleteImmediatelySync()
})

test("test that only used import is generated", async () => {

  const functionCode = `
    
    import f1 from 'path1'
    import f2 from 'path2'
    
    function test(){
        f1.doSomething()
    }

    `

  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  const fileSource = project.createSourceFile("./test/test.ts", functionCode)
  fileSource.saveSync()
  const functionInstrumenter = new FunctionInstrumenter()

  const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "test")
  const numberOfImports = result.getFunctionOrThrow("test")
    .getParent().getChildrenOfKind(SyntaxKind.ImportDeclaration).length

  expect(numberOfImports).toBe(1)

  fileSource.deleteImmediatelySync()
})
