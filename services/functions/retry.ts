import { SQSEvent, SQSHandler} from "aws-lambda";
import { Lambda, SQS } from "aws-sdk";
const sqs = new SQS();
const lambda = new Lambda();

const EXP_RATE = 1.5;
const MIN_TIME = 10;
const MAX_RETRY = 3;

export const handler : SQSHandler  = async (event : SQSEvent) => {
    try {
        console.log("Event Attributes", event.Records[0].attributes);

        let messageRetryCount : number;

        const sqs_appr_rec_count : Number = parseInt(event.Records[0].attributes.ApproximateReceiveCount);
        const first_receive: Boolean = sqs_appr_rec_count <= 1 ? true : false;
        const payload : {retry_metadata: {attempt: number}, original_payload: object} = JSON.parse(event.Records[0].body);

        if (payload.retry_metadata) {
            messageRetryCount = payload.retry_metadata.attempt + 1;
        } else {
            messageRetryCount = 1;
        }

        if (messageRetryCount > MAX_RETRY) {
            // Move payload to dynamo db
            console.log("Move to db", payload)
        }

        if(first_receive) {
            returnSqsWithBackoff(event, messageRetryCount);
        } else {
            retryLambda(payload);
        }
    } catch (e : any) {
        console.log("Error", e.message)
    }
}

const returnSqsWithBackoff = async (event: SQSEvent, messageRetryCount: number) : Promise<void> => {
    const exp_backoff = MIN_TIME * EXP_RATE ** messageRetryCount;
    const jitter = calculateFullJitter(MIN_TIME, exp_backoff)

    console.log("Exp Backoff", exp_backoff);
    console.log("Jitter", jitter);

    const visibilityParams = {
        QueueUrl: "https://sqs.ap-south-1.amazonaws.com/842120176259/dev-kloudmate-backend-test-RetryQueue",
        ReceiptHandle: event.Records[0].receiptHandle,
        VisibilityTimeout: jitter
    }
    try {
        const resp = await sqs.changeMessageVisibility(visibilityParams).promise();
        console.log("Visibility Success", resp)
    } catch (e:any) {
        console.log("Visibility Error", e.message);
    }
    return
}

const retryLambda = async (payload : any) : Promise<void>=> {
    try {
        let lambdaPayload = {};
    
        if (payload.retry_metadata) {
            payload.retry_metadata.attempt += 1;
            lambdaPayload = payload
        } else {
            lambdaPayload.original_payload = payload
            lambdaPayload.retry_metadata = {
                attempt: 1
            };
        }
    
        console.log("Lambda Payload", lambdaPayload)
        const response = await lambda.invoke({
            FunctionName: "QueueConsumer",
            InvocationType: "Event",
            Payload: JSON.stringify(lambdaPayload)
        }).promise();
    
        console.log("Response", response); 
    } catch (error) {
        console.log(error)
    }
}

const calculateFullJitter = (min : number, max : number) : number => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
  
