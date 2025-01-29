import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { prompt as getPrompt } from './prompt';

interface LocatorOutput {
  xpath: string;
  content?: string;
  command: string;
  element_index: number;
}

const getLocator = async (
  snapshot: any,
  action: string,
  interactiveElements: any,
  url: string,
) => {
  const model = new ChatOpenAI({ model: 'o1-mini' });

  const prompt = ChatPromptTemplate.fromTemplate(getPrompt());

  const parser = new JsonOutputParser<LocatorOutput>();

  const partialedPrompt = await prompt.partial({
    task: action,
  });

  const chain = partialedPrompt.pipe(model).pipe(parser);

  const res = await chain.invoke({
    dom: snapshot,
    interactive_elements: interactiveElements,
    current_url: url,
    task: action,
  });
  console.log(res);
  return res;
};

export { getLocator };
