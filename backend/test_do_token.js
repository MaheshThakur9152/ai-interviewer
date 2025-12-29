require('dotenv').config();

async function testDOToken() {
    const token = process.env.OLLAMA_API_KEY;
    console.log("Testing DigitalOcean token:", token ? token.substring(0, 20) + "..." : "NOT FOUND");

    try {
        const response = await fetch('https://inference.do-ai.run/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model: 'llama3-8b-instruct',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 50
            })
        });

        console.log("Status:", response.status, response.statusText);
        const text = await response.text();
        console.log("Response:", text);

        if (response.ok) {
            const data = JSON.parse(text);
            console.log("\n✅ SUCCESS! AI Response:", data.choices[0].message.content);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testDOToken();
