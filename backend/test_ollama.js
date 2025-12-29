
async function testOllama() {
    const OLLAMA_BASE_URL = 'https://inference.do-ai.run/v1';
    const OLLAMA_MODEL = 'llama3-8b-instruct';

    console.log(`Testing connection to ${OLLAMA_BASE_URL}...`);

    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: "Hello, are you working?" }
                ],
                temperature: 0.7
            })
        });

        console.log("Status:", response.status);
        if (!response.ok) {
            console.error("Error Text:", await response.text());
            return;
        }

        const data = await response.json();
        console.log("Response Data:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}

testOllama();
