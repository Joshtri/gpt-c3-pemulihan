import express from 'express';
import { config } from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const churchInfo = {
  "C3 Pemulihan": {
    description: "C3 Pemulihan adalah sebuah gereja yang terletak di pusat kota. Gereja ini dikenal dengan pelayanan pemulihannya dan berkomitmen untuk membantu setiap orang menemukan dan memenuhi panggilan hidup mereka di dalam Kristus.",
    address: "Jl. Merdeka No.123, Kupang",
    pastor: "Pdt. John Doe",
    contact: {
      phone: "0812-3456-7890",
      email: "info@c3pemulihan.org"
    },
    schedule: [
      { event: "Ibadah Sore", day: "Minggu", time: "9:00 AM" },
      { event: "Ibadah Pagi", day: "Minggu", time: "5:00 PM" },
      { event: "Doa Puasa", day: "Sabtu", time: "7:00 PM" },
      { event: "Connect Grup", day: "Selasa", time: "6:30 PM" },
      { event: "Pelayanan Anak", day: "Minggu", time: "10:00 AM" },
      { event: "Ibadah Remaja", day: "Jumat", time: "7:00 PM" },
      { event: "Sekolah Alkitab", day: "Rabu", time: "6:00 PM" }
    ],
    events: [
      { name: "Retreat Tahunan", date: "2024-08-15", time: "8:00 AM", location: "Puncak Bogor" },
      { name: "Konferensi Pemuda", date: "2024-09-10", time: "9:00 AM", location: "Gereja C3 Pemulihan" }
    ]
  }
};


function getChurchInfo(churchName) {
  const church = churchInfo[churchName];
  if (church) {
    let response = `${church.description}\n\nAddress: ${church.address}\nPastor: ${church.pastor}\nContact: Phone - ${church.contact.phone}, Email - ${church.contact.email}\n\nSchedule:\n`;
    church.schedule.forEach(event => {
      response += `${event.event} - ${event.day} at ${event.time}\n`;
    });
    response += `\nUpcoming Events:\n`;
    church.events.forEach(event => {
      response += `${event.name} - ${event.date} at ${event.time}, Location: ${event.location}\n`;
    });
    return response;
  } else {
    return `Sorry, I don't have information for ${churchName}.`;
  }
}


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index', { response: null });
});

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required in the request body' });
  }

  let responseMessage;

  const churchMatch = userMessage.match(/what is (.*) church/i);
  if (churchMatch) {
    const churchName = churchMatch[1].trim();
    responseMessage = getChurchInfo(churchName);
  } else {
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant specialized in church activities.' },
          { role: 'user', content: userMessage }
        ],
        model: 'gpt-3.5-turbo',
      });
      responseMessage = chatCompletion.choices[0].message.content;
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  res.render('index', { response: responseMessage });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
