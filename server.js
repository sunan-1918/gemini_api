// Import statements
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';


// Load environment variables
dotenv.config();


// Main Variables
const app = express();
const PORT = 8000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// Middleware
app.use(cors());
app.use(express.json());


//Variable


// Functions
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })


// All API
app.get('/', (req, res) => {
    res.send("Gemini Server 2.0! Ask me anything");
});

app.post(
    '/gemini',
    upload.single('file'),
    (req, res, next) => {
        req.body = JSON.parse(req.body.data)
        next()
    },
    async (req, res) => {
        try {

            const filePath = req.file.path;

            function fileToGenerativePart(filePath, mimeType) {
                return {
                    inlineData: {
                        data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
                        mimeType
                    }
                };
            }

            const prompt = req.body.message;

            const result = await model.generateContent([prompt, fileToGenerativePart(filePath, 'image/jpeg')]);
            const response = result.response;
            const text = response.text();

            res.send(text);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting the file:', err);
                } else {
                    console.log('File deleted successfully');
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred during processing.' });
        }
    });



// Listen PORT
app.listen(PORT, () => {
    console.log(`Gemini Server is Running on ${PORT}`);
});
