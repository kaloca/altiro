With the explosive growth of ChatGPT worldwide, I was waiting excited to see what the creative people of Latin America would do with it.

Surprisingly, it appeared that the vast majority of them had never even heard of GPT or OpenAI.

I thought for a while. As a Brazilian, I know how much we love Whatsapp. And how every single one of us, no matter how young or old, poor or rich, has the app downloaded on their smartphones.

It was obvious then, that putting GPT on Whatsapp was the best way to spread it across Brazil and the rest of Latin America. That's why I developed Altiro, simple and free tool in Spanish and Portuguese. To use it, just open https://altiro.chat and click on the "Whatsapp" button, you don't need any kind of registration!

# Code
The Altiro tech stack is really simple. I have a Node.js server connected to the new Meta Cloud API for Whatsapp, (which, by the way, is free of charge for user-initiated messages). When it receives a message, the Express API puts it through a GPT pipeline that:

Asks the original question
With the question and the answer, another GPT prompt decides if the answer was appropritate, or if a Google search is needed to complement it
If a Google search is needed, another GPT prompt generates the proper search query
The search query is executed through Google's API
A GPT-3 agent decodes the API response and produces a new answer
This allows for the regular, chat-like conversations with GPT, but also for questions such as "What's Tesla stock at right now?"or "who won yesterday's NFL match" possible.

# Reach
With barely any marketing, Altiro has already acquired 10,000 users. It is a hard platform to monetize, but it shows there is a demand for less tech-savvy Latin Americans to have the power of GPT in their hands with the least possible amount of effort.
