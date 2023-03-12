"use strict";

const whatsapp_token = process.env.WHATSAPP_TOKEN;

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  rateLimit = require("express-rate-limit"),
  {
    runCompletionSearchWithGPT3,
    runCompletionWithRetry,
    testIfCurrentData,
    getSimpleSearchQuery,
  } = require("./openai.js"),
  { writePreviousMessage, getPreviousMessage } = require("./firebase.js"),
  { getSnippets } = require("./google"),
  { serpApiAnswerBox } = require("./serp.js"),
  app = express().use(body_parser.json()); // creates express http server

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 8, // limit each phone number to 10 requests per windowMs
  keyGenerator: function (req) {
    // Generate a unique identifier for the rate limiter based on the phone number
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      return req.body.entry[0].changes[0].value.messages[0].from;
    }
    else return req;
  },
  handler: function (req, res, next) {
    // Handle rate limit violation
    console.log(`TOO MANY REQUESTS`)
    res.status(429).json({
      error: "Too many requests, please try again later",
    });
  },
});

app.use(limiter);

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  // console.log(JSON.stringify(req.body));
  // Check the Incoming webhook message
  // console.log(JSON.stringify(req.body, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let name = req.body.entry[0].changes[0].value.contacts[0].profile.name;
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload

      let openai_response = "";
      console.log(from);
      // let context = "", question = "";

      let previous_message = {
        context: "",
        question: "",
      };

      await getPreviousMessage(from, previous_message).catch((error) => {
        console.error(error);
      });

      let completion, search_query, snippets;

      //       await getSnippets(search_query)
      //       .then((result) => console.log(result))
      //       .catch((error) => console.error(`(getSnippets) Error: ${error.message}`))

      await runCompletionWithRetry(previous_message, msg_body, snippets)
        .then((result) => (completion = result))
        .catch((error) =>
          console.error(`(runCompletionWithRetry) Error: ${error.message}`)
        );

      for (let result of completion.data.choices) {
        // console.log(result.message);
        openai_response += result.message.content;
      }

      let current_data_test = "";

      await testIfCurrentData(msg_body, openai_response)
        .then((result) => (current_data_test = result.data.choices[0].text))
        //result.data.choices[0].message.content)
        .catch((error) => console.error(`Error: ${error.message}`));

      console.log(openai_response);
      console.log(current_data_test);
      let output = openai_response;

      if (current_data_test.toLowerCase().includes("search")) {
        await getSimpleSearchQuery(msg_body)
          .then(
            (result) => (search_query = result.data.choices[0].message.content)
          )
          .catch((error) =>
            console.error(`(getSimpleSearchQuery) Error: ${error.message}`)
          );

        console.log(search_query);

        let search_result;

        await serpApiAnswerBox(search_query)
          .then((result) => {
            search_result = JSON.stringify(result);
          })
          .catch((error) =>
            console.error(`(serpApiAnswerBox) Error: ${error.message}`)
          );

        if (search_result) {
          await runCompletionSearchWithGPT3(search_result, msg_body)
            .then((result) => (completion = result.data.choices[0]))
            .catch((error) =>
              console.error(`(runCompletionWithRetry) Error: ${error.message}`)
            );

          openai_response = "";

          for (let result of completion.text) {
            openai_response += result;
          }

          console.log("google search");
        }
      }
        
      output = openai_response;

      await writePreviousMessage(from, openai_response, msg_body, name);

      await axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          whatsapp_token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: output },
        },
        headers: { "Content-Type": "application/json" },
      });
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
   **/
  const verify_token = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
