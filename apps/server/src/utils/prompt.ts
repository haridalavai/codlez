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
  return `

* When creating CSS selectors, ensure they are unique and specific enough to select only one element, even if there are multiple elements of the same type (like multiple h1 elements).
* Avoid using generic tags like 'h1' alone. Instead, combine them with other attributes or structural relationships to form a unique selector.
* Do not assume any selectors provide only selectors in the snapshot. if you do not find any unique selector, you can use the parent element and then use the child element to form a unique selector.
* If the task has content like input text, wait send it as content in the output
* You must also send command present in the task as command in the output
* Command is the action that needs to be performed on the element selected by the css selector. 
* Available commands: CLICK, TYPE, SCROLL, HOVER, CAPTURE, KEYBOARD, WAIT

INPUT STRUCTURE:
1. Current URL: The webpage you're currently on
2. DOM: The DOM structure of the webpage
3. Interactive Elements: List in the format:
   index[:]<element_type>element_text</element_type>
   - index: Numeric identifier for interaction
   - element_type: HTML element type (button, input, etc.)
   - element_text: Visible text or element description
4. Task: The task to be performed on the element

OUTPUT STRUCTURE:
- The output should be only a valid CSS selector that can be used to select the desired element(s) on the page with query selector.
- output should be only in json format. Do not include anything else. json object with the following structure:
    {{
        "xpath": "xpath",
        "content": "optional-content",
        "command": "your-command",
        "element-index": "element-index"
    }}
\`\`\`
----------input----------
current_url: {current_url}
dom: {dom}
interactive_elements: {interactive_elements}
task: {task}
-------------------------
\`\`\`
`;
};
