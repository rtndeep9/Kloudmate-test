import { Queue, } from "@serverless-stack/node/queue";
import { SQSEvent, SQSHandler } from "aws-lambda";
import { SQS } from "aws-sdk";

import { calculateFullJitter } from "lib";
import { saveMessage } from "../db/failedMessages";

const sqs = new SQS();

// Constants to calculate exponential backoff
const EXP_RATE = 1.5;
const MIN_TIME = 60;
const MAX_RETRY = 3;

export const handler: SQSHandler = async (event: SQSEvent) => {
    try {

        let retryAttempt: number = 0;
        const record = event.Records[0];
        if (record.messageAttributes['sqs-retry-attempt']) {
            retryAttempt = parseInt(record.messageAttributes['sqs-retry-attempt']["stringValue"]!);
        }

        retryAttempt++;

        //If retry attempt exceeds max retry save it to a database
        if (retryAttempt > MAX_RETRY) {
            await saveMessage(record);
        } else {
            console.log("Retry No", retryAttempt);
            //Calculate exp backoff and Jitter
            const exp_backoff = MIN_TIME * EXP_RATE ** (retryAttempt);
            const jitter = calculateFullJitter(MIN_TIME, exp_backoff);

            console.log("Exp Backoff: " + exp_backoff + " jitter: " + jitter);

            // Store the retryAttempt value in the MessageAttributes of queue to keep track of retries
            const params = {
                QueueUrl: Queue.Queue.queueUrl,
                MessageBody: record['body'],
                DelaySeconds: jitter,
                MessageAttributes: {
                    'sqs-retry-attempt': {
                        DataType: 'Number',
                        StringValue: `${retryAttempt}`
                    }
                }
            }
            await sqs.sendMessage(params).promise();
        }
    } catch (err) {
        const error = err as Error;
        console.log("Error", error.message);
    }
}