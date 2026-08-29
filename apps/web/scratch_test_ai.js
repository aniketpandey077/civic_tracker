const fs = require('fs');
const https = require('https');

async function testApi(category, filename) {
  const url = `https://civicpulse-ai-95na.onrender.com/analyze?issue_type=${category}`;
  
  // Download sample image
  const imgRes = await fetch('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80');
  const buffer = await imgRes.arrayBuffer();
  
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', blob, 'sample.jpg');

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  console.log(`--- CATEGORY: ${category} ---`);
  console.log(JSON.stringify(json, null, 2));
}

async function main() {
  await testApi('pothole');
  await testApi('garbage');
  await testApi('fallen_tree');
}

main().catch(console.error);
