import queryString from 'query-string';

import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { fetchMessages } from "../db/failedMessages";

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
    try {
        const params = queryString.parse(request.rawQueryString, {parseBooleans: true});
        //Assume sort by ascending order
        let desc: any = false

        //Validate Start Date and End Date
        if (!params.startDate || !params.endDate) {
            throw new Error('Invalid request body. startDate or endDate is not provided');
        }
        if(new Date(params.startDate.toString()) >= new Date(params.endDate.toString())) {
            throw new Error("Start Date should be less than End Date")
        }

        //If desc present in query params change it
        if(params.desc) {
            desc = params.desc
        }

        //Fetch Messages from the DB
        const messages = await fetchMessages(desc, params.startDate, params.endDate);
        return {
            statusCode: 200,
            body: JSON.stringify(messages)
        };
    } catch (err) {
        const error = err as Error;
        return {
            statusCode: 400,
            body: JSON.stringify({ errorMessage: error.message })
        };
    }
}