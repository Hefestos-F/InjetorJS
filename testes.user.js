// ==UserScript==
// @name         Nice_test
// @namespace    https://github.com/Hefestos-F/cc-result-monk
// @version      1
// @description  that's all folks!
// @author       almaviva.fpsilva
// @match        https://cxagent.nicecxone.com/home*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/Hefestos-F/cc-result-monk/main/testes.user.js
// @downloadURL  https://raw.githubusercontent.com/Hefestos-F/cc-result-monk/main/testes.user.js
// @grant        GM_openInTab
// @run-at       document-idle

// ==/UserScript==

(function () {
  "use strict";

  var nome = "";
  var entrada1 = "";
  var entrada2 = "";
  var entrada3 = "";
  var Cardhold = "";
  var Assinatura = "";
  var notas = "";

  SalvarVari(0);

  criarNovoItem();

  function SalvarVari(x) {
    const DS = JSON.parse(localStorage.getItem("DadosSalvosRegis"));

    const DadosAtuais = {
      nome: nome,
      entrada1: entrada1,
      entrada2: entrada2,
      entrada3: entrada3,
      Cardhold: Cardhold,
      Assinatura: Assinatura,
      notas: notas,
    };

    if (x || !DS) {
      localStorage.setItem("DadosSalvosRegis", JSON.stringify(DadosAtuais));
    } else {
      nome = DS.nome;
      entrada1 = DS.entrada1;
      entrada2 = DS.entrada2;
      entrada3 = DS.entrada3;
      Cardhold = DS.Cardhold;
      Assinatura = DS.Assinatura;
      notas = DS.notas;
    }
  }

  function adicionarEventos(innerDiv, additionalContent) {
    innerDiv.addEventListener("click", function () {
      if (additionalContent.style.display === "none") {
        additionalContent.style.display = "flex";
      } else {
        additionalContent.style.display = "none";
      }
    });
  }

  function criarNovoItem() {
    var novoItem = document.createElement("div");
    novoItem.id = "novoItem";
    novoItem.className = "StyledNavListItem-sc-18cj2v7-0 bbgdDD";
    novoItem.style.width = "auto";
    novoItem.style.height = "40px";
    novoItem.style.background = "rgba(195, 0, 0, 0)";
    novoItem.style.display = "flex";
    novoItem.style.justifyContent = "center";
    novoItem.style.alignItems = "center";

    var innerDiv = criarInnerDiv();
    novoItem.appendChild(innerDiv);

    var additionalContent = criarAdditionalContent();
    novoItem.appendChild(additionalContent);

    adicionarEventos(innerDiv, additionalContent);

    var xpath = "/html/body/div[1]/div[5]/div[3]/div/div/nav/ul[1]";
    var tempoInicio = Date.now();
    var tempoLimite = 10000; // 10 segundos

    var intervalo = setInterval(function () {
      var resultado = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      var alvo = resultado.singleNodeValue;
      if (alvo) {
        alvo.appendChild(novoItem);
        console.log("Seletor encontrado.");
        clearInterval(intervalo);
      } else if (Date.now() - tempoInicio > tempoLimite) {
        console.log("Tempo limite atingido. Seletor não encontrado.");
        clearInterval(intervalo);
      } else {
        console.log("Tentando novamente...");
      }
    }, 500); // Tenta a cada 500 milissegundos

    document.addEventListener("click", function (event) {
      if (
        !novoItem.contains(event.target) &&
        !innerDiv.contains(event.target)
      ) {
        additionalContent.style.display = "none";
      }
      encontrarTk();
    });
  }

  function criarInnerDiv() {
    var innerDiv = document.createElement("div");
    innerDiv.id = "innerDiv";
    innerDiv.style.color = "rgb(111, 49, 14)";
    innerDiv.style.display = "flex";
    innerDiv.style.alignItems = "center";
    innerDiv.style.borderRadius = "50%";
    innerDiv.style.justifyContent = "center";
    innerDiv.style.fontSize = "25px";
    innerDiv.style.cursor = "pointer";
    innerDiv.innerHTML = "⚜";
    return innerDiv;
  }

  function criarAdditionalContent() {
    var additionalContent = document.createElement("div");
    additionalContent.id = "additionalContent";
    additionalContent.style.position = "absolute";
    additionalContent.style.left = "110%";
    additionalContent.style.top = "14%";
    additionalContent.style.display = "none";
    additionalContent.style.alignItems = "center";
    additionalContent.style.flexDirection = "column";

    var contentBox = criarContentBox();
    additionalContent.appendChild(contentBox);

    var contentBox2 = criarContentBox2();
    additionalContent.appendChild(contentBox2);

    return additionalContent;
  }

  function CriarLinha(x) {
    var a = document.createElement("div");
    a.id = `CReglinha${x}`;
    a.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        justify-content: center;
       `;
    return a;
  }

  function criarContentBox() {
    var contentBox = document.createElement("div");
    contentBox.id = "contentBox";
    contentBox.style.cssText = `
        display: flex;
        background-color: rgb(255, 236, 209);
        border: 3px solid rgb(255, 112, 32);
        border-radius: 15px;
        padding: 8px;
        flex-direction: column;
        `;

    const linha1 = CriarLinha(1);
    const linha1T1 = document.createElement("p");
    linha1T1.textContent = "O(A) ";

    const linha1in = CriarInput(0);
    linha1in.id = "input1";
    linha1in.value = nome;
    linha1in.addEventListener("input", () => {
      nome = linha1in.value;
      SalvarVari(1);
    });

    const linha1T2 = document.createElement("p");
    linha1T2.textContent = " entrou em contato solicitando:";

    linha1.appendChild(linha1T1);
    linha1.appendChild(linha1in);
    linha1.appendChild(linha1T2);

    contentBox.appendChild(linha1);

    const linha2 = CriarLinha(2);

    const linha2in = CriarInput(1, "Solicitação");
    linha2in.value = entrada1;

    linha2in.addEventListener("input", () => {
      linha2in.style.height = "auto"; // Reset height
      linha2in.style.height = linha2in.scrollHeight + "px"; // Set new height
      entrada1 = linha2in.value;
      SalvarVari(1);
    });

    linha2.appendChild(linha2in);

    contentBox.appendChild(linha2);

    const linha3 = CriarLinha(3);

    const linha3T1 = document.createElement("p");
    linha3T1.textContent =
      "Foi realizada a verificação no sistema e constatado que:";

    linha3.appendChild(linha3T1);
    contentBox.appendChild(linha3);

    const linha4 = CriarLinha(4);
    const linha4in = CriarInput(1, "Situação");
    linha4in.value = entrada2;
    linha4in.addEventListener("input", () => {
      linha4in.style.height = "auto"; // Reset height
      linha4in.style.height = linha4in.scrollHeight + "px"; // Set new height
      entrada2 = linha4in.value;
      SalvarVari(1);
    });
    linha4.appendChild(linha4in);
    contentBox.appendChild(linha4);

    const linha5 = CriarLinha(5);
    const linha5T1 = document.createElement("p");
    linha5T1.textContent = "A solicitação foi atendida da seguinte forma:";
    linha5.appendChild(linha5T1);
    contentBox.appendChild(linha5);

    const linha6 = CriarLinha(6);
    const linha6in = CriarInput(1, "Resultado");
    linha6in.value = entrada3;
    linha6in.addEventListener("input", () => {
      linha6in.style.height = "auto"; // Reset height
      linha6in.style.height = linha6in.scrollHeight + "px"; // Set new height
      entrada3 = linha6in.value;
      SalvarVari(1);
    });
    linha6.appendChild(linha6in);
    contentBox.appendChild(linha6);

    var buttonContainer = document.createElement("div");
    buttonContainer.id = "buttonContainer";
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: space-evenly;
        `;

    const botlimpar = CriarBotLimpar();
    botlimpar.addEventListener("click", function () {
      nome = '';
      entrada1 = '';
      entrada2 = '';
      entrada3 = '';
      linha1in.value = "";
      linha2in.value = "";
      linha2in.style.height = "25px";
      linha4in.value = "";
      linha4in.style.height = "25px";
      linha6in.value = "";
      linha6in.style.height = "25px";
    });
    buttonContainer.appendChild(botlimpar);

    const copyButton = CriarBotCopiar();

    copyButton.addEventListener("click", function () {
      var textnome = linha1in.value || linha1in.placeholder;
      var variant1;
      if (linha4in.value !== "") {
        variant1 = linha3T1.textContent + "\n" + linha4in.value + "\n\n";
      } else {
        variant1 = "";
      }
      var variant2;
      if (linha6in.value !== "") {
        variant2 = linha5T1.textContent + "\n" + linha6in.value + ".";
      } else {
        variant2 = "";
      }
      var textToCopy =
        linha1T1.textContent +
        textnome +
        linha1T2.textContent +
        "\n" +
        linha2in.value +
        "\n\n" +
        variant1 +
        variant2;
      navigator.clipboard.writeText(textToCopy).then(
        function () {
          console.log("Texto copiado com sucesso.");
        },
        function (err) {
          console.error("Erro ao copiar texto: ", err);
        }
      );
    });

    buttonContainer.appendChild(copyButton);

    contentBox.appendChild(buttonContainer);

    return contentBox;
  }

  function CriarBotCopiar() {
    var a = document.createElement("button");
    a.style.cssText = `
        background-color: rgb(51, 203, 68);
        cursor: pointer;
        border-radius: 15px;
        border: none;
        color: white;
        padding: 3px 9px;
        margin: 3px;
        `;
    a.textContent = "Copiar";
    return a;
  }

  function CriarBotLimpar() {
    var a = document.createElement("button");
    a.style.cssText = `
        cursor: pointer;
        border-radius: 15px;
        border: none;
        color: white;
        padding: 3px 9px;
        margin: 3px;
        background-color: rgb(147, 176, 205);
        `;
    a.textContent = "Limpar";
    return a;
  }

  function CriarInput(textarea, placeholder) {
    var a = textarea ? "textarea" : "input";
    var b = document.createElement(a);
    b.style.cssText = `
        margin: 0px 5px;
        width: 80px;
        border-radius: 10px;
        padding: 1px;
        text-align: center;
        border-bottom: 2px solid rgb(209, 0, 0);
        `;
    if (textarea) {
      b.placeholder = placeholder;
      b.style.width = "100%";
      b.style.height = "25px";
      b.style.overflow = "hidden";
      b.style.resize = "none";
      b.addEventListener("input", () => {
        b.style.height = "auto"; // Reset height
        b.style.height = b.scrollHeight + "px"; // Set new height
      });
    }
    return b;
  }

  function criarContentBox2() {
    var contentBox2 = document.createElement("div");
    contentBox2.id = "contentBox2";
    contentBox2.style.cssText = `
        display: flex;
        background-color: rgb(255, 236, 209);
        border: 3px solid rgb(255, 112, 32);
        border-radius: 15px;
        padding: 8px;
        margin-top: 10px;
        flex-direction: column;
        `;

    var paragraph21 = document.createElement("p");
    paragraph21.id = "paragraph21";
    paragraph21.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        `;

    const botCop5 = CriarBotCopiar();

    const botlim5 = CriarBotLimpar();

    const Input5 = CriarInput(0);
    Input5.placeholder = "XXXXXXX";
    Input5.id = "input5";

    var TextoTick = document.createElement("p");
    TextoTick.textContent = "Ticket ";

    botCop5.addEventListener("click", function () {
      var a = Input5.value || Input5.placeholder;
      var b = TextoTick.textContent + a;

      navigator.clipboard.writeText(b).then(
        function () {
          console.log("Texto copiado com sucesso.");
        },
        function (err) {
          console.error("Erro ao copiar texto: ", err);
        }
      );
    });
    botlim5.addEventListener("click", function () {
      Input5.value = "";
    });

    paragraph21.appendChild(botlim5);
    paragraph21.appendChild(TextoTick);
    paragraph21.appendChild(Input5);
    paragraph21.appendChild(botCop5);

    contentBox2.appendChild(paragraph21);

    var Cardholder = document.createElement("div");
    Cardholder.id = "paragraph22";
    Cardholder.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        `;

    var TextoLAss = document.createElement("p");
    TextoLAss.textContent = "cardholdername-";

    const botCop6 = CriarBotCopiar();

    const botlim6 = CriarBotLimpar();

    const Input6 = CriarInput(0);
    Input6.placeholder = "XXXXXXX";
    Input6.value = Cardhold;

    // Criar o elemento sizer invisível
    const sizer = document.createElement("span");
    sizer.style.position = "absolute";
    sizer.style.top = "-9999px";
    sizer.style.left = "-9999px";
    sizer.style.visibility = "hidden";
    sizer.style.whiteSpace = "pre";
    sizer.style.fontSize = getComputedStyle(Input6).fontSize;
    sizer.style.fontFamily = getComputedStyle(Input6).fontFamily;
    document.body.appendChild(sizer);

    // Atualizar largura conforme o texto
    Input6.addEventListener("input", function () {
      sizer.textContent = Input6.value || Input6.placeholder;
      Input6.style.width = sizer.offsetWidth + "px";
      Cardhold = Input6.value;
      SalvarVari(1);
    });

    // Inicializar com o placeholder 
    sizer.textContent = Input6.value || Input6.placeholder;
    Input6.style.width = sizer.offsetWidth + "px";

    botCop6.addEventListener("click", function () {
      var textToCopy = TextoLAss.textContent + Input6.value;

      navigator.clipboard.writeText(textToCopy).then(
        function () {
          console.log("Texto copiado com sucesso.");
        },
        function (err) {
          console.error("Erro ao copiar texto: ", err);
        }
      );
    });

    botlim6.addEventListener("click", function () {
      Input6.value = "";
      Cardhold = '';
      sizer.textContent = Input6.placeholder;
      Input6.style.width = sizer.offsetWidth + "px";
    });

    Cardholder.appendChild(botlim6);
    Cardholder.appendChild(TextoLAss);
    Cardholder.appendChild(Input6);
    Cardholder.appendChild(botCop6);

    contentBox2.appendChild(Cardholder);

    var ClinhaAssin = document.createElement("p");
    ClinhaAssin.id = "ClinhaAssin";
    ClinhaAssin.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        `;

    const botCop7 = CriarBotCopiar();

    const botlim7 = CriarBotLimpar();

    const Input7 = CriarInput(0);
    Input7.placeholder = "ALMAVIVA.XXXXXXX-0300-MCZ";
    Input7.value = Assinatura;

    Input7.addEventListener("input", function () {
      sizer.textContent = Input7.value || Input7.placeholder;
      Input7.style.width = sizer.offsetWidth + "px";
      Assinatura = Input7.value;
      SalvarVari(1);
    });

    // Inicializar com o placeholder
    sizer.textContent = Input7.placeholder;
    Input7.style.width = sizer.offsetWidth + "px";

    botCop7.addEventListener("click", function () {
      var textToCopy = Input7.value;

      navigator.clipboard.writeText(textToCopy).then(
        function () {
          console.log("Texto copiado com sucesso.");
        },
        function (err) {
          console.error("Erro ao copiar texto: ", err);
        }
      );
    });

    botlim7.addEventListener("click", function () {
      Input7.value = "";
      Assinatura = '';
      sizer.textContent = Input7.placeholder;
      Input7.style.width = sizer.offsetWidth + "px";
    });

    ClinhaAssin.appendChild(botlim7);
    ClinhaAssin.appendChild(Input7);
    ClinhaAssin.appendChild(botCop7);

    contentBox2.appendChild(ClinhaAssin);

    const CaixadBDnotas = document.createElement("div");
    CaixadBDnotas.style.cssText = `
        margin-top: 5%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
       `;

    const BDnotas = document.createElement("textarea");
    BDnotas.id = "notepad"; // Aqui estava o erro
    BDnotas.placeholder = "Escreva suas notas aqui...";
    BDnotas.style.cssText = `
        width: 320px;
        height: 80px;
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        `;
    BDnotas.addEventListener("blur", saveNotes);

    const exibirSalvo = document.createElement("div");
    exibirSalvo.textContent = "Salvo!";
    exibirSalvo.id = "message";
    exibirSalvo.style.cssText = `
                border-radius: 15px;
        border: none;
        color: white;
        padding: 3px 9px;
        background-color: #33cb44;
        display: none;
        justify-content: center;
        align-items: center;
        position: absolute;
            `;
    BDnotas.value = notas;

    CaixadBDnotas.append(BDnotas, exibirSalvo);
    contentBox2.appendChild(CaixadBDnotas);

    // Função para salvar notas
    function saveNotes() {
      notas = document.getElementById("notepad").value;
      SalvarVari(1);
      showMessage();
    }
    // Função para mostrar a mensagem de salvo
    function showMessage() {
      const message = document.getElementById("message");
      message.style.display = "flex";
      setTimeout(() => {
        message.style.display = "none";
      }, 500);
    }

    return contentBox2;
  }

  /** ===========================
   *  CONFIGURAÇÕES
   *  =========================== */
  const CONFIG = {
    // Onde escrever o NOME encontrado
    input1Selector: "#input1", // input do nome (primeira palavra)
    input1Mode: "placeholder", // "placeholder" ou "value"

    // Onde escrever o NÚMERO DO TICKET encontrado na URL
    input5Selector: "#input5", // input do ticket
    input5Mode: "placeholder", // "placeholder" ou "value"

    // Destaque visual dos elementos encontrados
    highlight: true,

    // Debounce entre reexecuções após mutações do DOM
    debounceMs: 300,

    // Tempo máximo de espera (ms) para o Ticket aparecer no DOM deste contexto
    waitTimeoutMs: 15000,

    // Regex para detectar o texto do ticket nos elementos do <nav>
    ticketRegexText: (n) =>
      new RegExp(
        `Ticket\\s*#\\s*${String(n).replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}`,
        "i"
      ),

    // Log de depuração
    debug: false,
  };

  const LOG_PREFIX = "[TM encontrarNome]";
  const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();

  function log(...args) {
    if (CONFIG.debug) console.log(LOG_PREFIX, ...args);
  }
  function warn(...args) {
    console.warn(LOG_PREFIX, ...args);
  }

  /** ===========================
   *  EXTRAIR TICKET DA URL
   *  =========================== */
  function extrairTicketDaURL(href) {
    const setStr = (v) => (v == null ? null : String(v));
    let numero = null;
    try {
      const url = new URL(href);

      // 1) Segmentos do path (último que contenha dígitos)
      const pathSegs = url.pathname.split("/").filter(Boolean);
      for (let i = pathSegs.length - 1; i >= 0 && !numero; i--) {
        const m = pathSegs[i].match(/\d+/);
        if (m) numero = m[0];
      }

      // 2) Padrão explícito /ticket(s)/<n>
      if (!numero) {
        const m = href.match(/\/tickets?\/(\d+)/i);
        if (m) numero = m[1];
      }

      // 3) Hash com dígitos
      if (!numero && url.hash) {
        const m = url.hash.match(/\d+/);
        if (m) numero = m[0];
      }

      // 4) Query string (ex.: ?ticket_id=123456 ou ?id=123456)
      if (!numero) {
        const qp =
          url.searchParams.get("ticket_id") || url.searchParams.get("id");
        if (qp && /^\d+$/.test(qp)) numero = qp;
      }
    } catch (e) {
      // Fallback: último grupo de dígitos da URL
      const m = (href || "").match(/(\d+)(?!.*\d)/);
      if (m) numero = m[1];
    }
    return setStr(numero);
  }

  /** ===========================
   *  ACHAR "Ticket #<n>" E NOME ANTERIOR NO DOC ATUAL
   *  =========================== */
  function findTicketAndPrevNameInDoc(doc, ticketNumber) {
    if (!ticketNumber) return null;
    const needle = CONFIG.ticketRegexText(ticketNumber);

    // Preferir navs com aria-label sugestivo; senão, todos os <nav>
    const preferred = Array.from(
      doc.querySelectorAll(
        'nav[aria-label*="Localiza" i], nav[aria-label*="ticket" i]'
      )
    );
    const navs = preferred.length
      ? preferred
      : Array.from(doc.querySelectorAll("nav"));

    for (const nav of navs) {
      const nodes = Array.from(
        nav.querySelectorAll("span, [role='link'], [role='button']")
      );
      for (const el of nodes) {
        const text = normalize(el.textContent);
        if (!text || !needle.test(text)) continue;

        // Sobe ao contêiner <span> mais externo que contenha o texto
        let container = el;
        while (
          container.parentElement &&
          container.parentElement.tagName === "SPAN" &&
          needle.test(normalize(container.parentElement.textContent))
        ) {
          container = container.parentElement;
        }

        // Irmão anterior com texto = nome
        let nameEl = container.previousElementSibling;
        while (nameEl && !normalize(nameEl.textContent)) {
          nameEl = nameEl.previousElementSibling;
        }

        return { nav, container, nameEl };
      }
    }
    return null;
  }

  /** Espera o ticket aparecer no DOM deste contexto */
  function waitForTicketInThisDoc(
    doc,
    ticketNumber,
    timeout = CONFIG.waitTimeoutMs
  ) {
    return new Promise((resolve) => {
      const start = performance.now();
      let done = false;

      const tryFind = () => {
        if (done) return true;
        const found = findTicketAndPrevNameInDoc(doc, ticketNumber);
        if (found) {
          cleanup();
          done = true;
          resolve(found);
          return true;
        }
        if (performance.now() - start >= timeout) {
          cleanup();
          done = true;
          resolve(null);
          return true;
        }
        return false;
      };

      const mo = new MutationObserver(() => {
        tryFind();
      });
      try {
        mo.observe(doc, {
          subtree: true,
          childList: true,
          characterData: true,
        });
      } catch {}

      const interval = setInterval(() => {
        tryFind();
      }, 300);
      tryFind();

      function cleanup() {
        try {
          mo.disconnect();
        } catch {}
        clearInterval(interval);
      }
    });
  }

  /** Aplica texto ao input alvo (placeholder/value) */
  function applyToInput(doc, selector, mode, text) {
    const elHere = doc.querySelector(selector);
    const elTop = document.querySelector(selector);
    const input = elHere || elTop;
    if (!input) {
      warn(`Input não encontrado: ${selector}`);
      return { input: null, applied: null };
    }

    const words = normalize(text || "").split(" ");
    const first = words[0] || "";
    const value =
      !first || !isNaN(first)
        ? "Anônimo"
        : first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();

    try {
      input[mode] = value;
    } catch {}
    return { input, applied: value };
  }

  function highlightEls(ticketEl, nameEl) {
    if (!CONFIG.highlight) return;
    try {
      if (ticketEl) ticketEl.style.borderBottom = "1px solid #0ea5e9";
      if (nameEl) nameEl.style.borderBottom = "1px solid #f97316";
    } catch {}
  }

  /** ===========================
   *  API: encontrarNome(ticketNumber)
   *  =========================== */
  async function encontrarNome(ticketNumber) {
    const ticketStr = ticketNumber == null ? "" : String(ticketNumber).trim();
    if (!ticketStr) {
      // Sem número => aplica "Anônimo" no input1
      applyToInput(document, CONFIG.input1Selector, CONFIG.input1Mode, "");
      warn("Nenhum número de ticket fornecido a encontrarNome().");
      return null;
    }

    // Espera o ticket aparecer neste contexto
    const found = await waitForTicketInThisDoc(
      document,
      ticketStr,
      CONFIG.waitTimeoutMs
    );
    if (!found) {
      applyToInput(document, CONFIG.input1Selector, CONFIG.input1Mode, "");
      warn(
        `Ticket #${ticketStr} não apareceu neste contexto em ${CONFIG.waitTimeoutMs}ms.`
      );
      return null;
    }

    const { container, nameEl } = found;

    if (!nameEl) {
      applyToInput(document, CONFIG.input1Selector, CONFIG.input1Mode, "");
      warn(`Nome anterior ao Ticket #${ticketStr} não encontrado.`);
      return null;
    }

    const nameText = normalize(nameEl.textContent);
    const res = applyToInput(
      document,
      CONFIG.input1Selector,
      CONFIG.input1Mode,
      nameText
    );
    highlightEls(container, nameEl);

    log(
      `Ticket #${ticketStr} | Nome: "${nameText}" | Aplicado: ${res.applied}`
    );
    return {
      ticket: ticketStr,
      nomeCompleto: nameText,
      aplicado: res.applied,
      elements: { ticket: container, nome: nameEl },
    };
  }

  /** ===========================
   *  API: encontrarTk()
   *  - Extrai número do ticket da URL do contexto atual
   *  - Preenche #input5
   *  - Chama encontrarNome(numero)
   *  =========================== */
  async function encontrarTk() {
    const href = window.location.href || "";
    const numero = extrairTicketDaURL(href);

    // Preencher input5
    const nToApply = numero || "000000";
    const input5 =
      document.querySelector(CONFIG.input5Selector) ||
      document.querySelector(CONFIG.input5Selector, document);
    if (input5) {
      try {
        input5[CONFIG.input5Mode] = nToApply;
      } catch {}
    } else {
      warn(`Input do ticket não encontrado: ${CONFIG.input5Selector}`);
    }

    if (!numero) {
      log("Nenhum número de ticket encontrado na URL.");
      // Ainda aplica "Anônimo" no input1
      applyToInput(document, CONFIG.input1Selector, CONFIG.input1Mode, "");
      return null;
    }

    // Chama encontrarNome com o número encontrado
    try {
      await Promise.resolve(encontrarNome(numero));
    } catch (e) {
      console.error(LOG_PREFIX, "Erro ao executar encontrarNome:", e);
    }

    return numero;
  }

  /** ===========================
   *  Auto-execução: observa SPA e DOM
   *  =========================== */
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function setupAutoRun() {
    const run = () => {
      try {
        encontrarTk();
      } catch (e) {
        console.error(LOG_PREFIX, e);
      }
    };
    const runDebounced = debounce(run, CONFIG.debounceMs);

    // Rodar já
    runDebounced();

    // Observar DOM
    const mo = new MutationObserver(runDebounced);
    try {
      mo.observe(document, {
        subtree: true,
        childList: true,
        characterData: true,
      });
    } catch {}

    // Observar mudanças de URL em SPA
    try {
      if (!window.__tm_loc_hooked__) {
        const fire = () => window.dispatchEvent(new Event("locationchange"));
        const _push = history.pushState;
        history.pushState = function () {
          const r = _push.apply(this, arguments);
          fire();
          return r;
        };
        const _replace = history.replaceState;
        history.replaceState = function () {
          const r = _replace.apply(this, arguments);
          fire();
          return r;
        };
        window.addEventListener("popstate", fire);
        window.__tm_loc_hooked__ = true;
      }
      window.addEventListener("locationchange", runDebounced);
    } catch (e) {
      log("Hook de history indisponível:", e);
    }

    // Expor helpers no console deste contexto
    try {
      window.encontrarTk = encontrarTk;
      window.encontrarNome = encontrarNome;
    } catch {}
  }

  // Início
  setupAutoRun();

  // Your code here...
})();
