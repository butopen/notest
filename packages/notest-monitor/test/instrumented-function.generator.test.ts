import {FunctionDeclaration, Project, SourceFile, SyntaxKind} from "ts-morph";
import {FunctionInstrumenter} from "../src/function-wrapper/wrapper";


describe(`Testing Instrumentation Functions`, () => {

  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  beforeEach(() => {
    cleanTestSpace()
  })

  afterEach(() => {
    cleanTestSpace()
  })

  test("test function with parameters", async () => {

    const functionCode = `
    
    export function test(x:number, y:number) {
        return x + y
    }
    
    `

    const fileSource = project.createSourceFile("./test/test.ts", functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "test")
    const instFunction = result.getFunctionOrThrow("test")

    expect(instFunction.getName()).toEqual("test")
    expect(instFunction.getParameters().map(p => p.getName()).join(",")).toEqual("x,y")
    expect(instFunction.getParameters().map(p => p.getType().getText()).join(",")).toEqual("number,number")
    controlStatementsNumber(instFunction, 2, 4, 1)
  })

  test("test function with variable declaration", async () => {

    const functionCode = `
    
    function test(){
        const var1 = 1
        const {var3, var4, var5} = t.func(var1)
    }
    
    `

    const fileSource = project.createSourceFile("./test/test.ts", functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "test")
    const instFunction = result.getFunctionOrThrow("test")
    controlStatementsNumber(instFunction, 3, 3, 0)
  })

  test("test function with nested statements", async () => {

    const functionCode = `
  
    function test(){
        while(var1 == 1){
          const var2 = var1
          while(var1 == 1){
            const var3 = 1
          }
        }
    }
    
    `

    const fileSource = project.createSourceFile("./test/test.ts", functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "test")
    const instFunction = result.getFunctionOrThrow("test")
    const numberStatementNestedInWhileStatement = result
      .getFunctionOrThrow("test")
      .getStatementByKindOrThrow(SyntaxKind.WhileStatement)
      .getDescendantStatements().length
    expect(numberStatementNestedInWhileStatement).toBe(5)
    controlStatementsNumber(instFunction, 3, 3, 0)
  })

  test("test that only used import is generated", async () => {

    const functionCode = `
    
    import f1 from 'path1'
    import f2 from 'path2'
    
    function test(){
        f1.doSomething()
    }

    `

    const fileSource = project.createSourceFile("./test/test.ts", functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "test")
    const numberOfImports = result.getFunctionOrThrow("test")
      .getParent().getChildrenOfKind(SyntaxKind.ImportDeclaration).length

    expect(numberOfImports).toBe(2) // 1 import for collector 1 import util
  })

  test("test function with expression", async () => {

    const functionCode = `
  
    function test(){
      var1 = var1 + var2
      f.doSom()
      var2 = f.doSom()
    }
    
    `

    const fileSource = project.createSourceFile("./test/test.ts", functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "test")
    const instFunction = result.getFunctionOrThrow("test")
    controlStatementsNumber(instFunction, 1, 6, 0)
  })

  function cleanTestSpace() {
    const file = project.getSourceFile("./test/test.ts")
    if (file) {
      file.deleteImmediatelySync()
      file.forget()
    }

    const wrap = project.getSourceFile("./test/instrumentation/test.ts")
    if (wrap) {
      wrap.deleteImmediatelySync()
      wrap.forget()
    }
  }

  function controlStatementsNumber(functionInst: FunctionDeclaration, variable: number, expression: number, return_: number) {
    expect(functionInst.getDescendantsOfKind(SyntaxKind.VariableStatement).length).toBe(variable)
    expect(functionInst.getDescendantsOfKind(SyntaxKind.ExpressionStatement).length).toBe(expression)
    expect(functionInst.getDescendantsOfKind(SyntaxKind.ReturnStatement).length).toBe(return_)
  }
})
