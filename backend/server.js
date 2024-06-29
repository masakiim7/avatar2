const express = require('express');
const cors = require('cors');
const axios = require('axios');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// AWS設定
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const polly = new AWS.Polly();
const s3 = new AWS.S3();

app.post('/api/chat', async (req, res) => {
  console.log('Received request:', req.body);
  try {
    // OpenAI APIを呼び出し
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: req.body.message }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const aiResponse = openaiResponse.data.choices[0].message.content;

    // Pollyを使用して音声合成
    const pollyParams = {
      Text: aiResponse,
      OutputFormat: 'mp3',
      VoiceId: 'Mizuki'  // 日本語音声
    };
    const pollyResult = await polly.synthesizeSpeech(pollyParams).promise();

    // S3にアップロード
    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `audio-${Date.now()}.mp3`,
      Body: pollyResult.AudioStream,
      ContentType: 'audio/mpeg'
    };
    const s3Result = await s3.upload(s3Params).promise();

    // 音声ファイルのURLを返す
    console.log('Sending response:', { audioUrl: s3Result.Location, text: aiResponse });
    res.json({ audioUrl: s3Result.Location, text: aiResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
