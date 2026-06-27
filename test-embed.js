
const r = fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'nvidia/llama-nemotron-embed-vl-1b-v2:free',
    messages: [{role: 'user', content: 'hello'}]
  })
}).then(async res => {
  console.log(res.status, await res.text());
}).catch(console.error);
