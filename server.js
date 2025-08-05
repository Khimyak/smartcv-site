
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post("/generate", async (req, res) => {
    try {
        const { name, profession, cvType, details } = req.body;
        const prompt = `Create a ${cvType} resume for ${name}, profession: ${profession}. Details: ${details}. Make it professional and well-formatted.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500
            })
        });

        const data = await response.json();
        const resumeText = data.choices[0].message.content;
        res.json({ resume: resumeText });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error generating resume" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
