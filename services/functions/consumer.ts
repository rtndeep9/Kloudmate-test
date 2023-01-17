import { SQSBatchItemFailure, SQSEvent, SQSHandler } from "aws-lambda";
import { SQS } from "aws-sdk";

const sqs = new SQS();

export const handler: SQSHandler = async (event: SQSEvent) => {
    try {
        //An arrays which maintains failed messages ID
        const returned_message_ids: string[] = [];

        for (let record of event["Records"]) {
            await handleRecord(record, returned_message_ids)
        }

        // Return the failed messages to the queue which will send it to the DLQ
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

            //Delete successfully processed messages from the Queue
            const params = {
                QueueUrl: process.env.QUEUE_URL,
                ReceiptHandle: record.receiptHandle
            };
            await sqs.deleteMessage(params).promise();
            console.log("Message processed!");
            
        } else {
            // Append failed messageId to the array
            returned_message_ids.push(record.messageId)
            console.log("Message Unsuccessful");
        }
    } catch (err) {
        const error = err as Error;
        console.log("Consumer Error", error.message)
    }
}