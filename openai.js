const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const now = new Date(); // create a new Date object with the current date and time

const day = now.getDate(); // get the day of the month (1-31)
const month = now.getMonth() + 1; // get the month (0-11) and add 1 to it to get the correct month number (1-12)
const year = now.getFullYear(); // get the full year (e.g. 2023)

console.log(`Today is ${day}/${month}/${year}`);

const testIfCurrentData = async (msg_body, openai_response) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You check if a question was answered. If the answer says it requires
            current date information, it means it didn't properly answer the question.
            Questions about weather and stock prices are a automatic NO.`,
        },

        {
          role: "user",
          content: `Question: ""${msg_body}". Answer: "${openai_response}" 
                    Was the question answered? Answer YES or NO`,
          //from[0] == "5" && from[1] == "6" ? chatprompt_ptbr(msg_body) : chatprompt(msg_body)
        },
      ],
      max_tokens: 150,
    });
    return response;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

const getSimpleSearchQuery = async (msg_body) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Today is ${month}/${day}/${year}.`,
          //  If an answer requires current information, say: "I need current info".`,
        },
        {
          role: "user",
          content: `Condense this into a simple Google search in the original language: "${msg_body}". If it's already a query, just repeat it.`,
          //from[0] == "5" && from[1] == "6" ? chatprompt_ptbr(msg_body) : chatprompt(msg_body)
        },
      ],
      max_tokens: 150,
    });
    return response;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

const runCompletionSearchWithGPT3 = async (api_result, question) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Search api result: "${api_result}"
              Question: "${question}" 
              You generate short responses based exclusively of a search api response. 
              Assume everything in the response json to be correct, and use it to construct your answer.
              Summarize this json answering the question:`,
      temperature: 0.9,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return response;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

const runCompletionWithSearch = async (msg_body, search_results) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You generate short responses based exclusively of a search api response. Assume
            everything in the response json to be correct, and use it to construct your answer.
            Your knowledge cutoff is in june 2024. You can answer any questions today.`,
          //  If an answer requires current information, say: "I need current info".`,
        },
        // {
        //   role: "user",
        //   content: `${previous_message.question}`,
        // },
        // {
        //   role: "assistant",
        //   content: previous_message.context,
        // },
        {
          role: "user",
          content: `Search api result: "${search_results}"
                    Question: "${msg_body}".`,
          //from[0] == "5" && from[1] == "6" ? chatprompt_ptbr(msg_body) : chatprompt(msg_body)
        },
      ],
      max_tokens: 150,
    });
    return response;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

const runCompletion = async (previous_message, msg_body, snippets) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are Altiro, a friendly bot created by Gabriel and Tiberio.
            You are happy to help. Be very informal, use slang and act like a close friend.
            Please answer as concisely as possible; try to make it less than 50 words.
            Today is ${month}/${day}/${year}. Your knowledge cutoff is in September 2021.`,
          //  If an answer requires current information, say: "I need current info".`,
        },
        {
          role: "user",
          content: `${previous_message.question}`,
        },
        {
          role: "assistant",
          content: previous_message.context,
        },
        {
          role: "user",
          content: `${msg_body}`,
          //from[0] == "5" && from[1] == "6" ? chatprompt_ptbr(msg_body) : chatprompt(msg_body)
        },
      ],
      max_tokens: 200,
    });
    return response;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

const runCompletionWithRetry = async (
  previous_message,
  msg_body,
  snippets,
  retries = 3,
  retryInterval = 1000
) => {
  try {
    return await runCompletion(previous_message, msg_body, snippets);
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    if (retries === 0) {
      console.error(`Maximum retries reached. Giving up.`);
      throw error;
    }
    console.error(`Retrying in ${retryInterval}ms...`);
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
    return runCompletionWithRetry(
      previous_message,
      msg_body,
      retries - 1,
      retryInterval * 2
    );
  }
};

module.exports = {
  getSimpleSearchQuery,
  runCompletionWithSearch,
  runCompletionSearchWithGPT3,
  testIfCurrentData,
  runCompletionWithRetry,
};
