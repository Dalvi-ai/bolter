const { Anthropic } = require("@anthropic-ai/sdk");

const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
const anthropic = new Anthropic({
  apiKey: apiKey,
});

const model = anthropic.messages;

const generationConfig = {
  model: "claude-3-sonnet-20240229",
  max_tokens: 8192,
  temperature: 1,
  top_p: 0.95,
};

const CodeGenerationConfig = {
  model: "claude-3-sonnet-20240229",
  max_tokens: 8192,
  temperature: 1,
  top_p: 0.95,
};

export const chatSession = async (messages) => {
  return await model.create({
    ...generationConfig,
    messages: messages,
  });
};

export const GenAiCode = async (messages) => {
  return await model.create({
    ...CodeGenerationConfig,
    messages: messages,
  });
};

    // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // console.log(result.response.text());
 