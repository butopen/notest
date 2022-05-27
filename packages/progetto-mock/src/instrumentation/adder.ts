import { collector, instrumentationRules } from '@butopen/notest-collector'

export function instrument_executeCalc() {
    return function instrumentation(val1: number, val2: number) {
        try {
            collector.collect({
                script: 'function',
                type: 'text',
                value: { content: 'DQoNCmZ1bmN0aW9uIGV4ZWN1dGVDYWxjKHZhbDE6IG51bWJlciwgdmFsMjogbnVtYmVyKSB7DQogIHJldHVybiB2YWwxICsgdmFsMg0KfQ==' },
                line: 0,
                function: 'executeCalc',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            collector.collect({
                script: 'function',
                type: 'input',
                value: { content: val2 },
                line: 208,
                function: 'executeCalc',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            collector.collect({
                script: 'function',
                type: 'input',
                value: { content: val1 },
                line: 208,
                function: 'executeCalc',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            const output = val1 + val2

            collector.collect({
                script: 'function',
                type: 'output',
                value: { content: output },
                line: 209,
                function: 'executeCalc',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return output
        } catch (error: any) {
            collector.collect({
                script: 'function',
                type: 'exception',
                value: { content: error.message },
                line: 208,
                function: 'executeCalc',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return error
        }
    }
}

export function useInstrumented_executeCalc() {
    return instrumentationRules.check({ path: 'src/adder', name: 'executeCalc' })
}

export function instrument_doCalc(Adder) {
    Adder.prototype.doCalc = function(this, variables: any) {
        try {
            collector.collect({
                script: 'method',
                type: 'text',
                value: { content: 'DQoNCiAgZG9DYWxjKHZhcmlhYmxlcyk6IG51bWJlciB7DQogICAgcmV0dXJuIGV4ZWN1dGVDYWxjKHZhcmlhYmxlc1swXS52YWx1ZSwgdmFyaWFibGVzWzFdLnZhbHVlKQ0KICB9' },
                line: 0,
                function: this.constructor.name + "." + 'doCalc',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            collector.collect({
                script: 'method',
                type: 'input',
                value: { content: variables },
                line: 219,
                function: this.constructor.name + "." + 'doCalc',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            const output = executeCalc(variables[0].value, variables[1].value)

            collector.collect({
                script: 'method',
                type: 'output',
                value: { content: output },
                line: 220,
                function: this.constructor.name + "." + 'doCalc',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return output
        } catch (error: any) {
            collector.collect({
                script: 'method',
                type: 'exception',
                value: { content: error.message },
                line: 219,
                function: this.constructor.name + "." + 'doCalc',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return error
        }
    }
}

export function useInstrumented_doCalc() {
    return instrumentationRules.check({ path: 'src/adder', name: 'Adder.doCalc' })
}

export function instrument_addVariable1(Adder) {
    Adder.prototype.addVariable1 = function(this, number: number) {
        try {
            collector.collect({
                script: 'method',
                type: 'text',
                value: { content: 'DQoNCiAgYWRkVmFyaWFibGUxKG51bWJlcjogbnVtYmVyKTogc3RyaW5nIHsNCiAgICB0aGlzLm9wMSA9IHt2YWx1ZTogbnVtYmVyfQ0KICAgIHJldHVybiAiYWRkZWQgdmFsdWU6ICIgKyBudW1iZXINCiAgfQ==' },
                line: 0,
                function: this.constructor.name + "." + 'addVariable1',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            collector.collect({
                script: 'method',
                type: 'input',
                value: { content: number },
                line: 205,
                function: this.constructor.name + "." + 'addVariable1',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })

            this.op1 = { value: number }


            collector.collect({
                script: 'method',
                type: 'expression',
                value: { content: this.op1 },
                line: 206,
                function: this.constructor.name + "." + 'addVariable1',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            const output = "added value: " + number

            collector.collect({
                script: 'method',
                type: 'output',
                value: { content: output },
                line: 220,
                function: this.constructor.name + "." + 'addVariable1',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return output
        } catch (error: any) {
            collector.collect({
                script: 'method',
                type: 'exception',
                value: { content: error.message },
                line: 205,
                function: this.constructor.name + "." + 'addVariable1',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return error
        }
    }
}

export function useInstrumented_addVariable1() {
    return instrumentationRules.check({ path: 'src/adder', name: 'Adder.addVariable1' })
}

export function instrument_addVariable2(Adder) {
    Adder.prototype.addVariable2 = function(this, number: number) {
        try {
            collector.collect({
                script: 'method',
                type: 'text',
                value: { content: 'DQoNCiAgYWRkVmFyaWFibGUyKG51bWJlcjogbnVtYmVyKTogc3RyaW5nIHsNCiAgICB0aGlzLm9wMiA9IHt2YWx1ZTogbnVtYmVyfQ0KICAgIHJldHVybiAiYWRkZWQgdmFsdWU6ICIgKyBudW1iZXINCiAgfQ==' },
                line: 0,
                function: this.constructor.name + "." + 'addVariable2',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            collector.collect({
                script: 'method',
                type: 'input',
                value: { content: number },
                line: 205,
                function: this.constructor.name + "." + 'addVariable2',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })

            this.op2 = { value: number }


            collector.collect({
                script: 'method',
                type: 'expression',
                value: { content: this.op2 },
                line: 206,
                function: this.constructor.name + "." + 'addVariable2',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            const output = "added value: " + number

            collector.collect({
                script: 'method',
                type: 'output',
                value: { content: output },
                line: 220,
                function: this.constructor.name + "." + 'addVariable2',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return output
        } catch (error: any) {
            collector.collect({
                script: 'method',
                type: 'exception',
                value: { content: error.message },
                line: 205,
                function: this.constructor.name + "." + 'addVariable2',
                file: 'src/adder.ts',
                timestamp: Date.now(),
                other: undefined
            })
            return error
        }
    }
}

export function useInstrumented_addVariable2() {
    return instrumentationRules.check({ path: 'src/adder', name: 'Adder.addVariable2' })
}


function executeCalc(val1: number, val2: number) {
    return val1 + val2
}
