import { Table } from "@serverless-stack/node/table";
import { DynamoDB } from "aws-sdk";

const ddb = new DynamoDB();

export const fetchMessagesDal = async (desc:boolean, startDate:any, endDate:any) => {
    try {

        if(startDate.length != 19 || endDate.length != 19) {
            throw new Error('Invalid date format');
        }
        const result: any[] = [];
        const params : DynamoDB.ScanInput = {
            ExpressionAttributeValues: {
                ':s': {S: startDate},
                ':e' : {S: endDate},
            },
            FilterExpression: 'createdAt BETWEEN :s and :e',
            ProjectionExpression: 'message,createdAt',
            TableName: Table.FailedMessages4.tableName,            
        }

        const messages: DynamoDB.ScanOutput = await ddb.scan(params).promise();
        
        if(messages.Items) {
            for (let message of messages.Items) {
                result.push(DynamoDB.Converter.unmarshall(message))
            }
        }

        //Sort Messages
        if(!desc) {
            result.sort((a,b) => {
                return a.createdAt > b.createdAt ? 1 : a.createdAt === b.createdAt ? 0 : -1
            })
        } else {
            result.sort((a,b) => {
                return a.createdAt > b.createdAt ? - 1 : a.createdAt === b.createdAt ? 0 : 1
            })
        }

        return { status: 200, result: result };
    } catch (err) {
        const error = err as Error;
        return { status: 400, errorMessage: error.message };
    }
};