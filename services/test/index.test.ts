import {describe ,expect, test} from '@jest/globals';
import {formatedTimestamp, calculateFullJitter} from "../lib/index"

describe("Test Library Function", () => {
    test('Format timestamp to yyyy-mm-dd hh:mm:ss format', () => { 
        expect(formatedTimestamp("1673935181130")).toBe("2023-01-17 11:29:41")
    })

    test("Caculate Jitter", () => {
        expect(calculateFullJitter(60, 135)).toBeGreaterThanOrEqual(60);
        expect(calculateFullJitter(60, 135)).toBeLessThanOrEqual(135);
    })
})