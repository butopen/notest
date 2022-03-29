//import {instrumentClass_m1} from "./insturmented/ssadasda"

import { instrumentedXFunction, instrLogic } from "./test-fun2"

export class TestClass {

    private x = 1

    m1(a:number, b:number){
        return a + b + this.x
    }


}
//instrumentClass_m1(TestClass)
//instrumentClass_m1(TestClass) {
TestClass.prototype.m1 = function (this, a:number, b:number) {
    return a + b +5+this["x"]
}
//}



//import exportedInstrumentedFucntion


/*

function instrumentedX(a:number, b:number){return instrumentedXFunction(a,b)}
function x(a:number, b:number){

    return a + b
}


export {instrumentedX as x, x as xOriginal}
 */



export function x(a:number, b:number){
    /* decorated by notest... just ignore -> */if(instrLogic()) return instrumentedXFunction(a,b)
    return a + b
}



