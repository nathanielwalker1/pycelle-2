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

// Add this helper function at the top of server.js
function sanitizeTransactions(transactions) {
    return transactions
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/\t+/g, ' '))  // Replace tabs with spaces
        .map(line => line.replace(/\s+/g, ' '))  // Normalize spaces
        .map(line => line.replace(/[^\x20-\x7E]/g, ''))  // Remove non-printable characters
        .join('\n');
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/categorize', async (req, res) => {
    try {
        const { transactions, categories } = req.body;
        const sanitizedTransactions = sanitizeTransactions(transactions);
        
        // Create the prompt with sanitized data
        const prompt = categories && categories.length > 0
            ? `Please categorize these transactions into the following categories: ${categories.join(', ')}.\n\nTransactions:\n${sanitizedTransactions}`
            : `Please categorize these transactions into appropriate spending categories.\n\nTransactions:\n${sanitizedTransactions}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a financial transaction categorizer. Analyze the transactions and return a JSON object where keys are categories and values are arrays of transactions. Format the response as a clean JSON object without any markdown or additional text. Example format: {"Category1": ["transaction1", "transaction2"], "Category2": ["transaction3"]}`
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        // Log the raw response for debugging
        console.log('Raw OpenAI response:', completion.choices[0].message.content);

        try {
            const jsonString = completion.choices[0].message.content
                .trim()
                .replace(/[\n\r]/g, '')
                .replace(/\s+/g, ' ');

            const categorizedTransactions = JSON.parse(jsonString);
            res.json(categorizedTransactions);
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            res.status(500).json({
                error: 'Failed to parse the AI response',
                details: parseError.message,
                rawResponse: completion.choices[0].message.content
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'An error occurred while processing your request.',
            details: error.message
        });
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
