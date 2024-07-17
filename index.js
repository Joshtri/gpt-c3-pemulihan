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
    deskripsi: "C3 Pemulihan adalah sebuah gereja yang terletak di pusat kota. Gereja ini dikenal dengan pelayanan pemulihannya dan berkomitmen untuk membantu setiap orang menemukan dan memenuhi panggilan hidup mereka di dalam Kristus.",
    alamat: "Jl. Merdeka No.123, Kupang",
    pendeta: "Pdt. Charles",
    kontak: {
      nomor: "0812-3456-7890",
      email: "info@c3pemulihan.org"
    },
    jadwal: [
      { acara: "Ibadah Sore", hari: "Minggu", waktu: "9:00 AM" },
      { acara: "Ibadah Pagi", hari: "Minggu", waktu: "5:00 PM" },
      { acara: "Doa Puasa", hari: "Sabtu", waktu: "7:00 PM" },
      { acara: "Connect Grup", hari: "Selasa", waktu: "6:30 PM" },
      { acara: "Pelayanan Anak", hari: "Minggu", waktu: "10:00 AM" },
      { acara: "Ibadah Remaja", hari: "Jumat", waktu: "7:00 PM" },
      { acara: "Sekolah Alkitab", hari: "Rabu", waktu: "6:00 PM" }
    ],
    acaraKhusus: [
      { nama: "Retreat Tahunan", tanggal: "2024-08-15", waktu: "8:00 AM", lokasi: "Puncak Bogor" },
      { nama: "Konferensi Pemuda", tanggal: "2024-09-10", waktu: "9:00 AM", lokasi: "Gereja C3 Pemulihan" }
    ]
  }
};

function getChurchInfo(namaGereja) {
  const gereja = churchInfo[namaGereja];
  if (gereja) {
    let response = `${gereja.deskripsi}\n\nAlamat: ${gereja.alamat}\nPendeta: ${gereja.pendeta}\nKontak: Nomor - ${gereja.kontak.nomor}, Email - ${gereja.kontak.email}\n\nJadwal:\n`;
    gereja.jadwal.forEach(acara => {
      response += `${acara.acara} - ${acara.hari} pada ${acara.waktu}\n`;
    });
    response += `\nAcara Khusus:\n`;
    gereja.acaraKhusus.forEach(acara => {
      response += `${acara.nama} - ${acara.tanggal} pada ${acara.waktu}, Lokasi: ${acara.lokasi}\n`;
    });
    return response;
  } else {
    return `Maaf, saya tidak memiliki informasi untuk ${namaGereja}.`;
  }
}

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index', { response: null });
});

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Pesan diperlukan dalam tubuh permintaan' });
  }

  let responseMessage;

  const lowerCasedMessage = userMessage.toLowerCase();
  if (lowerCasedMessage.includes('c3 pemulihan')) {
    responseMessage = getChurchInfo("C3 Pemulihan");
  } else {
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'Anda adalah asisten yang membantu yang memiliki spesialisasi dalam aktivitas gereja.' },
          { role: 'user', content: userMessage }
        ],
        model: 'gpt-3.5-turbo',
      });
      responseMessage = chatCompletion.choices[0].message.content;
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Terjadi kesalahan' });
    }
  }

  res.render('index', { response: responseMessage });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
