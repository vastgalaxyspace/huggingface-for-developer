fetch('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=5&filter=text-generation')
  .then(res => res.json())
  .then(models => {
    models.forEach(m => {
      console.log(`Model: ${m.id}`);
      if (m.safetensors) console.log(`Safetensors:`, m.safetensors);
      console.log(`Tags:`, m.tags?.filter(t => t.includes('billion') || t.includes('million') || t.includes('parameter')));
      console.log('---');
    });
  })
  .catch(console.error);
