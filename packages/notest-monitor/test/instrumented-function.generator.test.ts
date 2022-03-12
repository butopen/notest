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
    
    const result: FunctionDeclaration = functionInstrumenter.instrument(fileSource.getFilePath(), "test")
    /*
    expect(result.getName()).toEqual("add")
    expect(result.getParameters().map(p => p.getName()).join(",")).toEqual("x,y")
    expect(result.getParameters().map(p => p.getType().getText()).join(",")).toEqual("number,number")
    */
    fileSource.deleteImmediatelySync()
})

test("test function with variable declaration is generated correctly", async () => {

    const functionCode = `
    
    function test(param1,para2){
        const var1 = param1
        const var2 = function1(param2)
        return var1 + var2;
    }
    
    `

    const project = new Project({
        tsConfigFilePath: "tsconfig.json",
    });

    const fileSource = project.createSourceFile("./test/test.ts", functionCode)
    fileSource.saveSync()
    const functionInstrumenter = new FunctionInstrumenter()

    const result: FunctionDeclaration = functionInstrumenter.instrument(fileSource.getFilePath(), "test")

    fileSource.deleteImmediatelySync()
})
