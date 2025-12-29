const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // For listing models, we don't need to get a model instance first.
        // But the SDK exposes it via the GoogleGenerativeAI instance?
        // Actually, looking at docs, it might not be directly exposed in the main helper class in newer versions easily without digging.
        // Let's try to just hit a model and print error detailedly or try a different one.
        // Wait, let's try 'gemini-1.0-pro' or just 'gemini-pro' again but with logging.

        // The previous error was 404 for gemini-pro on v1beta.
        // Maybe the user's API key has access to different models?

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log(result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);
    }

    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result2 = await model2.generateContent("Hello");
        console.log(result2.response.text());
    } catch (error) {
        console.error("Error with gemini-pro:", error.message);
    }
}

listModels();
