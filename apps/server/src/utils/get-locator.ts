import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { prompt as getPrompt } from './prompt';

interface LocatorOutput {
  css_selector: string;
  content?: string;
  command: string;
}

const getLocator = async (snapshot: string, action: string) => {
  const model = new ChatOpenAI({ model: 'gpt-4o' });

  const prompt = ChatPromptTemplate.fromTemplate(getPrompt());

  const parser = new JsonOutputParser<LocatorOutput>();

  const partialedPrompt = await prompt.partial({
    task: action,
  });

  const chain = partialedPrompt.pipe(model).pipe(parser);

  const res = await chain.invoke({ dom: snapshot });
  console.log(res);
  return res;
};

export { getLocator };
