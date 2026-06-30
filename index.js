const express = require("express");
const twilio = require("twilio");

const app = express();
app.use(express.urlencoded({ extended: false }));

app.post("/whatsapp", (req, res) => {
  const incomingMsg = (req.body.Body || "").trim().toLowerCase();

  console.log("Incoming WhatsApp:", incomingMsg);

  const twiml = new twilio.twiml.MessagingResponse();

  if (incomingMsg.startsWith("calc ")) {
    try {
      const expression = incomingMsg.replace("calc ", "");
      const result = Function(`"use strict"; return (${expression})`)();
      twiml.message(`Answer: ${result}`);
    } catch (err) {
      twiml.message("Sorry, I couldn't calculate that.");
    }
} else if (incomingMsg === "time") {
  const now = new Date();

  const time = now.toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  twiml.message(`Johannesburg time is: ${time}`);

} else {
  twiml.message(
`Available commands:
calc 10 + 25
time`
  );
}

  res.type("text/xml").send(twiml.toString());
});

app.get("/", (req, res) => {
  res.send("Automyze bot is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Automyze bot running on http://localhost:${PORT}`);
});