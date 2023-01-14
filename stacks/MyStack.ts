import { Api, StackContext, Table, Queue } from "@serverless-stack/resources";
import { SqsDestination } from "aws-cdk-lib/aws-lambda-destinations";

export function MyStack({ stack }: StackContext) {

  // Create the table
  const failedMessagesTable = new Table(stack, "FailedMessages", {
    fields: {
      message: "string",
    },
    primaryIndex: { partitionKey: "message" },
  });

  //Create a retry queue
  const retryQueue = new Queue(stack, "RetryQueue", {
    consumer: {
      function: {
        functionName: "RetryQueueConsumer",
        handler: "functions/retry.handler",
        timeout: 30,
        permissions: ["lambda", "sqs"]
      },
      cdk: {
        eventSource: {
          batchSize: 1
        }
      }
    },
  });

  //Create a queue
  const queue = new Queue(stack, "Queue", {
    consumer: {
      function: {
        functionName: "QueueConsumer",
        handler: "functions/consumer.handler",
        timeout: 30,
        retryAttempts: 0,
        bind: [retryQueue],
        permissions: ["sqs", "lambda"]
        // onFailure: new SqsDestination(retryQueue.cdk.queue)        
      }
    }
  });

  // Create the HTTP API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        bind: [failedMessagesTable, queue],
      },
    },
    routes: {
      "POST /": "functions/lambda.handler",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    QueueUrl: queue.queueUrl,
    RetryQueueUrl: retryQueue.queueUrl
  });
}
