import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AgentOrchestrator } from './agent-service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// API Endpoint
app.post('/api/process-transcript', async (req, res) => {
    try {
        const { transcript, history } = req.body;

        if (!API_KEY) {
            return res.status(500).json({ error: 'Server missing API Key' });
        }

        const orchestrator = new AgentOrchestrator(API_KEY);
        const results = await orchestrator.processTranscript(transcript, history || []);

        res.json({ results });
    } catch (error) {
        console.error('Error processing transcript:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Handle React routing, return all requests to React app
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
