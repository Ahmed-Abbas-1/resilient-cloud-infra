const express = require('express');
const redis = require('redis');
const os = require('os');

const app = express();

const client = redis.createClient({ url: 'redis://redis-db:6379' });
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

app.get('/', async (req, res) => {
  let visits = await client.get('visits');
  if (!visits) visits = 0;
  visits++;
  await client.set('visits', visits);
  
  const serviceName = process.env.APP_NAME || 'API-Replica';
  const containerId = os.hostname();
  const displayName = `${serviceName} [${containerId}]`;
  
  const htmlResponse = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; margin: 0;">
      <div style="background: rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 15px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.18);">
        <h1 style="font-size: 2.5rem; margin-bottom: 10px;">🚀 Multi-Tier Cloud Architecture</h1>
        <p style="font-size: 1.2rem; color: #a8c0ff;">Highly Available & Resilient System</p>
        <hr style="border: 1px solid rgba(255,255,255,0.2); margin: 20px 0;">
        <h2 style="font-size: 3rem; margin: 10px 0; color: #00ffcc;">${visits}</h2>
        <p style="font-size: 1rem; text-transform: uppercase; letter-spacing: 2px;">Total Visits (Persisted in Redis)</p>
        <div style="margin-top: 30px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
          <p style="margin: 0; font-family: monospace; font-size: 1.1rem;">Handled by Container: <span style="color: #ff9966; font-weight: bold;">${displayName}</span></p>
        </div>
      </div>
    </div>
  `;
  res.send(htmlResponse);
});

app.listen(3000, () => console.log('API listening on port 3000'));
