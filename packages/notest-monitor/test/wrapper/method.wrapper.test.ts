
import {TestClass, x} from "./test-class";



test("test method wrapping", async () => {
    expect(new TestClass().m1(1,1)).toBe(8)
    expect(x(1,1)).toBe(3)
})
