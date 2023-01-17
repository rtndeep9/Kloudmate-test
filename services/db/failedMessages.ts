import { Table } from "@serverless-stack/node/table";
import { SQSRecord } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { formatedTimestamp } from "lib";

const dynamoDb = new DynamoDB.DocumentClient();

export const fetchMessages = async (desc:boolean, startDate:any, endDate:any) => {
    const ddb = new DynamoDB();
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
            TableName: Table.FailedMessages11.tableName,            
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

export const saveMessage = async (event: SQSRecord) : Promise<void> => {
    try {
        console.log("Saving to DB...");
        const message = JSON.parse(event.body)
        const putParams = {
            TableName: Table.FailedMessages11.tableName,
            Item: {
                id: event.messageId,
                message: message,
                createdAt: formatedTimestamp(event.attributes.SentTimestamp)
            }
        }
        await dynamoDb.put(putParams).promise()
        console.log("Success")
    } catch (err) {
        const error = err as Error;
        console.log("Move TO DB Error", error.message) 
    }
}