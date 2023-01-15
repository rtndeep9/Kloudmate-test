import { DynamoDB, SQS } from "aws-sdk";
import { Table } from "@serverless-stack/node/table";
import { Queue } from "@serverless-stack/node/queue";

const sqs = new SQS();
const dynamoDb = new DynamoDB.DocumentClient();

// export async function main() {
//   const getParams = {
//     // Get the table name from the environment variable
//     TableName: Table.Counter.tableName,
//     // Get the row where the counter is called "hits"
//     Key: {
//       counter: "hits",
//     },
//   };
//   const results = await dynamoDb.get(getParams).promise();

//   // If there is a row, then get the value of the
//   // column called "tally"
//   let count = results.Item ? results.Item.tally : 0;

//   const putParams = {
//     TableName: Table.Counter.tableName,
//     Key: {
//       counter: "hits",
//     },
//     // Update the "tally" column
//     UpdateExpression: "SET tally = :count",
//     ExpressionAttributeValues: {
//       // Increase the count
//       ":count": ++count,
//     },
//   };
//   await dynamoDb.update(putParams).promise();

//   return {
//     statusCode: 200,
//     body: count,
//   };
// }

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