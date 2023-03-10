const SerpApi = require("google-search-results-nodejs");
const search = new SerpApi.GoogleSearch(process.env.SERP_API_KEY);

const promisifiedGetJson = (params) => {
  return new Promise((resolve, reject) => {
    try {
      search.json(params, resolve);
    } catch (e) {
      reject(e);
    }
  });
};

const serpApiAnswerBox = async (query) => {
  try {
    const data = await promisifiedGetJson({
      q: query,
      hl: "en",
      gl: "us",
    });
    return(data["answer_box"] || data["knowledge_graph"]);
  } catch (error) {
    console.error("there was an error:", error);
  }
};

module.exports = { serpApiAnswerBox };
