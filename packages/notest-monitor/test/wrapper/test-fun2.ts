import {x} from "./test-class";



export function instrumentedXFunction(a:number, b:number){
        if(true){
            x(1,1)
        } else {

        }
        return a + b + 1
}

export const instrLogic = ()=>true
