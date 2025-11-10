// content.js
// Busca o próprio arquivo em `codigos/` e usa o metadado @Destino dentro do
// arquivo para decidir se deve injetá-lo na página. Não usa mais chrome.storage.

(async function() {
  // Busca codigos/index.json que lista os arquivos e seus padrões destino.
  const indexPath = 'codigos/index.json';
  try {
    const res = await fetch(chrome.runtime.getURL(indexPath));
    if (!res.ok) return;
    const list = await res.json();
    if (!Array.isArray(list)) return;

    const escapeRegex = s => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

    // Suporta padrões mais ricos:
    // - regex: prefixo 're:' seguido de uma regex JS
    // - match/glob: ex. 'https://*.google.com/*' (curinga '*' em host/path)
    // - opcional prefixo 'match:' para compatibilidade
    function matchesPattern(url, pattern) {
      if (!pattern) return false;
      // regex prefix
      if (pattern.startsWith('re:')) {
        try {
          const re = new RegExp(pattern.slice(3));
          return re.test(url);
        } catch (e) {
          console.error('Invalid regex pattern', pattern, e);
          return false;
        }
      }
      // strip match: prefix
      if (pattern.startsWith('match:')) pattern = pattern.slice(6);

      // split scheme and rest
      let scheme = '*';
      let rest = pattern;
      const schemeIndex = pattern.indexOf('://');
      if (schemeIndex !== -1) {
        scheme = pattern.slice(0, schemeIndex);
        rest = pattern.slice(schemeIndex + 3);
      }

      // host and path
      let host = rest;
      let path = '/';
      const slashIndex = rest.indexOf('/');
      if (slashIndex !== -1) {
        host = rest.slice(0, slashIndex);
        path = rest.slice(slashIndex) || '/';
      }

      // build host regex
      let hostRegex;
      if (!host || host === '*') {
        hostRegex = '[^/]+?';
      } else {
        // handle leading '*.' (subdomains)
        if (host.startsWith('*.')) {
          const tail = host.slice(2);
          hostRegex = '(?:[^/]+\\.)*' + escapeRegex(tail).replace(/\\\*/g, '[^/]*');
        } else {
          // replace '*' with '[^/]*' and escape other regex chars
          hostRegex = host.split('*').map(escapeRegex).join('[^/]*');
        }
      }

      // build path regex (allow query/fragment after path)
      let pathRegex;
      if (!path || path === '/') {
        pathRegex = '(?:/.*)?';
      } else {
        pathRegex = path.split('*').map(escapeRegex).join('.*');
        // allow querystring/fragment
        if (!pathRegex.endsWith('.*')) pathRegex = pathRegex + '(?:[?#].*)?';
      }

      // scheme handling
      let schemeRegex;
      if (!scheme || scheme === '*') {
        schemeRegex = 'https?';
      } else {
        schemeRegex = escapeRegex(scheme);
      }

      const fullRegex = new RegExp('^' + schemeRegex + '://' + hostRegex + pathRegex + '$');
      try {
        return fullRegex.test(url);
      } catch (e) {
        console.error('pattern->regex error', pattern, e);
        return false;
      }
    }

    // Para cada arquivo listado no index, buscamos o próprio arquivo e extraímos
    // o metadado @Destino do seu header. Assim o arquivo decide onde será injetado.
    for (const entry of list) {
      if (!entry || !entry.file) continue;
      try {
        const filePath = 'codigos/' + entry.file;
        const fileRes = await fetch(chrome.runtime.getURL(filePath));
        if (!fileRes.ok) {
          console.warn('Could not fetch', filePath);
          continue;
        }
        const fileText = await fileRes.text();

        // Extrai bloco de metadados // ==UserScript== ... // ==/UserScript==
        const headerMatch = fileText.match(/\/\/\s*==UserScript==([\s\S]*?)\/\/\s*==\/UserScript==/i);
        if (!headerMatch) continue;
        const header = headerMatch[1];
        const lines = header.split(/\r?\n/).map(l => l.replace(/^\s*\/\/\s?/, '').trim()).filter(Boolean);

        // Procura por linhas com @Destino ou Destino (case-insensitive)
        const destinos = [];
        for (const l of lines) {
          const m = l.match(/^(?:@?Destino)\b\s*(.*)/i);
          if (m && m[1]) {
            // suporte múltiplos destinos separados por ,
            const parts = m[1].split(',').map(p => p.trim()).filter(Boolean);
            destinos.push(...parts);
          }
        }
        if (destinos.length === 0) continue;

        for (const destino of destinos) {
          try {
            if (matchesPattern(location.href, destino)) {
              const s = document.createElement('script');
              s.src = chrome.runtime.getURL(filePath);
              s.onload = () => s.remove();
              (document.head || document.documentElement).appendChild(s);
              break; // injetou este arquivo, passa para o próximo
            }
          } catch (innerErr) {
            console.error('content.js pattern match error for', entry, innerErr);
          }
        }
      } catch (errEntry) {
        console.error('content.js error processing entry', entry, errEntry);
      }
    }
  } catch (err) {
    console.error('content.js fetch index error:', err);
  }
})();
