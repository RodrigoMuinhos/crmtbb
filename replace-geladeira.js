const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  '/src/app/context/AppContext.tsx',
  '/src/app/pages/Estoque.tsx',
  '/src/app/pages/Dashboard.tsx',
  '/src/app/pages/Produtos.tsx'
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Substituir todas as ocorrências de "geladeira" por "vitrine"
  content = content.replace(/geladeira/g, 'vitrine');
  content = content.replace(/Geladeira/g, 'Vitrine');
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Atualizado: ${filePath}`);
});

console.log('✅ Substituição concluída!');
