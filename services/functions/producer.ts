import { SQS } from "aws-sdk";
import { Queue } from "@serverless-stack/node/queue";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

const sqs = new SQS();

export const handler: APIGatewayProxyHandlerV2 = async (request) => {
	try {
		const body = request.body ? JSON.parse(request.body) : null;
		if (!body) {
			throw new Error("Invalid Payload, Send an array of objects in messages")
		}
		await sendMessages(body.messages);
		return {
			statusCode: 200,
			body: JSON.stringify({ status: "successful" }),
		};
	} catch (err) {
		const error = err as Error;
		return {
			statusCode: 400,
			body: JSON.stringify({ status: error.message }),
		};
	}
}

const sendMessages = async (messages: []) => {
	for (let i = 0; i < messages.length;) {
		var params: SQS.Types.SendMessageBatchRequest = {
			QueueUrl: Queue.Queue.queueUrl,
			Entries: [],
		};
		for (let j = 0; j < 10 && i < messages.length; i++, j++) {
			params.Entries.push({
				Id: `${i}`,
				MessageBody: JSON.stringify(messages[i]),
			});
		}
		await sqs.sendMessageBatch(params).promise();
		console.log("Messages queued: ", params.Entries.length);
	}
};
