#!/usr/bin/env node
// Gera codigos/index.json listando os arquivos .js em codigos/ que contenham
// o bloco de metadados // ==UserScript== ... // ==/UserScript==

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const codigosDir = path.join(repoRoot, 'codigos');
const outFile = path.join(codigosDir, 'index.json');

function isUserScript(content) {
  return /\/\/\s*==UserScript==[\s\S]*?\/\/\s*==\/UserScript==/i.test(content);
}

function main() {
  if (!fs.existsSync(codigosDir)) {
    console.error('Diretório codigos/ não encontrado:', codigosDir);
    process.exit(1);
  }

  const files = fs.readdirSync(codigosDir).filter(f => f.endsWith('.js') && f !== 'index.json');
  const entries = [];

  for (const f of files) {
    try {
      const txt = fs.readFileSync(path.join(codigosDir, f), 'utf8');
      if (isUserScript(txt)) {
        entries.push({ file: f });
      } else {
        // Se não tiver bloco UserScript, ainda assim incluímos? Por padrão NÃO.
        // Caso queira incluir todos .js, remova este continue/condição.
      }
    } catch (e) {
      console.warn('Erro lendo', f, e.message);
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(entries, null, 2) + '\n', 'utf8');
  console.log('Gerado', outFile, 'com', entries.length, 'entradas');
}

if (require.main === module) main();
