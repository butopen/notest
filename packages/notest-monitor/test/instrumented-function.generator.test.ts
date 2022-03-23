import {FunctionDeclaration, Project, SourceFile, SyntaxKind} from "ts-morph";
import {FunctionInstrumenter} from "../src/function-wrapper/wrapper";


describe(`Testing Instrumentation Functions`, () => {
  const pathTestFunction: string = "./test/test-space-instrumentation/test.ts"
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
    
    export function testFunction(x:number, y:number) {
        return x + y
    }
    
    `

    const fileSource = project.createSourceFile(pathTestFunction, functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "testFunction")
    const instFunction = result.getFunctionOrThrow("testFunctionInstrumentedImplementation")
    expect(instFunction.getName()).toEqual("testFunctionInstrumentedImplementation")
    expect(instFunction.getParameters().map(p => p.getName()).join(",")).toEqual("x,y")
    expect(instFunction.getParameters().map(p => p.getType().getText()).join(",")).toEqual("number,number")
    controlStatementsNumber(instFunction, 1, 4, 1)
  })

  test("test function with variable declaration", async () => {

    const functionCode = `
    
    function testFunction(){
        const var1 = 1
        const {var3, var4, var5} = t.func(var1)
    }
    
    `

    const fileSource = project.createSourceFile(pathTestFunction, functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "testFunction")
    const instFunction = result.getFunctionOrThrow("testFunctionInstrumentedImplementation")
    controlStatementsNumber(instFunction, 2, 3, 0)
  })

  test("test function with nested statements", async () => {

    const functionCode = `
  
    function testFunction(){
        while(var1 == 1){
          const var2 = var1
          while(var1 == 1){
            const var3 = 1
          }
        }
    }
    
    `

    const fileSource = project.createSourceFile(pathTestFunction, functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "testFunction")
    const instFunction = result.getFunctionOrThrow("testFunctionInstrumentedImplementation")
    const numberStatementNestedInWhileStatement = result
      .getFunctionOrThrow("testFunctionInstrumentedImplementation")
      .getDescendantsOfKind(SyntaxKind.WhileStatement)[0]
      .getDescendantStatements().length
    expect(numberStatementNestedInWhileStatement).toBe(5)
    controlStatementsNumber(instFunction, 2, 3, 0)
  })

  test("test that only used import is generated", async () => {

    const functionCode = `
    
    import f1 from 'path1'
    import f2 from 'path2'
    
    function testFunction(){
        f1.doSomething()
    }

    `

    const fileSource = project.createSourceFile(pathTestFunction, functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "testFunction")
    const numberOfImports = result.getFunctionOrThrow("testFunctionInstrumentedImplementation")
      .getParent().getChildrenOfKind(SyntaxKind.ImportDeclaration).length
    expect(numberOfImports).toBe(4)
  })

  test("test function with expression", async () => {

    const functionCode = `
  
    function testFunction(){
      var1 = var1 + var2
      f.doSom()
      var2 = f.doSom()
    }
    
    `

    const fileSource = project.createSourceFile(pathTestFunction, functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: SourceFile = functionInstrumenter.instrument(fileSource.getFilePath(), "testFunction")
    const instFunction = result.getFunctionOrThrow("testFunctionInstrumentedImplementation")
    controlStatementsNumber(instFunction, 0, 6, 0)
  })

  function cleanTestSpace() {
    const file = project.getSourceFile(pathTestFunction)
    if (file) {
      file.deleteImmediatelySync()
      file.forget()
    }

    const wrap = project.getSourceFile("./test/test-space-instrumentation/instrumentation/test.ts")
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
