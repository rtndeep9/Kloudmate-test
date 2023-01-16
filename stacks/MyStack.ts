import { Api, StackContext, Table, Queue } from "@serverless-stack/resources";

export function MyStack({ stack }: StackContext) {

  // Create the table
  const failedMessagesTable = new Table(stack, "FailedMessages4", {
    fields: {
      id: "string",
      message: "string",
      createdAt: "string"
    },
    primaryIndex: { partitionKey: "id", sortKey: "createdAt" },
  });

  //Create a retry queue
  const retryQueue = new Queue(stack, "RetryQueue", {
    consumer: {
      function: {
        functionName: "RetryQueueConsumer",
        handler: "functions/retry.handler",
        timeout: 30,
        permissions: ["sqs"],
        bind: [failedMessagesTable]
      },
      cdk: {
        eventSource: {
          batchSize: 1 ,
        }
      },
    },
  });

  //Create a queue
  const queue = new Queue(stack, "Queue", {
    consumer: {
      function: {
        functionName: "QueueConsumer",
        handler: "functions/consumer.handler",
        timeout: 30,
        permissions: ["sqs", "lambda"],
      },   
      cdk: {
        eventSource: {
          reportBatchItemFailures: true
        }
      },
    },
    cdk: {
      queue: {
        deadLetterQueue: {
          maxReceiveCount: 1,
          queue: retryQueue.cdk.queue
        }
      }
    }
  });

  retryQueue.bind([queue])
  
  // Create the HTTP API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        bind: [failedMessagesTable, queue],
      },
    },
    routes: {
      "POST /send-sqs-messages": "functions/producer.handler",
      "GET /failed-messages": "functions/failed-message-api.handler"
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    QueueUrl: queue.queueUrl,
    RetryQueueUrl: retryQueue.queueUrl
  });
}
