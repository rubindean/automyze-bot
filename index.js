require("dotenv").config();

const express = require("express");
const twilio = require("twilio");
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(express.urlencoded({ extended: false }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = (req.body.Body || "").trim();
  const lowerMsg = incomingMsg.toLowerCase();

  console.log("Incoming WhatsApp:", incomingMsg);

  const twiml = new twilio.twiml.MessagingResponse();

  try {
    if (lowerMsg.startsWith("calc ")) {
      const expression = incomingMsg.replace(/^calc\s+/i, "");
      const result = Function(`"use strict"; return (${expression})`)();
      twiml.message(`Answer: ${result}`);

    } else if (lowerMsg === "time") {
      const now = new Date();

      const time = now.toLocaleString("en-ZA", {
        timeZone: "Africa/Johannesburg",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      twiml.message(`Johannesburg time is: ${time}`);

    } else {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: incomingMsg,
        config: {
          systemInstruction:
            "You are Automyze, Dean's helpful WhatsApp assistant. Keep replies short, practical, and WhatsApp-friendly.",
        },
      });

      twiml.message(response.text || "Sorry, I could not generate a reply.");
    }

  } catch (err) {
    console.error("Bot error:", err);
    twiml.message("Sorry, something went wrong.");
  }

  res.type("text/xml").send(twiml.toString());
});

app.get("/", (req, res) => {
  res.send("Automyze bot is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Automyze bot running on port ${PORT}`);
});