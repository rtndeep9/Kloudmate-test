
# SQS-Retry

An SQS with retry functionality and saving failed messages to DynamoDb




## Architecture
![Untitled Diagram drawio](https://user-images.githubusercontent.com/24302577/212956701-1c137c6f-91f2-4eab-9253-f9488af84e80.png)

## Run Locally

Clone the project

```bash
  git clone https://github.com/rtndeep9/SQS-Retry.git
```

Go to the project directory

```bash
  cd SQS-Retry
```

Install dependencies

```bash
  npm install
```

Start the serverless app

```bash
  npm start
```


## Sending Messages to SQS

Send a **POST** request to the ```send-sqs-messages``` endpoint with a JSON Body.

The body can be found in ```producer-payload.json``` file in the root directory.

## REST API to query failed messages

Send a **GET** request to the ```failed-messages``` endpoint with the following query params:

**Required:** ```startDate: YYYY-MM-DD HH:MM:SS``` ```endDate: YYYY-MM-DD HH:MM:SS```

**Optional:** ```desc: Boolean```
*If no ```desc``` is mentioned the results will be returned in ascending order*

**Example:** ```https://xyz.com/failed-messages?startDate=2023-01-17 16:36:00&endDate=2023-01-17 16:55:00&desc=true```
 
