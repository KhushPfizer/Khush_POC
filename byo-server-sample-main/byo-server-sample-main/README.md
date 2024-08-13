# Bring Your Own Server (Sample)

Simple NodeJS application which implements a BYO service to integrate with UneeQ's Synapse.

## Installation & Execution

`git clone`

`cd byo-server-sample`

`npm install`

`node server.js`

## What should I do with this?

This app-let serves as a reference to the format of the API request from Synapse and the expected format of the response.

Synapse will _try_ to negotiate an HTTP/2 connection with your service (if supported by your engine). If your service does not yet support HTTP/2, Synapse will fall back to HTTP/1.1

Synapse will send a POST request with a JSON BODY to your BYO Service with the following properties and their (types):

```javascript
{
    sid (String),
    customData (Object),
    userInput (String),
    conversationPayload (Object),
    type (String),
    uneeqSessionId (String - GUID),
    userLocale (String, e.g. 'en-US'),
    userLocation (Array, [LAT, LNG]),
}
```

Synapse will also send your BYO service the following headers, according to this code snippet:

```javascript
const payloadString = JSON.stringify(payload);

const headers = {
  ...this.platformConfig.headers,
  'Content-Type': 'application/json',
  'Content-Length': Buffer.byteLength(payloadString),
};
```

`platformConfig.headers` will vary by customer implementation.  Expect standard key-value pairs.

Your BYO service should respond to this with a JSON payload as follows.

The value of 'answer' will be used as the spoken output from the digital human.  The character will speak the string in this property.

You may pass any content within 'conversationPayload' that is JSON-parseable.  The property is a stringified JSON object, and will be passed back to your BYO endpoint with each subsequent request. You can use this field for conversation state tracking by passing something like a `conversationId` with a unique value identifying the conversation to your BYO service.  This field is useful to customers for metadata properties such as user ID, number of conversation turns, or any other random bits of information (not strictly personally-identifiable) which assist your service in processing each request.

The value of `instructions` is documented at [UneeQ's Documentation Site](https://docs.uneeq.io/displaying-content)

```javascript
{
    answer: 'Welcome',
    conversationPayload: '{}',
    instructions: {}
}
```

And (at least) a header like this:

```javascript
{
    'Content-Type', 'application/json'
}
```
