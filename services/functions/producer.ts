import { SQS } from "aws-sdk";
import { Queue } from "@serverless-stack/node/queue";

const sqs = new SQS();

export async function handler() {
  await sqs
    .sendMessageBatch({
      Entries: [{
        Id: "11",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "12",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "13",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "14",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "15",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "16",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "17",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "18",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "19",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "20",
        MessageBody: JSON.stringify({ordered: false})
      }],
      QueueUrl: Queue.Queue.queueUrl
    })
    .promise();
    
  console.log("Message queued!");
  return {
    statusCode: 200,
    body: JSON.stringify({ status: "successful" }),
  };
}