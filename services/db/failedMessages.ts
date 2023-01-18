import { Table } from "@serverless-stack/node/table";
import { SQSRecord } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { formatedTimestamp } from "lib";

const dynamoDb = new DynamoDB.DocumentClient();

//Fetch messages from the table for a give date range and sort them
export const fetchMessages = async (desc:boolean, startDate:any, endDate:any) => {
    // const ddb = new DynamoDB();
    try {
        if(startDate.length != 19 || endDate.length != 19) {
            throw new Error('Invalid date format');
        }
        // const result: any[] = [];

        const params : DynamoDB.DocumentClient.QueryInput = {
            TableName: Table.FailedMessages12.tableName,
            IndexName: "time-index",
            KeyConditionExpression: "#db_status = :st AND #db_createdAt between :s AND :e",
            ExpressionAttributeNames: { 
                "#db_status": "status",
                 "#db_createdAt": "createdAt"
            },
            ExpressionAttributeValues: {
                ':st' : "ok",
                ':s' : `${startDate}`,
                ':e' : endDate,
            },
            ScanIndexForward: !desc
            
        }

        const {Items}: DynamoDB.DocumentClient.QueryOutput = await dynamoDb.query(params).promise();

        // const params : DynamoDB.ScanInput = {
        //     ExpressionAttributeValues: {
        //         ':s': {S: startDate},
        //         ':e' : {S: endDate},
        //     },
        //     FilterExpression: 'createdAt BETWEEN :s and :e',
        //     ProjectionExpression: 'message,createdAt',
        //     TableName: Table.FailedMessages12.tableName,            
        // }
        
        //Unmarshall ScanOutput and store it in result array 
        // if(messages.Items) {
        //     for (let message of messages.Items) {
        //         result.push(DynamoDB.Converter.unmarshall(message))
        //     }
        // }

        // //Sort Messages by date
        // if(!desc) {
        //     result.sort((a,b) => {
        //         return a.createdAt > b.createdAt ? 1 : a.createdAt === b.createdAt ? 0 : -1
        //     })
        // } else {
        //     result.sort((a,b) => {
        //         return a.createdAt > b.createdAt ? - 1 : a.createdAt === b.createdAt ? 0 : 1
        //     })
        // }

        return { status: 200, result: Items };
    } catch (err) {
        const error = err as Error;
        return { status: 400, errorMessage: error.message };
    }
};

//Save failed messages to the FailedMessages11 table
export const saveMessage = async (event: SQSRecord) : Promise<void> => {
    try {
        console.log("Saving to DB...");
        const message = JSON.parse(event.body)
        const putParams = {
            TableName: Table.FailedMessages12.tableName,
            Item: {
                id: event.messageId,
                status: "ok",
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