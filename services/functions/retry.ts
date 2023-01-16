import { Queue, } from "@serverless-stack/node/queue";
import { SQSEvent, SQSHandler} from "aws-lambda";
import { SQS } from "aws-sdk";

import { saveMessage } from "DataAccessLayer/saveMessage";
import { calculateFullJitter } from "lib";

const sqs = new SQS();

const EXP_RATE = 1.5;
const MIN_TIME = 60;
const MAX_RETRY = 3;

export const handler : SQSHandler  = async (event : SQSEvent) => {
    try {
        let retryAttempt:number = 0;
        const record = event.Records[0];
        if (record.messageAttributes['sqs-retry-attempt']){
            retryAttempt = parseInt(record.messageAttributes['sqs-retry-attempt']["stringValue"]!);
        }

        console.log("Number of retries already done", retryAttempt);
        retryAttempt++;

        if(retryAttempt > MAX_RETRY) {
            await saveMessage(record);
        } else {
            const exp_backoff = MIN_TIME * EXP_RATE ** (retryAttempt);
            const jitter = calculateFullJitter(MIN_TIME, exp_backoff);

            console.log("Exp Backoff: "+ exp_backoff+" jitter: "+ jitter);

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
    } catch (e : any) {
        console.log("Error", e.message)
    }
}