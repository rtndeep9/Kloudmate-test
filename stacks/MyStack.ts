import { Api, StackContext, Table, Queue, Config } from "@serverless-stack/resources";

export function MyStack({ stack }: StackContext) {

	// Create the table
	const failedMessagesTable = new Table(stack, "FailedMessages11", {
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
				bind: [failedMessagesTable],
			},
			cdk: {
				eventSource: {
					batchSize: 1,
				}
			},
		},
	});

	//Create a queue
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
	})

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

	process.env.QUEUE_URL = queue.queueUrl;
	process.env.RETRY_QUEUE_URL = retryQueue.queueUrl;

	// Show the API endpoint in the output
	stack.addOutputs({
		ApiEndpoint: api.url,
		QueueUrl: queue.queueUrl,
		RetryQueueUrl: retryQueue.queueUrl
	});
}