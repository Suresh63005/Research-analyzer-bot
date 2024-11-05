const express = require("express");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const PORT = process.env.PORT || 8081;
const fs = require("fs");

// const upload = multer({ dest: "uploads/" });

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(os.tmpdir(), 'uploads'));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
});



  const {OpenAI} = require("openai");



  const app = express();
  app.use(cors());
  app.use(express.json());

 
  const openai = new OpenAI({
    apiKey: process.env.GPT4_API_KEY,
  });

  app.post("/api/chat", async (req, res) => {
    const { inputChat } = req.body;
    console.log(inputChat)
    try {
      const response =  await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant. You explain software concepts simply to intermediate programmers." },
          { role: "user", content: inputChat },
        ],
      });

      const assistantMessage = response.choices[0].message.content;
      console.log(assistantMessage)
      res.json({ message: assistantMessage });
    } catch (error) {
      console.error("Error with OpenAI API:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  });

  app.post("/api/pdfanalyze", upload.single("file"), async (req, res) => {
    const evaluationPrompt = `
    Please evaluate the provided research paper based on the following IB Biology Internal Assessment criteria. 
    Use a scoring range from 0 to 6, where 6 is the highest standard, as defined below. For each criterion, 
    provide a score and brief feedback addressing any strengths or areas for improvement.

    Evaluation Criteria:

        1. Research Design
        • Research Question Context (Score 0-6): Evaluate the clarity, relevance, and biological focus of the research question, 
        including manipulated and responding variables. Confirm whether the context includes background theory and scientific names, if applicable.
        • Methodological Considerations (Score 0-6): Assess if data collection methods are well-chosen, the scope and quantity of data 
        are sufficient, and any ethical or safety issues are addressed.
        • Description of Methodology (Score 0-6): Evaluate if the methodology is detailed enough for reproducibility, with specific 
        information on variables, tools, and units.

        2. Data Analysis
        • Clear and Precise Communication (Score 0-6): Review clarity and structure of data presentation, including figures, tables, 
        and consistent use of units, decimal places, and significant figures.
        • Consideration of Uncertainty (Score 0-6): Assess whether measurement uncertainties are addressed and visualized effectively, 
        such as through error bars or statistical analysis.
        • Appropriate and Accurate Data Processing (Score 0-6): Determine if data processing aligns with the research question and 
        includes necessary calculations, measures of variation, and significance testing.

        3. Conclusion
        • Conclusion Relevance and Scientific Context (Score 0-6): Examine if the conclusion addresses the research question, 
        is supported by the analysis, and includes relevant scientific context with references to published literature.

        4. Evaluation of Investigation
        • Weaknesses or Limitations (Score 0-6): Review if methodological weaknesses are identified and their impact explained, 
        including any limitations in control variables, sample size, or procedural steps.
        • Improvements (Score 0-6): Assess if suggested improvements are realistic, specific, and directly address identified weaknesses.

    Provide detailed feedback for each criterion along with a final summary that highlights the overall strengths and areas for improvement in the research paper.
    `;
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      const fileBuffer = fs.readFileSync(req.file.path);
      const pdfText = await pdfParse(fileBuffer);
  
      console.log("Extracted Text from PDF:", pdfText.text);
  
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "user", content: `Please analyze the following PDF content by this prompt ${evaluationPrompt} and give average total  ` },
          { role: "user", content: pdfText.text },
        ],
      });

      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
  
      const assistantMessage = response.choices[0].message.content;
      res.json({ message: assistantMessage });
  
      
      
    } catch (error) {
      console.error("Error with PDF analysis:", error);
      res.status(500).json({ error: "An error occurred while processing the PDF" });
    }
  });

  app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.get("/",(req,res)=>{
    res.send("Hello...");
  })
    
  app.listen(PORT, (err) => {
    if (err) {
      console.log(err);
    }
    console.log("Connected to port", PORT);
  });

