import { Table } from "@serverless-stack/node/table";
import { SQSRecord } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import {formatedTimestamp} from "../lib/index"

const dynamoDb = new DynamoDB.DocumentClient();

export const saveMessage = async (event: SQSRecord) : Promise<void> => {
    console.log("Move to db", event);
    try {
        const message = JSON.parse(event.body)
        const putParams = {
            TableName: Table.FailedMessages4.tableName,
            Item: {
                id: event.messageId,
                message: message,
                createdAt: formatedTimestamp()
            }
        }
        await dynamoDb.put(putParams).promise()
    } catch (error: any) {
       console.log("Move TO DB Error", error.message) 
    }
}