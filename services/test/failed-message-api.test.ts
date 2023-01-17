import {describe ,expect, jest, test} from '@jest/globals';
import {handler} from "../functions/failed-message-api"

jest.unstable_mockModule('../db/failedMessages', () => {
    return {
        fetchMessages: jest.fn((desc: boolean, startDate : string, endDate: string) => {
            if(startDate.length != 19 || endDate.length != 19) {
                return 'Invalid date format'
            }
            if (!desc) {
                return []
            } else {
                return [{ordered : false},{ordered : false},{ordered : false},{ordered : false},{ordered : false},{ordered : false}]
            }
        })
    }
});

describe("Failed Message API Test", () => {
    const request: any = {};
    request.rawQueryString = "startDate=2023-01-16 15:14:00&endDate=2023-01-16 15:30:00&desc=false"
    test("Test Invalid date", async () => {
        //@ts-ignore
        const result = await handler(request, null, null)
        expect("Invalid date format").toEqual(result);
    })
})

