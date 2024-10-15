# Project overview
Use this guide to build a web app where users can copy and paste their online bank statement and have it automatically categorized and summarized, using a model from the OpenAI LLM API.


# Feature requirements
- We will use HTML, CSS, and JavaScript for the frontend.
- We will use Express.js for the backend.
- Use the png files in /requirements for the frontend design.
- Create a home page with a form for uploading raw text that is copied and pasted from an online bank statement.
- An example of what the raw text looks like is: `10/07/24	PURCHASE MTA*NYCT PAY NEW YORK NY CARD9608		$2.90
10/07/24	PURCHASE MTA*NYCT PAY NEW YORK NY CARD9608		$2.90
10/07/24	PURCHASE DESMOND HOTE 6102969800 PA CARD9608		$386.28
10/07/24	PURCHASE CHICK-FIL-A MALVERN PA CARD9608		$2.11
10/07/24	PURCHASE CHICK-FIL-A MALVERN PA CARD9608		$21.55
10/07/24	PURCHASE CHICKIES & P MALVERN PA CARD9608		$33.75`
- Create a form under the text area that allows the user to specify ahead of time the categories they'd like to use for the expenses. This should be an optional field.
- If the user does not specify categories, use the default, commonly used categories that the LLM is trained on.
- If the user does specify categories, use those categories, and for the ones it doesn't recognize, lump them into "Other - 'Category name'".
- Have a button to submit the form.
- Have a button to clear the form.
- Have a nice loading circle animation when the form is submitted and the results are generating.
- Use the OpenAI LLM API to write a prompt that categorizes the transactions.
- Display a summary of the transactions (e.g. total spent) 
- Display a summary of the categories and how much was spent in each.
- Display a pie chart of the categories and how much was spent in each.
- When hovering over a pie chart slice, display the transactions that were used to calculate the value of that slice.
- Display all the categorized transactions in a table.


# Relevant docs

## How to use the OpenAI LLM API
The OpenAI API provides a simple interface to state-of-the-art AI models for natural language processing, image generation, semantic search, and speech recognition. Follow this guide to learn how to generate human-like responses to natural language prompts, create vector embeddings for semantic search, and generate images from textual descriptions.

Create and export an API key
Create an API key in the dashboard here, which you’ll use to securely access the API. Store the key in a safe location, like a .zshrc file or another text file on your computer. Once you’ve generated an API key, export it as an environment variable in your terminal.

Export an envrionment variable on *nix systems
export OPENAI_API_KEY="your_api_key_here"
Make your first API request
With your OpenAI API key exported as an environment variable, you're ready to make your first API request. You can either use the REST API directly with the HTTP client of your choice, or use one of our official SDKs as shown below.

To use the OpenAI API in server-side JavaScript environments like Node.js, Deno, or Bun, you can use the official OpenAI SDK for TypeScript and JavaScript. Get started by installing the SDK using npm or your preferred package manager:

Install the OpenAI SDK with npm
npm install openai
With the OpenAI SDK installed, create a file called example.mjs and copy one of the following examples into it:

Create a human-like response to a prompt
import OpenAI from "openai";
const openai = new OpenAI();

const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
            role: "user",
            content: "Write a haiku about recursion in programming.",
        },
    ],
});

console.log(completion.choices[0].message);
Execute the code with node example.mjs (or the equivalent command for Deno or Bun). In a few moments, you should see the output of your API request!



# Current file structure

PYCELLE-2
├── node_modules
├── public
│   ├── index.html
│   ├── style.css
│   └── script.js
├── requirements
├── .env
├── .gitignore
├── package-lock.json
├── package.json
└── server.js

# Rules
