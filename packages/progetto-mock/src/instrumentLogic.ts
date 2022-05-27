import {Calculator} from './calculator'
import {instrument_getInfoOnVariable,useInstrumented_getInfoOnVariable} from './instrumentation/calculator'
import {instrument_execute,useInstrumented_execute} from './instrumentation/calculator'
import {Adder} from './adder'
import {instrument_addVariable2,useInstrumented_addVariable2} from './instrumentation/adder'
import {instrument_addVariable1,useInstrumented_addVariable1} from './instrumentation/adder'
import {instrument_doCalc,useInstrumented_doCalc} from './instrumentation/adder'
/* decorated by notest... just ignore -> */if(useInstrumented_doCalc()){instrument_doCalc(Adder)}
/* decorated by notest... just ignore -> */if(useInstrumented_addVariable1()){instrument_addVariable1(Adder)}
/* decorated by notest... just ignore -> */if(useInstrumented_addVariable2()){instrument_addVariable2(Adder)}
/* decorated by notest... just ignore -> */if(useInstrumented_execute()){instrument_execute(Calculator)}
/* decorated by notest... just ignore -> */if(useInstrumented_getInfoOnVariable()){instrument_getInfoOnVariable(Calculator)}
