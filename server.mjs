import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("."));

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

app.post("/api/packing", async (req, res) => {
  try {
    const trip = req.body || {};

    const prompt = `
Ты — помощник по подготовке к путешествию.

Данные поездки:
Откуда: ${trip.from || "не указано"}
Куда: ${trip.to || "не указано"}
Дней: ${trip.days || "не указано"}
Взрослых: ${trip.adults ?? "не указано"}
Детей: ${trip.children ?? "не указано"}

Составь персональный список вещей с учётом направления,
длительности и количества путешественников.

Верни ровно три категории:
1. Обязательно
2. Желательно
3. Было бы прикольно

В категории "Обязательно" выдели подраздел "Одежда".
Если детей нет, не добавляй детские вещи.
Не используй одинаковый список для всех поездок.

Верни результат на русском языке в JSON.
`;

    const response = await client.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content: "Ты практичный помощник по планированию путешествий. Отвечай на русском языке."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4
    });

    const result = response.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error("OpenRouter вернул пустой ответ");
    }

    res.json({ result });

  } catch (error) {
    console.error("OpenRouter error:", error.message);

    res.status(500).json({
      error: "Не удалось получить список от ИИ. Проверь настройки OpenRouter."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`TravelMate AI running on port ${port}`);
});