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
        Id: "1",
        MessageBody: JSON.stringify({ordered: true})
      },
      {
        Id: "2",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "3",
        MessageBody: JSON.stringify({ordered: true})
      },
      {
        Id: "4",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "5",
        MessageBody: JSON.stringify({ordered: true})
      },
      {
        Id: "6",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "7",
        MessageBody: JSON.stringify({ordered: true})
      },
      {
        Id: "8",
        MessageBody: JSON.stringify({ordered: false})
      },
      {
        Id: "9",
        MessageBody: JSON.stringify({ordered: true})
      },
      {
        Id: "10",
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