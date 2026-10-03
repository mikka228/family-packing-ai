import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("."));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/packing", async (req, res) => {
  try {
    const trip = req.body;

    const prompt = `
Ты — помощник по подготовке семьи к путешествию.

Проанализируй поездку:
Откуда: ${trip.from}
Куда: ${trip.to}
Дней: ${trip.days}
Взрослых: ${trip.adults}
Детей: ${trip.children}

Составь персональный список вещей.

Верни РОВНО три категории:
1. Обязательно
2. Желательно
3. Было бы прикольно

Внутри "Обязательно" обязательно сделай отдельный подраздел:
"Одежда"

Одежда должна соответствовать направлению и длительности поездки.

Если детей нет — не добавляй детские вещи.

Не используй заранее заготовленный список без анализа поездки.
Учитывай количество людей, длительность и направление.

Верни результат только в JSON.
`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: prompt
    });

    res.json({
      result: response.output_text
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Не удалось получить список от ИИ"
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Family Packing AI running on port ${port}`);
});