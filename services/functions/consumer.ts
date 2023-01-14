import { SQSBatchItemFailure, SQSEvent, SQSHandler} from "aws-lambda";
import { SQS } from "aws-sdk";

const sqs = new SQS();
const returned_message_ids : string[] = [];

export const handler : SQSHandler = async (event: SQSEvent) => {
    for (let record of event["Records"]) {
        const {ordered} = JSON.parse(record.body);
        if(ordered) {
            console.log("Message processed!");

            // Delete successfully processed messages from the Queue
            const params = {
                QueueUrl: "https://sqs.ap-south-1.amazonaws.com/842120176259/dev-kloudmate-backend-test-Queue",
                ReceiptHandle: record.receiptHandle
            };
            const deleteREsp = await sqs.deleteMessage(params).promise();
            console.log("Delete Resp", deleteREsp)
        } else {
            returned_message_ids.push(record.messageId);

            console.log("Order Unsuccessful")
            // Send failed messages to retry queue
            const resp = await sqs.sendMessage({
                QueueUrl: "https://sqs.ap-south-1.amazonaws.com/842120176259/dev-kloudmate-backend-test-RetryQueue",
                MessageBody: JSON.stringify({ordered})
            }).promise();
            console.log("Unscess Resp", resp)
        }
    }

    const batchItemFailures : SQSBatchItemFailure[] = [];
    for (let id of returned_message_ids) {
        batchItemFailures.push({itemIdentifier: id})
    }
  
    return {
        batchItemFailures: batchItemFailures
    }
}