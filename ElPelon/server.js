const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_IMAGE_API_URL = 'https://api.openai.com/v1/images/generations';
const OPENAI_API_KEY = process.env.CHATGPT_API_KEY;

// Configure multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/process-order', async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant for a restaurant named El Pelon. Your task is to understand customer orders and provide a structured response with order details." },
                { role: "user", content: userMessage }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const botResponse = response.data.choices[0].message.content;
        res.json({ response: botResponse });
    } catch (error) {
        console.error('Error processing order:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while processing the order.' });
    }
});

app.post('/process-images', upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded.' });
        }

        const imageAnalyses = await Promise.all(req.files.map(async (file) => {
            const base64Image = fs.readFileSync(file.path, { encoding: 'base64' });
            const response = await axios.post(OPENAI_IMAGE_API_URL, {
                prompt: "Analyze this image of a restaurant receipt. List each item, its price, and calculate the total amount. Format the response as a JSON object with 'items' as an array of objects (each with 'name' and 'price' properties) and a 'total' property for the sum.",
                image: `data:image/jpeg;base64,${base64Image}`
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            // Clean up the uploaded file
            fs.unlinkSync(file.path);

            return response.data.data[0].text;
        }));

        // Combine results from all images
        const combinedAnalysis = imageAnalyses.map(JSON.parse);
        const allItems = combinedAnalysis.flatMap(analysis => analysis.items);
        const totalAmount = allItems.reduce((sum, item) => sum + item.price, 0);

        const summary = {
            items: allItems,
            total: totalAmount
        };

        res.json(summary);
    } catch (error) {
        console.error('Error processing images:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while processing the images.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
});

// Log environment variables (be careful not to log sensitive information)
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('OPENAI_API_KEY is set:', !!OPENAI_API_KEY);