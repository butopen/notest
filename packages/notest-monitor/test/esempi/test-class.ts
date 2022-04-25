export class TestClass {

  private x = 1

  m1(a: number, b: number) {
    return a + b + this.x
  }


}

instrument_m1(TestClass)

//../instrumented/fileName:ts
export function instrument_m1(TestClass) {
  TestClass.prototype.m1 =
    function (this, a: number, b: number) {
      return a + b + 5 + this["x"]
    }
}


