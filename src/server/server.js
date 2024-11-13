const WebSocket = require("ws");
const ollama = require("ollama");
const server = new WebSocket.Server({ port: 8080 });

server.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "interim") {
      console.log("Interim transcript:", data.transcript);
      // Handle interim transcript (e.g., display it live, log it)
    } else if (data.type === "final") {
      console.log("Final transcript:", data.transcript);
      // Handle final transcript (e.g., send it to an LLM)
      getOllama(data.transcript).then((response) => {
        console.log("LLM response:", response);
        // Send the LLM response back to the client (if needed)
      });
    }
  });

  async function getOllama(text) {
    const response = await ollama.chat({
      model: "llama3.2",
      messages: [{ role: "user", content: text }],
    });
    return response.messages[0].content;
  }

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
