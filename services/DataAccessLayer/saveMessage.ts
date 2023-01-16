import { Table } from "@serverless-stack/node/table";
import { SQSRecord } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import {formatedTimestamp} from "../lib/index"

const dynamoDb = new DynamoDB.DocumentClient();

export const saveMessage = async (event: SQSRecord) : Promise<void> => {
    try {
        console.log("Saving to DB...");
        const message = JSON.parse(event.body)
        const putParams = {
            TableName: Table.FailedMessages4.tableName,
            Item: {
                id: event.messageId,
                message: message,
                createdAt: formatedTimestamp(event.attributes.SentTimestamp)
            }
        }
        await dynamoDb.put(putParams).promise()
        console.log("Success")
    } catch (error: any) {
       console.log("Move TO DB Error", error.message) 
    }
}