import { collector, instrumentationRules } from '@butopen/notest-collector';

export function instrument_getVariableAtIndex() {
    return function instrumentation(idx: number, variables: { value: number; }[]) {
        try {
            collector.collect({
                script: 'function',
                type: 'text',
                value: { content: 'DQoNCmZ1bmN0aW9uIGdldFZhcmlhYmxlQXRJbmRleChpZHg6IG51bWJlciwgdmFyaWFibGVzOiB7IHZhbHVlOiBudW1iZXIgfVtdKSB7DQogIGNvbnN0IHJlc3VsdCA9IHZhcmlhYmxlc1tpZHhdLnZhbHVlDQogIHJldHVybiByZXN1bHQNCn0=' },
                line: 0,
                function: 'getVariableAtIndex',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            collector.collect({
                script: 'function',
                type: 'input',
                value: { content: variables },
                line: 12,
                function: 'getVariableAtIndex',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            collector.collect({
                script: 'function',
                type: 'input',
                value: { content: idx },
                line: 12,
                function: 'getVariableAtIndex',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })

            const result = variables[idx].value

            collector.collect({
                script: 'function',
                type: 'variable',
                value: { content: result },
                line: 13,
                function: 'getVariableAtIndex',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            const output = result

            collector.collect({
                script: 'function',
                type: 'output',
                value: { content: output },
                line: 26,
                function: 'getVariableAtIndex',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return output
        } catch (error: any) {
            collector.collect({
                script: 'function',
                type: 'exception',
                value: { content: error.message },
                line: 12,
                function: 'getVariableAtIndex',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return error
        }
    }
}

export function useInstrumented_getVariableAtIndex() {
    return instrumentationRules.check({ path: 'src/calculator', name: 'getVariableAtIndex' })
}

export function instrument_execute(Calculator) {
    Calculator.prototype.execute = function(this, op1: number, op2: number) {
        try {
            collector.collect({
                script: 'method',
                type: 'text',
                value: { content: 'DQoNCiAgZXhlY3V0ZShvcDE6IG51bWJlciwgb3AyOiBudW1iZXIpIHsNCiAgICB0aGlzLm9wZXJhdGlvbi5hZGRWYXJpYWJsZTEob3AxKQ0KICAgIHRoaXMub3BlcmF0aW9uLmFkZFZhcmlhYmxlMihvcDIpDQogICAgdGhpcy52YXJpYWJsZXMgPSBbe3ZhbHVlOiBvcDF9LCB7dmFsdWU6IG9wMn1dDQogICAgcmV0dXJuIHRoaXMub3BlcmF0aW9uLmRvQ2FsYyh0aGlzLnZhcmlhYmxlcykNCiAgfQ==' },
                line: 0,
                function: this.constructor.name + "." + 'execute',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            collector.collect({
                script: 'method',
                type: 'input',
                value: { content: op2 },
                line: 93,
                function: this.constructor.name + "." + 'execute',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            collector.collect({
                script: 'method',
                type: 'input',
                value: { content: op1 },
                line: 93,
                function: this.constructor.name + "." + 'execute',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })

            this.operation.addVariable1(op1)





            this.operation.addVariable2(op2)





            this.variables = [{ value: op1 }, { value: op2 }]


            collector.collect({
                script: 'method',
                type: 'expression',
                value: { content: this.variables },
                line: 104,
                function: this.constructor.name + "." + 'execute',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            const output = this.operation.doCalc(this.variables)

            collector.collect({
                script: 'method',
                type: 'output',
                value: { content: output },
                line: 120,
                function: this.constructor.name + "." + 'execute',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return output
        } catch (error: any) {
            collector.collect({
                script: 'method',
                type: 'exception',
                value: { content: error.message },
                line: 93,
                function: this.constructor.name + "." + 'execute',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return error
        }
    }
}

export function useInstrumented_execute() {
    return instrumentationRules.check({ path: 'src/calculator', name: 'Calculator.execute' })
}

export function instrument_getInfoOnVariable(Calculator) {
    Calculator.prototype.getInfoOnVariable = function(this, idx: number) {
        try {
            collector.collect({
                script: 'method',
                type: 'text',
                value: { content: 'DQoNCiAgZ2V0SW5mb09uVmFyaWFibGUoaWR4OiBudW1iZXIpIHsNCiAgICByZXR1cm4gZ2V0VmFyaWFibGVBdEluZGV4KGlkeCwgdGhpcy52YXJpYWJsZXMpDQogIH0=' },
                line: 0,
                function: this.constructor.name + "." + 'getInfoOnVariable',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            collector.collect({
                script: 'method',
                type: 'input',
                value: { content: idx },
                line: 185,
                function: this.constructor.name + "." + 'getInfoOnVariable',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            const output = getVariableAtIndex(idx, this.variables)

            collector.collect({
                script: 'method',
                type: 'output',
                value: { content: output },
                line: 186,
                function: this.constructor.name + "." + 'getInfoOnVariable',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return output
        } catch (error: any) {
            collector.collect({
                script: 'method',
                type: 'exception',
                value: { content: error.message },
                line: 185,
                function: this.constructor.name + "." + 'getInfoOnVariable',
                file: 'src/calculator.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return error
        }
    }
}

export function useInstrumented_getInfoOnVariable() {
    return instrumentationRules.check({ path: 'src/calculator', name: 'Calculator.getInfoOnVariable' })
}


function getVariableAtIndex(idx: number, variables: { value: number }[]) {
    const result = variables[idx].value
    return result
}
