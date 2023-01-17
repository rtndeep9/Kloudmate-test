import { SQSBatchItemFailure, SQSEvent, SQSHandler } from "aws-lambda";
import { SQS } from "aws-sdk";

const sqs = new SQS();

export const handler: SQSHandler = async (event: SQSEvent) => {
    try {
        const returned_message_ids: string[] = [];

        for (let record of event["Records"]) {
            await handleRecord(record, returned_message_ids)
        }

        const batchItemFailures: SQSBatchItemFailure[] = [];
        for (let id of returned_message_ids) {
            batchItemFailures.push({ itemIdentifier: id })
        }

        return {
            batchItemFailures: batchItemFailures
        }
    } catch (err) {
        const error = err as Error;
        console.log("Consumer Error", error.message)
    }
}


const handleRecord = async (record: any, returned_message_ids: string[]) => {
    try {
        const body = JSON.parse(record.body)
        if (body.ordered === true) {
            const params = {
                QueueUrl: process.env.QUEUE_URL,
                ReceiptHandle: record.receiptHandle
            };
            console.log("Params", params)
            await sqs.deleteMessage(params).promise();
            console.log("Message processed!");
            
        } else {
            returned_message_ids.push(record.messageId)
            console.log("Message Unsuccessful");
        }
    } catch (err) {
        const error = err as Error;
        console.log("Consumer Error", error.message)
    }
}