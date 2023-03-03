const { WebSearchClient } = require('@azure/cognitiveservices-websearch');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

const subscriptionKey = process.env.BING_KEY;
const endpoint = 'https://api.cognitive.microsoft.com/';
const client = new WebSearchClient(endpoint, new CognitiveServicesCredentials(subscriptionKey));

async function search(query) {
    const result = await client.web.search(query);
    return result.webPages.value.map((page) => page.url);
}

const query = 'example query';
test = async () => await search(query);
console.log(test());