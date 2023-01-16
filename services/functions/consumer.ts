import { Queue } from "@serverless-stack/node/queue";
import { SQSBatchItemFailure, SQSEvent, SQSHandler} from "aws-lambda";
import { SQS } from "aws-sdk";

const sqs = new SQS();

export const handler : SQSHandler = async (event: SQSEvent) => {
    try {
        const returned_message_ids : string[] = [];
    
        for (let record of event["Records"]) {
            await handleRecord(record, returned_message_ids)
        }

        const batchItemFailures : SQSBatchItemFailure[] = [];
        for (let id of returned_message_ids) {
            batchItemFailures.push({itemIdentifier: id})
        }
    
        return {
            batchItemFailures: batchItemFailures
        }
    } catch (error: any) {
        console.log("Consumer Error", error.message)
    }
}


const handleRecord = async (record : any, returned_message_ids: string[]) => {
   try {
    const body = JSON.parse(record.body)
    if(body.ordered) {
        console.log("Message processed!");

        // Delete successfully processed messages from the Queue
        const params = {
            QueueUrl: Queue.Queue.queueUrl,
            ReceiptHandle: record.receiptHandle
        };
        await sqs.deleteMessage(params).promise();
    } else {
        returned_message_ids.push(record.messageId)
        console.log("Message Unsuccessful");
    }
   } catch (error: any) {
        console.log("Consumer Error", error.message)
   }
}