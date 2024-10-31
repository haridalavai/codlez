export type TaskMessage = {
  task: string;
  snapshot: {
    dom: string;
  };
  options?: StepOptions;
};

export type StepOptions = {
  debug?: boolean;
  model?: string;
  openaiApiKey?: string;
  openaiBaseUrl?: string;
  openaiDefaultQuery?: {};
  openaiDefaultHeaders?: {};
};

/**
 * The prompt itself is very simple because the vast majority of the logic is derived from
 * the instructions contained in the parameter and function descriptions provided to `openai.beta.chat.completions`.
 * @see https://www.npmjs.com/package/openai#automated-function-calls
 * @see https://openai.com/blog/function-calling-and-other-api-updates
 */
export const prompt = () => {
  return `This is your task: {task}

* When creating CSS selectors, ensure they are unique and specific enough to select only one element, even if there are multiple elements of the same type (like multiple h1 elements).
* Avoid using generic tags like 'h1' alone. Instead, combine them with other attributes or structural relationships to form a unique selector.
* If the task has content like input text, send it as content in the output
* You must also send command present in the task as command in the output
* Command is the action that needs to be performed on the element selected by the css selector. 
* Available commands: CLICK, TYPE, SCROLL, HOVER, SELECT, CAPTURE

Webpage snapshot:

\`\`\`
{dom}
\`\`\`

Output format:
- The output should be only a valid CSS selector that can be used to select the desired element(s) on the page with query selector.
- output should be only in json format. Do not include anything else. json object with the following structure:
    {{
        "css_selector": "your-css-selector",
        "content": "optional-content",
        "command": "your-command"
}}
`;
};
