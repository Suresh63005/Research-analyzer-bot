const express = require("express");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { OpenAI } = require("openai");

const PORT = process.env.PORT || 8081;

// Use memory storage for uploaded files
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.GPT4_API_KEY,
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
    const { inputChat } = req.body;
    console.log(inputChat);
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant. You explain software concepts simply to intermediate programmers." },
                { role: "user", content: inputChat },
            ],
        });

        const assistantMessage = response.choices[0].message.content;
        console.log(assistantMessage);
        res.json({ message: assistantMessage });
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});

// PDF analysis endpoint
app.post("/api/pdfanalyze", upload.single("file"), async (req, res) => {
    const evaluationPrompt = `
    Please evaluate the provided research paper based on the following IB Biology Internal Assessment criteria. 
    Use a scoring range from 0 to 6, where 6 is the highest standard, as defined below. For each criterion, 
    provide a score and brief feedback addressing any strengths or areas for improvement.

    Evaluation Criteria:
    1. Research Design
    • Research Question Context (Score 0-6): Evaluate the clarity, relevance, and biological focus of the research question. 
    • Methodological Considerations (Score 0-6): Assess if data collection methods are well-chosen and sufficient.
    • Description of Methodology (Score 0-6): Evaluate if the methodology is detailed enough for reproducibility.

    2. Data Analysis
    • Clear and Precise Communication (Score 0-6): Review clarity and structure of data presentation.
    • Consideration of Uncertainty (Score 0-6): Assess whether measurement uncertainties are addressed.
    • Appropriate and Accurate Data Processing (Score 0-6): Determine if data processing aligns with the research question.

    3. Conclusion
    • Conclusion Relevance and Scientific Context (Score 0-6): Examine if the conclusion addresses the research question.

    4. Evaluation of Investigation
    • Weaknesses or Limitations (Score 0-6): Review if methodological weaknesses are identified.
    • Improvements (Score 0-6): Assess if suggested improvements are realistic and specific.

    Provide detailed feedback for each criterion along with a final summary that highlights the overall strengths and areas for improvement in the research paper.
    `;

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Use req.file.buffer directly to parse the PDF
        const pdfText = await pdfParse(req.file.buffer);

        console.log("Extracted Text from PDF:", pdfText.text);

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "user", content: `Please analyze the following PDF content by this prompt ${evaluationPrompt}` },
                { role: "user", content: pdfText.text },
            ],
        });

        const assistantMessage = response.choices[0].message.content;
        res.json({ message: assistantMessage });

    } catch (error) {
        console.error("Error with PDF analysis:", error);
        res.status(500).json({ error: "An error occurred while processing the PDF" });
    }
});

// Health check route
app.get("/", (req, res) => {
    res.send("Hello...");
});

// Start the server
app.listen(PORT, (err) => {
    if (err) {
        console.error(err);
    }
    console.log("Connected to port", PORT);
});
