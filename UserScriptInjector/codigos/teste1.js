// ==UserScript==
// @Destino https://www.google.com/*
// ==/UserScript==

// Exemplo: altera o fundo da página de forma segura (aguarda DOM se necessário)
(function() {
	function apply() {
		if (!document.body) return;
		document.body.style.backgroundColor = 'lightblue';
		console.log('Script injetado com sucesso!');
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', apply, { once: true });
	} else {
		apply();
	}
})();
