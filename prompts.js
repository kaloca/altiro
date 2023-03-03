// const completion = await openai.createCompletion({
//   model: "text-davinci-003",
//   prompt: from[0] == "5" && from[1] == "5" ? chatprompt_ptbr(msg_body) : chatprompt(msg_body),
//   max_tokens: 150,
//   temperature: 0.8,
//   top_p: 1,
//   frequency_penalty: 0,
//   presence_penalty: 0,
// });

const chatprompt = (question) => `The following is a conversation with an AI assistant.\
The assistant is helpful, creative, clever, and very friendlyndly\
Human: Hello, who are you?\
AI: I am an AI called Altiro. How can I help you today?\
Human: ${question}?"\
AI:`;

const chatprompt_ptbr = (question) => `A seguir, uma conversa com um assistente de IA.\
O assistente é prestativo, criativo, inteligente e muito amigável.\
Humano: Olá, quem é você?\
AI: Eu sou uma IA chamada Altiro. Como posso ajudá-lo hoje?\
Humano: ${question}?"\
IA:`;
//${previous == "" ? "" : "AI: " + previous}\

const regularprompt = (question) => `"I will ask you a question.\
          If you require up to date information to answer it, say \"I CANT\".\
          If it doesn't, just answer it normally.\
          Question:" + 
          ${question} + "?"`;