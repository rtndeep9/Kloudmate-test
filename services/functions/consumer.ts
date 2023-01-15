import { SQSBatchItemFailure, SQSEvent, SQSHandler} from "aws-lambda";
import { SQS } from "aws-sdk";

const sqs = new SQS();
// const returned_message_ids : string[] = [];

export const handler : SQSHandler = async (event: SQSEvent) => {
    if (event.Records) {
        for (let record of event["Records"]) {
            handleRecord(record)
        }
    } else {
        handleRecord(event)
    }
   
    // const batchItemFailures : SQSBatchItemFailure[] = [];
    // for (let id of returned_message_ids) {
    //     batchItemFailures.push({itemIdentifier: id})
    // }
  
    // return {
    //     batchItemFailures: batchItemFailures
    // }
}

const handleRecord = async (record : any) => {
    try {
        console.log("Record", record);
        let body;
        if(record.body){
            body = JSON.parse(record.body);
        } else {
            //Event from retry lambda
            body = record;
        }
        if(body.ordered) {
            console.log("Message processed!");
    
            // Delete successfully processed messages from the Queue
            const params = {
                QueueUrl: "https://sqs.ap-south-1.amazonaws.com/842120176259/dev-kloudmate-backend-test-Queue",
                ReceiptHandle: record.receiptHandle
            };
            const deleteREsp = await sqs.deleteMessage(params).promise();
            console.log("Delete Resp", deleteREsp)
        } else {
            // if(record.messageId) {
            //     returned_message_ids.push(record.messageId);
            // }
    
            console.log("Order Unsuccessful")
            // Send failed messages to retry queue
            const resp = await sqs.sendMessage({
                QueueUrl: "https://sqs.ap-south-1.amazonaws.com/842120176259/dev-kloudmate-backend-test-RetryQueue",
                MessageBody: JSON.stringify(body)
            }).promise();
            console.log("Unscess Resp", resp)
        }    
    } catch (error) {
        console.log("Error", error)
    }
}