import { Api, StackContext, Table, Queue } from "@serverless-stack/resources";

export function MyStack({ stack }: StackContext) {

	// Create a table for failed messages
	const failedMessagesTable = new Table(stack, "FailedMessages12", {
		fields: {
			id: "string",
			message: "string",
			createdAt: "string",
			status: "string"
		},
		primaryIndex: { partitionKey: "id", sortKey: "createdAt" },
		globalIndexes: {
			"time-index": { partitionKey: "status", sortKey: "createdAt"}
		}
	});

	//Create a retry queue which triggers a lambda with one Queue message at a time
	const retryQueue = new Queue(stack, "RetryQueue", {
		consumer: {
			function: {
				functionName: "RetryQueueConsumer",
				handler: "functions/retry.handler",
				timeout: 30,
				permissions: ["sqs"],
				bind: [failedMessagesTable],
			},
			cdk: {
				eventSource: {
					batchSize: 1,
				}
			},
		},
	});

	//Create a Regualr queue configured with a DLQ
	const queue = new Queue(stack, "Queue", {
		cdk: {
			queue: {
				deadLetterQueue: {
					maxReceiveCount: 1,
					queue: retryQueue.cdk.queue
				}
			}
		}
	});
	//Lazily add a consumer to the queue
	queue.addConsumer(stack, {
		function: {
			functionName: "QueueConsumer",
			handler: "functions/consumer.handler",
			timeout: 30,
			permissions: ["sqs"],
			environment: {
				QUEUE_URL: queue.queueUrl
			}
		},
		cdk: {
			eventSource: {
				reportBatchItemFailures: true
			}
		},
	});

	retryQueue.bind([queue]);

	// Create the HTTP API
	const api = new Api(stack, "Api", {
		defaults: {
			function: {
				bind: [failedMessagesTable, queue],
			},
		},
		routes: {
			"POST /send-sqs-messages": {
				function: {
					handler: "functions/producer.handler",
					timeout: 900,
				}
			},
			"GET /failed-messages": {
				function: {
					handler: "functions/failed-message-api.handler",
					timeout: 120
				}
			}
		},
	});

	// Show the API endpoint and Queue's URL in the output
	stack.addOutputs({
		ApiEndpoint: api.url,
		QueueUrl: queue.queueUrl,
		RetryQueueUrl: retryQueue.queueUrl
	});
}