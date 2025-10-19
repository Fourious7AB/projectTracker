// Prints your public IP address for Atlas whitelisting
const https = require('https');
https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const ip = JSON.parse(data).ip;
      console.log(`Your public IP for Atlas whitelisting: ${ip}`);
      console.log('Go to MongoDB Atlas > Network Access > IP Whitelist and add this IP.');
    } catch (e) {
      console.error('Could not parse IP:', e);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching public IP:', err);
});
