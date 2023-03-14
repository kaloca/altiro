const { google } = require("googleapis");

const customsearch = google.customsearch("v1");
const apiKey = process.env.GOOGLESEARCH_TOKEN;
const searchEngineId = process.env.GOOGLE_CSE;

const search2 = async (query) => {
  await customsearch.cse
    .list({
      auth: apiKey,
      cx: searchEngineId,
      q: query,
    })
    .then((result) => result.data)
    .then((result) => {
      const { queries, items, searchInformation } = result;
      return items;
    });
};

const search = async (query) => {
  try {
    const response = await customsearch.cse
    .list({
      auth: apiKey,
      cx: searchEngineId,
      q: query,
    })
    return response.data;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  };
}

const getSnippets = async (query) => {
  let result = "";
  console.log(query);
  try {
    const data = await search(query);
    console.log(data)
    for (let item of data.items){
      result += item.title + ' ' + item.snippet + ' ' + item.htmlSnippet + '\n';
    }
    return result;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  };
}

// Example usage
// search('what is the capital of France').then((result) => {
//   console.log(result);
// });

module.exports = { getSnippets };
