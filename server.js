const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/categorize', async (req, res) => {
  try {
    const { transactions, categories } = req.body;
    
    console.log('Received transactions:', transactions);
    console.log('Received categories:', categories);

    // Prepare the prompt for OpenAI
    const prompt = `Categorize the following transactions into ${categories.length > 0 ? 'these categories: ' + categories.join(', ') : 'appropriate categories'}. For any transaction that doesn't fit the specified categories, use "Other - [Category]". Format the response as a JSON object with categories as keys and arrays of transactions as values. Transactions:\n${transactions}`;

    console.log('Sending prompt to OpenAI:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        { role: "system", content: "You are a helpful financial assistant that categorizes financial transactions from a user's bank statement. If the user does not specify categories, use the default, commonly used categories that you are trained on. This includes categories such as Groceries, Rent, Utilities, Transportation, Eating Out, etc. If you don't recognize a transaction, you can also lump it into 'Other - [Category]'. If the user does specify categories, use those categories, and for the ones it doesn't recognize, lump them into 'Other - [Category]'" },
        { role: "user", content: prompt }
      ],
    });

    console.log('Received response from OpenAI:', completion.choices[0].message.content);

    // Remove Markdown formatting if present
    let jsonString = completion.choices[0].message.content.replace(/```json\n|\n```/g, '');

    const categorizedTransactions = JSON.parse(jsonString);
    res.json(categorizedTransactions);
    
    console.log('Sent response');
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.', details: error.message });
  }
});

// Start the server
function startServer(port) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(port);
