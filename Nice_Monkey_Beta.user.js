// ==UserScript==
// @name         Nice_Monkey_Beta
// @namespace    https://github.com/Hefestos-F/cc-result-monk
// @version      3.3.7.7
// @description  that's all folks!
// @author       almaviva.fpsilva
// @match        https://cxagent.nicecxone.com/home*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/Hefestos-F/cc-result-monk/main/Nice_Monkey_Beta.user.js
// @downloadURL  https://raw.githubusercontent.com/Hefestos-F/cc-result-monk/main/Nice_Monkey_Beta.user.js
// @grant        none

// ==/UserScript==

(function () {
  "use strict";

  const CConfig = {
    TempoEscaladoHoras: "06:20:00",
    ValorLogueManual: "12:00:00",
    LogueManual: 0,
    ValorMetaTMA: 725,
    ModoSalvo: 1,
    Vigia: 1,
    MetaTMA: 1,
    ValorAuto: 10,
    AutoAtivo: 0,
    TolerOff: 40,
    MostraOff: 0,
    IgnorarOff: 0,
    MostraValorOff: 0,
    FaixaFixa: 0,
    IgnorarTMA: 0,
    IgnorarErroNice: 0,
    Estouro: 1,
    SomEstouro: 1,
  };

  const PCConfig = {
    TempoEscaladoHoras: "06:20:00",
    ValorLogueManual: "12:00:00",
    ValorMetaTMA: 725,
    ModoSalvo: 1,
    Vigia: 1,
    MetaTMA: 1,
    ValorAuto: 10,
    AutoAtivo: 0,
    TolerOff: 40,
    MostraOff: 0,
    IgnorarOff: 0,
    MostraValorOff: 0,
    FaixaFixa: 0,
    IgnorarTMA: 0,
    IgnorarErroNice: 0,
    Estouro: 1,
    SomEstouro: 1,
  };

  const Ccor = {
    Offline: "#3a82cf",
    Atualizando: "#c97123ff",
    Erro: "#992e2e",
    MetaTMA: "#229b8d",
    Principal: "#4c95bd",
    Config: "#96a8bb",
    Varian: "",
    TVarian: "",
  };

  const PCcor = {
    Offline: "#3a82cf",
    Atualizando: "#c97123ff",
    Erro: "#992e2e",
    MetaTMA: "#229b8d",
    Principal: "#4c95bd",
    Config: "#96a8bb",
    Varian: "",
    TVarian: "",
  };

  const Segun = {
    Disponivel: 0,
    Trabalhando: 0,
    TrabalhandoA: 0,
    Indisponivel: 0,
    ContAtual: 0,
    Hora: "",
    Logou: "",
    UltimaSomaDTI: 0,
    LogouSalvo: 0,
    NewLogado: 0,
    Offline: 0,
    QualLogou: 0,
  };

  const stt = {
    vAtendidas: "",
    vAtendidasA: 0,
    Atualizando: 0,
    LoopAA: 0, // Atualizar auto Ativo
    AbaConfig: 0,
    AbaPausas: 0,
    NBT: 0,
    DentrodCC2: "",
    DentrodCC1: "",
    DentrodcCC: "",
    DentrodMC: "",
    offForaDToler: 0,
    ErroVerif: 0,
    ErroTMA: 0,
    ErroDTI: 0,
    ErroAtu: 0,
    ErroAten: 0,
    CVAtivo: "",
    StatusANT: "",
    Ndpausas: 2,
    IPausaS: "",
    FPausaS: "",
    DPausaS: "",
    Busc5s: 0,
    Busc5sTem: 5,
    Estouro: 0,
    Estour1: 0,
    intervaloBeep: 1,
    BeepRet: 0,
    logout: 1,
    observ: 1,
  };

  const BGround = {
    ContValores: Ccor.Principal,
    ContIcon: "",
    circuloclick: "",
    circuloclick2: "",
  };

  const Htime = {
    Disponivel: 0,
    Trabalhando: 0,
    Indisponivel: 0,
  };

  const ChavePausas = "DadosDePausas";
  const ChaveConfig = "Configuções";
  const ChavelogueManu = "LogueManual";
  const ChavePrimLogue = "PrimeiroLogue";
  const ChavePrimLogueOntem = "PrimeiroLogueOntem";

  let dadosdePausas;
  let dadosSalvosConfi;
  let dadosPrimLogue;
  let dadosPrimLogueOnt;
  let dadosLogueManu;

  const nomeBD = "MeuBDNiceMonk";
  const StoreBD = "NiceMonk";

  const LugarJS = {
    elementoReferencia: "#cx1_agent_root > main > div > main > header > header",
    elementoReferencia2:
      'a[aria-label="Ajuda"][href*="help.nice-incontact.com"]',
    Status: "#agent-state-section > div > span > div > div",

    abaRelatorio: '[role="button"][aria-label="Reporting"]',
    abaProdutividade: '[type="button"][aria-label="Produtividade"]',
    abaDesempenho: '[type="button"][aria-label="Desempenho"]',
    abaHoje: '[type="button"][aria-label="Hoje"]',

    lContAtual: "#agent-state-section > div > span > div > div > span > span",
  };

  addAoini();

  RecuperarTVariaveis();

  function ObservarItem(aoMudar) {
    const observer = new MutationObserver(() => {
      aoMudar();
      if (!stt.observ) {
        observer.disconnect();
        console.log(`NiceMonk observer Desconectado`);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function addAoini() {
    console.log(`NiceMonk observer Iniciado`);
    ObservarItem(() => {
      let a = document.querySelector(LugarJS.elementoReferencia);
      let b = document.querySelector(LugarJS.elementoReferencia2);
      if (
        a &&
        b &&
        !document.getElementById("minhaCaixa") &&
        !document.getElementById("circuloclickCont")
      ) {
        AdicionarCaixaAtualizada(a);
        addcirculo(b);
        stt.NBT = 1;
        stt.observ = 0;
        stt.logout = 0;
        iniciarBusca();
        console.log(`NiceMonk verificação Inicial Verdadeiro`);
      } else {
        console.log(`NiceMonk verificação Inicial Falso`);
      }
    });
  }

  function deslogou() {
    let a = document.querySelector(LugarJS.elementoReferencia);
    let b = document.querySelector(LugarJS.elementoReferencia2);
    if (!a && !b && !stt.logout) {
      stt.logout = 1;
      console.log(`NiceMonk Nice deslogou.`);
      addAoini();
    }
  }

  async function RecuperarTVariaveis() {
    try {
      dadosdePausas = await RecDadosindexdb(ChavePausas);
      console.log("NiceMonk Encontrados em dadosdePausas:", dadosdePausas);
    } catch (e) {
      console.error("NiceMonk Erro ao recuperar dadosdePausas:", e);
    }
    try {
      dadosSalvosConfi = await RecDadosindexdb(ChaveConfig);
      console.log(
        "NiceMonk Encontrados em dadosSalvosConfi:",
        dadosSalvosConfi
      );
    } catch (e) {
      console.error("NiceMonk Erro ao recuperar dadosSalvosConfi:", e);
    }
    try {
      dadosPrimLogue = await RecDadosindexdb(ChavePrimLogue);
      console.log("NiceMonk Encontrados em dadosdePausas:", dadosPrimLogue);
    } catch (e) {
      console.error("NiceMonk Erro ao recuperar dadosPrimLogue:", e);
    }
    try {
      dadosLogueManu = await RecDadosindexdb(ChavelogueManu);
      console.log("NiceMonk Encontrados em dadosdePausas:", dadosLogueManu);
    } catch (e) {
      console.error("NiceMonk Erro ao recuperar dadosLogueManu:", e);
    }
    try {
      dadosPrimLogueOnt = await RecDadosindexdb(ChavePrimLogueOntem);
      console.log("NiceMonk Encontrados em dadosdePausas:", dadosPrimLogueOnt);
    } catch (e) {
      console.error("NiceMonk Erro ao recuperar dadosPrimLogueOnt:", e);
    }

    SalvandoVari(3);
    SalvarLogueManual(0);
    salvarDPausas();
  }

  function atualizarAuto() {
    if (!stt.LoopAA && CConfig.AutoAtivo) {
      stt.LoopAA = 1;
      setTimeout(function () {
        iniciarBusca();
        stt.LoopAA = 0;
        atualizarAuto();
      }, CConfig.ValorAuto * 60000);
    }
  }

  function criarCaixaDCv(n, titulo) {
    var caixa = document.createElement("div");
    caixa.classList.add("info-caixa");
    caixa.style.transition = "all 0.5s ease";
    caixa.id = `${n}${titulo}`;
    caixa.innerHTML = `
        <div id="t${titulo}">${titulo}:</div>
        <div id="v${titulo}">...</div>
        `;

    return caixa;
  }

  function criarSeparadorCV(x) {
    var separador = document.createElement("div");
    separador.setAttribute("id", `SepCVal${x}`);
    separador.classList.add("separadorC");
    return separador;
  }

  function AdicionarCaixaAtualizada(LDCaixa) {
    function criarLinhaFixa(x, titulo) {
      const caixa = document.createElement("div");
      caixa.id = `c${titulo}`;
      caixa.style.cssText = `
            transition: all 0.5s ease;
            border-radius: 6px;
            padding: 0px 3px;
            display: flex;
            `;

      const caixa2 = document.createElement("div");
      caixa2.id = `t${titulo}`;
      caixa2.style.marginRight = "6px";
      caixa2.textContent = `${titulo}:`;

      const caixa3 = document.createElement("div");
      caixa3.id = `v${titulo}`;
      caixa3.textContent = "...";

      if (x) {
        const botao = criarBotaoSlide(14);
        botao.style.marginRight = "6px";
        caixa.appendChild(botao);
      }

      // Adiciona os elementos corretamente
      caixa.appendChild(caixa2);
      caixa.appendChild(caixa3);

      return caixa;
    }

    // Função para criar a classe dinamicamente
    function criarClasse() {
      const style = document.createElement("style");
      style.type = "text/css";
      style.innerHTML = `
            .info-caixa {
                text-align: center;
            }
            .separadorC {
                width: 1px;
                height: 25px;
                background: #ffffff;
                margin: 2px;
                transition: all 0.5s ease;
            }

            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .iconec {
                background: white;
            }
        `;
      document.getElementsByTagName("head")[0].appendChild(style);
    }

    // Cria a classe
    criarClasse();

    // Cria as caixas com as informações
    const logou = criarCaixaDCv("c", "Logou");
    const logado = criarCaixaDCv("c", "Logado");
    const tma = criarCaixaDCv("c", "TMA");
    const falta = criarCaixaDCv("c", "Falta");
    const saida = criarCaixaDCv("c", "Saida");
    const Offline = criarLinhaFixa(1, "Offline");
    Offline.style.background = Ccor.Offline;
    const Estouro = criarLinhaFixa(0, "Estouro");
    Estouro.style.background = Ccor.Erro;

    // Cria um contêiner para agrupar as caixas
    const container = document.createElement("div");
    container.setAttribute("id", "contValores");
    container.style.cssText = `
        display: flex;
        opacity: 1;
        background: ${Ccor.Principal};
        padding: 2px 5px;
        align-items: center;
        justify-content: space-evenly;
        transition: all 0.5s ease;
        border-radius: 15px;
        width: 100%;
        visibility: visible;
        `;

    // Adiciona as caixas e separadores ao contêiner
    container.appendChild(logou);
    container.appendChild(criarSeparadorCV(1));
    container.appendChild(saida);
    container.appendChild(criarSeparadorCV(2));
    container.appendChild(tma);
    container.appendChild(criarSeparadorCV(3));
    container.appendChild(logado);
    container.appendChild(criarSeparadorCV(4));
    container.appendChild(falta);

    // Cria um contêiner principal para agrupar tudo
    const minhaCaixa = document.createElement("div");
    minhaCaixa.setAttribute("id", "minhaCaixa");
    minhaCaixa.style.cssText = `
        display: flex;
        color: white;
        flex-direction: column;
        position: absolute;
        top: 20%;
        width: 100%;
        z-index: 3;
        font-size: 12px;
        transition: all 0.5s ease;
        align-items: center;
        `;

    function linha(a) {
      const x = document.createElement("div");
      x.id = a;
      x.style.cssText = `
        display: flex;
        justify-content: center;
        visibility: hidden;
        opacity: 0;
        margin-bottom: -18px;
        visibility: hidden;
        transition: opacity 0.5s ease, margin-top 0.5s ease, margin-bottom 0.5s ease;
        `;
      return x;
    }
    // Adiciona o contêiner ao contêiner principal

    const Alinha1 = linha("Alinha1");
    const Alinha2 = linha("Alinha2");
    Alinha1.appendChild(Offline);
    Alinha2.appendChild(Estouro);
    minhaCaixa.appendChild(Alinha1);
    minhaCaixa.appendChild(Alinha2);
    minhaCaixa.appendChild(container);
    minhaCaixa.appendChild(ADDBotPa());

    // Adiciona o contêiner principal ao elemento LDCaixa
    LDCaixa.insertAdjacentElement("afterend", minhaCaixa);

    minhaCaixa.addEventListener("mouseover", function () {
      stt.DentrodMC = 1;
      ControleFront(8);
    });

    minhaCaixa.addEventListener("mouseout", function () {
      stt.DentrodMC = 0;
      ControleFront(8);
    });
  }

  function addcirculo(elementoReferencia2) {
    // Verifica se o elemento existe
    if (elementoReferencia2) {
      //${ContIcon};
      var ContIcon = document.createElement("div");
      ContIcon.setAttribute("id", "ContIcon");
      ContIcon.style.cssText = `
            height: 16px;
            width: 16px;
            border: 2px solid white;
            display: flex;
            margin: 6px;
            align-items: center;
            transform: rotate(45deg);
            justify-content: center;
            `;
      ContIcon.innerHTML = `
        <div style="display: flex; align-items: center; flex-direction: column; transform: rotate(-45deg);">
        <div class="iconec" style="
        height: 7px;
        width: 1px;
        "></div>
        <div class="iconec" style="
        height: 1px;
        width: 12px;
        margin-left: 4px;
        "></div>
        <div class="iconec" style="
        height: 4px;
        width: 1px;
        "></div>
        <div class="iconec" style="
        height: 1px;
        width: 12px;
        margin-right: 4px;
        "></div>
        <div class="iconec" style="
        height: 7px;
        width: 1px;
        "></div>
        </div>
       </div>
        `;

      // Define o estilo do circuloclick
      var circuloclick = document.createElement("div");
      circuloclick.setAttribute("id", "circuloclick");
      circuloclick.style.cssText = `
            display: flex;
            border-radius: 25px;
            height: 26px;
            width: auto;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-width: 1px;
            border-color: white;
            `;
      circuloclick.appendChild(ContIcon);

      var textCC1 = document.createElement("div");
      textCC1.setAttribute("id", "textCC1");
      textCC1.style.cssText = `
            margin-right: 5px;
            opacity: 0;
            display: none;
            transition: 0.5s;
            color: white;
            `;
      circuloclick.appendChild(textCC1);

      // Define o estilo do circuloclick2
      var circuloclick2 = document.createElement("div");
      circuloclick2.setAttribute("id", "circuloclick2");
      circuloclick2.style.cssText = `
            text-align: center;
            padding: 4px;
            display: flex;
            opacity: 0;
            align-items: center;
            width: 24px;
            height: 24px;
            justify-content: center;
            cursor: pointer;
            border: 1px solid white;
            transition: margin-right 0.5s, margin-left 0.5s, opacity 0.5s;
            margin-left: -25px;
            margin-right: 30px;
            visibility: hidden;
            transform: rotate(45deg);
            color: white;
            `;

      var textCC2 = document.createElement("div");
      textCC2.setAttribute("id", "textCC2");
      textCC2.style.transform = "rotate(-45deg)";
      circuloclick2.appendChild(textCC2);

      // Define o estilo do circuloclickCont
      var circuloclickCont = document.createElement("div");
      circuloclickCont.setAttribute("id", "circuloclickCont");
      circuloclickCont.style.cssText = `
            position: absolute;
            font-size: 12px;
            z-index: 1;
            display: flex;
            align-items: center;
            left: 3px;
            background: rgb(0, 124, 190);
            border-radius: 10%;
            min-height: 50px;
            min-width: 65px;
            padding: 0px 8px;
            color: #ffffff;
            `;

      circuloclickCont.appendChild(circuloclick2);
      circuloclickCont.appendChild(circuloclick);

      const pai = elementoReferencia2.parentNode;
      pai.insertBefore(circuloclickCont, pai.firstChild);

      // Adiciona o evento de mouseover ao circuloclick
      circuloclick.addEventListener("mouseover", function () {
        stt.DentrodCC1 = 1;
        ControleFront(4);
      });

      // Adiciona o evento de mouseout ao circuloclick
      circuloclick.addEventListener("mouseout", function () {
        stt.DentrodCC1 = 0;
        ControleFront(4);
      });

      // Adiciona o evento de mouseover ao circuloclick2
      circuloclick2.addEventListener("mouseover", function () {
        stt.DentrodCC2 = 1;
        ControleFront(5);
      });

      // Adiciona o evento de mouseout ao circuloclick2
      circuloclick2.addEventListener("mouseout", function () {
        stt.DentrodCC2 = 0;
        ControleFront(5);
      });

      // Adiciona o evento de mouseover ao circuloclickCont
      circuloclickCont.addEventListener("mouseover", function () {
        stt.DentrodcCC = 1;
        ControleFront(3);
      });

      // Adiciona o evento de mouseout ao circuloclickCont
      circuloclickCont.addEventListener("mouseout", function () {
        stt.DentrodcCC = 0;
        ControleFront(3);
      });

      circuloclick.addEventListener("click", function () {
        iniciarBusca();
      });

      circuloclick2.addEventListener("click", function () {
        AtualizarConf(15);
      });
    } else {
      console.error("NiceMonk Elemento não encontrado. Verifique o seletor.");
    }
  }

  function converterParaTempo(segundos) {
    var minutos;
    if (segundos < 60) {
      return segundos;
    } else if (segundos < 3600) {
      minutos = Math.floor(segundos / 60);
      segundos = segundos % 60;
      return `${minutos.toString().padStart(2, "0")}:${segundos
        .toString()
        .padStart(2, "0")}`;
    } else {
      var horas = Math.floor(segundos / 3600);
      segundos %= 3600;
      minutos = Math.floor(segundos / 60);
      segundos = segundos % 60;
      return `${horas.toString().padStart(2, "0")}:${minutos
        .toString()
        .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
    }
  }

  function clicarElementoQuerySelector(selector) {
    var elemento = document.querySelector(selector);
    if (elemento) {
      elemento.click();
      return true;
    }
    return false;
  }

  async function caminhoInfo(A) {
    if (await seExiste(LugarJS.abaRelatorio)) {
      await clicarElementoQuerySelector(LugarJS.abaRelatorio);
      if (!A) {
        if (await seExiste(LugarJS.abaProdutividade)) {
          await clicarElementoQuerySelector(LugarJS.abaProdutividade);
        } else {
          console.error(
            "NiceMonk Erro ao clicar no último elemento: abaProdutividade"
          );
          return false;
        }
      } else {
        if (await seExiste(LugarJS.abaDesempenho)) {
          await clicarElementoQuerySelector(LugarJS.abaDesempenho);
        } else {
          console.error(
            "NiceMonk Erro ao clicar no último elemento: abaDesempenho"
          );
          return false;
        }
      }
      if (await seExiste(LugarJS.abaHoje)) {
        if (await clicarElementoQuerySelector(LugarJS.abaHoje)) {
          return true;
        }
      } else {
        console.error("NiceMonk Erro ao clicar no último elemento: abaHoje");
        return false;
      }
    } else {
      console.error(
        "NiceMonk Erro ao clicar no primeiro elemento: abaRelatorio"
      );
      return false;
    }
  }

  function seExiste(seletor) {
    return new Promise((resolve, reject) => {
      var maxAttempts = 50; // Tentativas máximas (5 segundos / 100ms por tentativa)
      var attempts = 0;
      var interval = setInterval(function () {
        var elemento = document.querySelector(seletor);
        var NomeDIt = Object.keys(LugarJS).filter(
          (chave) => LugarJS[chave] === seletor
        );

        if (elemento) {
          clearInterval(interval);
          //console.log('Elemento encontrado.');
          resolve(true);
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.error(
              `NiceMonk Elemento de referência não encontrado: ${NomeDIt}`
            );
            resolve(false);
          }
        }
      }, 50); // Tenta a cada 50ms
    });
  }

  function seExiste3(objeto) {
    console.log("NiceMonk seExiste3 iniciado.");
    return new Promise((resolve) => {
      let resultado = false;

      const observer = new MutationObserver(() => {
        const retorno = objeto ? AtuAtendidas() : AtualizarDTI2();

        let objeto2 = objeto ? "Atendidas" : "Tempos";

        if (retorno === true) {
          observer.disconnect();
          console.log(`NiceMonk seExiste3 ${objeto2} encontrado.`);
          resultado = true;
          resolve(true);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        if (!resultado) {
          observer.disconnect();
          console.log("NiceMonk seExiste3 nada encontrado.");
          resolve(resultado); // Retorna true se encontrou, false se não
        }
      }, 6000);
    });
  }

  function formatTime(time) {
    if (!time) {
      console.error("NiceMonk Tempo inválido.");
      return null;
    }
    const parts = time.split(":");
    if (parts.length === 2) {
      // Se o formato for mm:ss, adiciona "00:" no início para transformar em hh:mm:ss
      return `00:${time}`;
    }
    return time; // Se já estiver no formato hh:mm:ss, retorna como está
  }

  function converterParaSegundos(tempo) {
    if (tempo) {
      const [horas, minutos, segundos] = tempo.split(":").map(Number);
      return horas * 3600 + minutos * 60 + segundos;
    }
    return 0;
  }

  async function esperar(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function AtualizarContAtual() {
    if (await seExiste(LugarJS.lContAtual)) {
      const formattedTime = formatTime(
        document.querySelector(LugarJS.lContAtual).textContent
      );
      Segun.ContAtual = converterParaSegundos(formattedTime);
      return true;
    } else {
      return false;
    }
  }

  async function TentAtend() {
    stt.ErroAten = !(await AtualizarAtendidas());
    if (
      stt.vAtendidas <= stt.vAtendidasA &&
      Segun.Trabalhando > Segun.TrabalhandoA
    ) {
      return true;
    } else {
      stt.vAtendidasA = stt.vAtendidas;
      Segun.TrabalhandoA = Segun.Trabalhando;
      return false;
    }
  }

  async function AtualizarAtendidas() {
    const a = await caminhoInfo(1);
    const b = await seExiste3(1);
    if (a && b) {
      return true;
    } else {
      return false;
    }
  }

  async function AtualizarDTI() {
    const a = await caminhoInfo(0);
    const b = await seExiste3(0);

    if (a && b) {
      return true;
    } else {
      return false;
    }
  }

  function AtuAtendidas() {
    let encontrou = false;

    // Seleciona todas as linhas da tabela
    const linhas = document.querySelectorAll("tbody tr");

    let a = 0;
    linhas.forEach((linha) => {
      const celulas = linha.querySelectorAll("td");
      celulas.forEach((celula) => {
        const geralEl = celula.querySelector('[aria-label="Geral"]');
        if (geralEl) {
          // Encontrou a célula com "Geral"
          const valores = linha.querySelectorAll("[aria-label]");
          valores.forEach((valorEl) => {
            const texto = valorEl.getAttribute("aria-label");

            if (!a && texto && texto !== "Geral") {
              a = 1;
              stt.vAtendidas = texto;
              console.log(`NiceMonk Valor ao lado de "Geral": ${texto}`);
              encontrou = true;
            }
          });
        }
      });
    });

    if (!encontrou) {
      console.warn('NiceMonk Valor ao lado de "Geral" não encontrado.');
    }

    return encontrou;
  }

  function AtualizarDTI2() {
    const iconesStatus = {
      availableStatusIconId: "Disponível",
      workingDefaultIconId: "Trabalhando",
      unavailableStatusIconId: "Indisponível",
    };

    const resultados = {};

    Object.entries(iconesStatus).forEach(([id, nomeStatus]) => {
      const icon = document.getElementById(id);
      if (!icon) return;

      // Sobe até o bloco principal do status
      const blocoStatus = icon.closest('div[class*="MuiBox-root"]');
      if (!blocoStatus) return;

      // Procura o tempo dentro do mesmo bloco
      const tempoEl = blocoStatus.querySelector("p");
      let tempoEncontrado = null;

      // Verifica se há algum tempo no formato HH:MM:SS ou HHH:MM:SS
      blocoStatus.querySelectorAll("p").forEach((p) => {
        const texto = p.textContent.trim();
        if (/^\d{2,3}:\d{2}:\d{2}$/.test(texto)) {
          tempoEncontrado = texto;
        }
      });

      if (tempoEncontrado) {
        resultados[nomeStatus] = tempoEncontrado;
        console.log(
          `NiceMonk Status: ${nomeStatus} → Tempo: ${tempoEncontrado}`
        );
        if (nomeStatus === "Disponível") {
          Htime.Disponivel = tempoEncontrado;
          Segun.Disponivel = converterParaSegundos(Htime.Disponivel);
        } else if (nomeStatus === "Trabalhando") {
          Htime.Trabalhando = tempoEncontrado;
          Segun.Trabalhando = converterParaSegundos(Htime.Trabalhando);
        } else if (nomeStatus === "Indisponível") {
          Htime.Indisponivel = tempoEncontrado;
          Segun.Indisponivel = converterParaSegundos(Htime.Indisponivel);
        }
      }
    });

    const encontrou = Object.keys(resultados).length > 0;
    if (!encontrou) {
      console.warn(
        "NiceMonk Nenhum tempo encontrado usando os IDs dos ícones."
      );
    }

    return encontrou;
  }

  function AtualizarTMA(x) {
    const cTMA = document.getElementById("cTMA");
    const SepCVal2 = document.getElementById("SepCVal2");
    const contValores = document.getElementById("contValores");

    if (CConfig.IgnorarTMA && !stt.Busc5s) {
      if (cTMA) {
        cTMA.remove();
      }
      if (SepCVal2) {
        SepCVal2.remove();
      }
      return;
    } else {
      const divs = contValores.querySelectorAll(":scope > div");

      if (!SepCVal2 && divs.length >= 3) {
        // adicionar após a quarta div
        const tma = criarCaixaDCv("c", "TMA");
        divs[2].insertAdjacentElement("afterend", tma);
      }

      if (!cTMA && divs.length >= 3) {
        // adicionar após a terceira div
        const sep = criarSeparadorCV(2);
        divs[2].insertAdjacentElement("afterend", sep);
      }
    }

    const cTMA2 = document.getElementById("cTMA");
    if (cTMA2) {
      const tTMA = document.getElementById("tTMA");
      const vTMA = document.getElementById("vTMA");
      let TMA = stt.vAtendidas === "0" ? 0 : Segun.Trabalhando / stt.vAtendidas;
      TMA = Math.floor(TMA);
      tTMA.innerHTML = stt.Busc5s ? "Busca" : "TMA:";
      vTMA.innerHTML = stt.Busc5s
        ? stt.Busc5sTem
        : stt.ErroAtu || x
        ? "Atualize !!"
        : TMA; // Arredonda para o valor inteiro mais próximo
      cTMA2.style.background =
        (TMA > CConfig.ValorMetaTMA && !stt.ErroAtu && CConfig.MetaTMA) ||
        stt.Busc5s
          ? Ccor.MetaTMA
          : "";
      cTMA2.style.borderRadius = "5px";
      cTMA2.style.padding = " 0px 4px";
      cTMA2.style.margin = "0px -4px";
    }
  }

  function mostrarHora() {
    const agora = new Date();
    let horas = String(agora.getHours()).padStart(2, "0");
    const minutos = String(agora.getMinutes()).padStart(2, "0");
    const segundos = String(agora.getSeconds()).padStart(2, "0");
    //horas = String(Number(horas) + 12).padStart(2, '0');

    return `${horas}:${minutos}:${segundos}`;
  }

  async function iniciarBusca() {
    ControleFront(1);

    stt.ErroDTI = 1;
    for (let a = 0; stt.ErroDTI && a < 4; a++) {
      stt.ErroDTI = !(await AtualizarDTI());
    }

    await VerificacoesN1();

    for (let b = 0; stt.ErroVerif && b < 3; b++) {
      await AtualizarDTI();
      await VerificacoesN1();
      if (stt.ErroVerif) {
        await esperar(1000);
      }
    }

    stt.ErroAtu = CConfig.IgnorarErroNice ? 0 : stt.ErroVerif;

    if (!stt.ErroDTI && !stt.ErroAtu && !CConfig.IgnorarTMA) {
      stt.ErroAten = 1;
      for (let c = 0; stt.ErroAten && c < 3; c++) {
        stt.ErroTMA = await TentAtend();
        for (let c = 0; stt.ErroTMA && c < 3; c++) {
          stt.ErroTMA = await TentAtend();
          await esperar(1000);
        }
      }
      if (!stt.ErroAten) {
        stt.vAtendidasA = stt.vAtendidas;
        Segun.TrabalhandoA = Segun.Trabalhando;
      }
    }
    AtualizarTMA(stt.ErroAten);

    await VerificacoesN1();

    ControleFront(2);

    if (stt.NBT) {
      stt.NBT = 0;
      verificarESalvar(0);
      deslogou();
      setInterval(() => {
        if (!stt.Atualizando) {
          VerificacoesN1();
        }
      }, 1000);
    }
  }

  async function VerificacoesN1() {
    await AtualizarContAtual();

    Segun.NewLogado =
      Segun.Disponivel +
      Segun.Trabalhando +
      Segun.Indisponivel +
      Segun.ContAtual;

    if (Segun.NewLogado >= Segun.UltimaSomaDTI) {
      Segun.UltimaSomaDTI = Segun.NewLogado;
      stt.ErroVerif = 0;
    } else if (CConfig.Vigia && !stt.Atualizando && !stt.ErroVerif) {
      stt.ErroVerif = 1;
      stt.Busc5s = 1;
      ControleFront(7);
      setTimeout(function () {
        iniciarBusca();
      }, 5000);
    } else {
      stt.ErroVerif = 1;
    }

    Segun.Hora = converterParaSegundos(mostrarHora());
    Segun.Logou = Segun.Hora - Segun.NewLogado;

    if (Segun.Logou < Segun.LogouSalvo) {
      verificarESalvar(1);
    }

    Segun.QualLogou = CConfig.LogueManual
      ? converterParaSegundos(CConfig.ValorLogueManual)
      : CConfig.ModoSalvo
      ? Segun.LogouSalvo
      : Segun.Logou;
    Segun.Offline = Segun.Logou - Segun.QualLogou;

    var vari2 = CConfig.ModoSalvo || CConfig.LogueManual ? 1 : 0;

    stt.offForaDToler =
      Segun.Offline > CConfig.TolerOff &&
      vari2 &&
      !stt.ErroAtu &&
      !stt.ErroVerif &&
      !CConfig.IgnorarOff
        ? 1
        : 0;

    CConfig.MostraOff = stt.offForaDToler;
    if (!CConfig.MostraOff && !stt.ErroVerif) {
      CConfig.MostraValorOff = 0;
    }

    AtualizarInfo();
    observarDisponibilidade();
  }

  function AtualizarInfo() {
    var TempoEscalado = converterParaSegundos(CConfig.TempoEscaladoHoras);
    var vHE;
    var TempoCumprido = false;
    var HE = false;

    var LogadoSegundos = Segun.Hora - Segun.QualLogou;
    var SaidaSegundos = Segun.QualLogou + TempoEscalado;
    SaidaSegundos =
      !stt.offForaDToler &&
      !stt.ErroAtu &&
      !CConfig.LogueManual &&
      !CConfig.IgnorarOff &&
      !stt.ErroVerif
        ? SaidaSegundos + Segun.Offline
        : SaidaSegundos;
    var FaltaSegundos = SaidaSegundos - Segun.Hora;
    var ASaidaSegundos = SaidaSegundos + Segun.Offline;
    var AFaltaSegundos = FaltaSegundos + Segun.Offline;
    var dezMinutosSegundos = converterParaSegundos("00:10:00");

    var varia1 = CConfig.MostraValorOff ? ASaidaSegundos : SaidaSegundos;

    var varia2 = CConfig.MostraValorOff ? AFaltaSegundos : FaltaSegundos;

    if (Segun.Hora > varia1 + dezMinutosSegundos) {
      HE = true;
      vHE = Segun.Hora - varia1;
    } else if (Segun.Hora > varia1) {
      TempoCumprido = true;
    }

    var LogouSegundosFormatado = converterParaTempo(Segun.QualLogou);
    var vLogou = document.getElementById("vLogou");
    vLogou.textContent = LogouSegundosFormatado;

    var vari1 = CConfig.MostraValorOff ? Segun.NewLogado : LogadoSegundos;
    var LogadoSegundosFormatado = converterParaTempo(vari1);
    var vLogado = document.getElementById("vLogado");
    vLogado.textContent = LogadoSegundosFormatado;

    var vari2 = varia1;
    var SaidaSegundosFormatado = converterParaTempo(vari2);
    var vSaida = document.getElementById("vSaida");
    vSaida.textContent = SaidaSegundosFormatado;

    var FouH = HE ? vHE : varia2;
    var FouHFormatado = converterParaTempo(FouH);
    var vFalta = document.getElementById("vFalta");
    var tFalta = document.getElementById("tFalta");
    tFalta.textContent = HE ? "HE:" : TempoCumprido ? "Tempo" : "Falta:";
    vFalta.textContent = HE
      ? FouHFormatado
      : TempoCumprido
      ? "Cumprido"
      : FouHFormatado;

    if (stt.Busc5s) {
      AtualizarTMA(0);
      stt.Busc5sTem = stt.Busc5sTem - 1;
      if (stt.Busc5sTem < 1) stt.Busc5s = 0;
    } else {
      stt.Busc5sTem = 5;
    }

    var OfflineSegundosFormatado = converterParaTempo(Segun.Offline);
    var vOffline = document.getElementById("vOffline");
    var tOffline = document.getElementById("tOffline");
    vOffline.textContent = OfflineSegundosFormatado;
    tOffline.textContent = CConfig.MostraValorOff
      ? "Com Offline :"
      : "Sem Offline :";

    if (!stt.Atualizando) {
      ControleFront();
    }
  }

  function ControleFront(a) {
    var circuloclick = document.getElementById("circuloclick");
    var circuloclick2 = document.getElementById("circuloclick2");
    var contValores = document.getElementById("contValores");
    var ContIcon = document.getElementById("ContIcon");
    var textCC1 = document.getElementById("textCC1");
    var textCC2 = document.getElementById("textCC2");
    var cOffline = document.getElementById("cOffline");
    var Alinha1 = document.getElementById("Alinha1");
    var BotPa = document.getElementById("BotPa");

    function TodasCores(d) {
      var b = stt.ErroAtu ? Ccor.Erro : d;
      document.querySelectorAll(".iconec").forEach((element) => {
        element.style.backgroundColor = b;
      });
      ContIcon.style.borderColor = b;
      textCC1.style.color = b;
      circuloclick.style.borderColor = b;
      circuloclick2.style.borderColor = b;
      circuloclick2.style.color = b;
    }

    textCC1.innerHTML = stt.ErroAtu
      ? "Atualizar!!"
      : stt.Atualizando
      ? "Atualizando..."
      : a === 2
      ? "Atualizado"
      : "Atualizar";

    if (a === 1) {
      stt.Atualizando = 1;
      ContIcon.style.animation = "rotate 1s ease-in-out infinite";
      Ccor.TVarian = Ccor.Atualizando;
      BGround.circuloclick2 = "white";
      BGround.circuloclick = stt.DentrodCC1 ? "white" : "";
      BGround.ContIcon = "white";
      BGround.ContValores = Ccor.Atualizando;
      ControleFront(5);
      MostarcontValores(0);
    }
    if (a === 2) {
      ContIcon.style.animation = "";
      Ccor.TVarian = Ccor.Principal;
      BGround.ContValores = Ccor.Principal;
      stt.DentrodcCC = 1;
      ControleFront(4);
      AtualizarConf();
      if (!stt.ErroAtu) {
        setTimeout(function () {
          Ccor.TVarian = "white";
          BGround.circuloclick = "";
          BGround.circuloclick2 = "";
          BGround.ContIcon = "";
          circuloclick2.style.borderColor = "";
          circuloclick2.style.color = "";
          ControleFront();
        }, 2000);
      }
      stt.Atualizando = 0;
      MostarcontValores(1);
      stt.DentrodcCC = 0;
    }
    if (a === 3) {
      //Chamado do circuloclick cont
      Mostarcirculoclick2(stt.DentrodcCC);
      if (!stt.AbaConfig) {
        MostarcontValores(stt.DentrodcCC);
      }
    }

    if (a === 4) {
      //Chamado do circuloclick
      textCC1.style.display = stt.DentrodCC1 ? "flex" : "none";
      textCC1.style.opacity = stt.DentrodCC1 ? "1" : "0";
      circuloclick.style.borderStyle = stt.DentrodCC1 ? "solid" : "";
      BGround.circuloclick = stt.DentrodCC1
        ? stt.ErroAtu || stt.Atualizando
          ? "white"
          : ""
        : "";
    }
    if (a === 5) {
      //Chamado do circuloclick2
      circuloclick2.style.width = stt.DentrodCC2
        ? "auto"
        : stt.AbaConfig
        ? "24px"
        : "17px";
      circuloclick2.style.height =
        stt.DentrodCC2 || stt.AbaConfig ? "24px" : "17px";
      circuloclick2.style.borderRadius =
        stt.DentrodCC2 || stt.AbaConfig ? "25px" : "";
      circuloclick2.style.transform =
        stt.DentrodCC2 || stt.AbaConfig ? "" : "rotate(45deg)";
      textCC2.style.transform =
        stt.DentrodCC2 || stt.AbaConfig ? "" : "rotate(-45deg)";
      textCC2.innerHTML = stt.DentrodCC2 ? "Config" : "C";
    }
    function Mostarcirculoclick2(x) {
      x = stt.AbaConfig ? 1 : x;
      circuloclick2.style.visibility = x ? "visible" : "hidden";
      circuloclick2.style.opacity = x ? "1" : "0";
      circuloclick2.style.marginRight = x ? "10px" : "30px";
      circuloclick2.style.marginLeft = x ? "-5px" : "-25px";
    }

    if (a === 6) {
      //Mostar contValores
      MostarcontValores(stt.DentrodcCC);
    }
    if (a === 7) {
      //Mostar contValores
      MostarcontValores(0);
    }
    if (a === 8) {
      BotPa.style.visibility =
        (stt.DentrodMC && stt.CVAtivo) || stt.AbaPausas ? "visible" : "hidden";
      BotPa.style.opacity =
        (stt.DentrodMC && stt.CVAtivo) || stt.AbaPausas ? "1" : "0";

      BotPa.style.marginTop =
        (stt.DentrodMC && stt.CVAtivo) || stt.AbaPausas ? "5px" : "-20px";
      BotPa.style.marginBottom =
        (stt.DentrodMC && stt.CVAtivo) || stt.AbaPausas
          ? "-5px"
          : !stt.AbaPausas && !stt.AbaConfig
          ? ""
          : "20px";
    }

    function MostarcontValores(x) {
      x = stt.Atualizando ? 0 : CConfig.FaixaFixa ? 1 : x;
      contValores.style.visibility = x ? "visible" : "hidden";
      contValores.style.opacity = x ? "1" : "0";
      contValores.style.marginTop = x ? "" : "-30px";
      contValores.style.marginBottom = x ? "" : "30px";
      stt.CVAtivo = x;
    }

    cOffline.style.background = Ccor.Offline;

    var vari4 =
      contValores.style.opacity === "1" && Segun.Offline > CConfig.TolerOff
        ? 1
        : 0;
    Alinha1.style.visibility =
      vari4 && CConfig.MostraOff ? "visible" : "hidden";
    Alinha1.style.opacity = vari4 && CConfig.MostraOff ? "1" : "0";
    Alinha1.style.marginBottom = vari4 && CConfig.MostraOff ? "" : "-18px";

    atualizarComoff("cSaida");
    atualizarComoff("cLogado");
    atualizarComoff("cFalta");

    function atualizarComoff(caixa) {
      var x = document.getElementById(caixa);
      if (x) {
        x.style.background = CConfig.MostraValorOff ? Ccor.Offline : "";
        x.style.borderRadius = CConfig.MostraValorOff ? "6px" : "";
        x.style.padding = CConfig.MostraValorOff ? "0px 4px" : "";
        x.style.margin = CConfig.MostraValorOff ? "0px -4px" : "";
      }
    }

    TodasCores(Ccor.TVarian);
    contValores.style.background = stt.ErroAtu
      ? Ccor.Erro
      : BGround.ContValores;
    ContIcon.style.background = BGround.ContIcon;
    circuloclick2.style.background = BGround.circuloclick2;
    circuloclick.style.background = BGround.circuloclick;

    document.querySelectorAll(".separadorC").forEach((element) => {
      element.style.width = stt.ErroAtu ? "30px" : "1px";
      element.style.height = stt.ErroAtu ? "12px" : "25px";
      element.style.margin = stt.ErroAtu ? "0px -4px" : "";
      element.style.background = CConfig.MostraOff ? Ccor.Offline : "#ffffff";
      element.style.borderRadius = stt.ErroAtu ? "5px" : "";
      element.style.fontSize = stt.ErroAtu ? "8px" : "";
      element.style.transform = stt.ErroAtu ? "rotate(-90deg)" : "";
      element.style.display = stt.ErroAtu ? "flex" : "";
      element.style.justifyContent = stt.ErroAtu ? "center" : "";
      element.style.color = CConfig.MostraOff ? "white" : Ccor.Erro;
      element.innerHTML = stt.ErroAtu ? "Erro" : "";
    });
  }

  async function copiarTexto(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      console.log("Texto copiado com sucesso!");
    } catch (err) {
      console.error("Erro ao copiar texto: ", err);
    }
  }

  function criarC() {
    function criarTitulo(x) {
      const titulo = document.createElement("div");
      titulo.textContent = `${x}`;
      titulo.style.cssText = `
            text-decoration: underline;
            font-size: 13px;
            margin: auto;
            margin-bottom: 5px;
            `;
      return titulo;
    }

    const style = document.createElement("style");
    style.textContent = `
        .placeholderPerso::placeholder {
        color: #6d4500;
        opacity: 1;
        font-size: 12px;
        }
        `;

    const caixa = document.createElement("div");
    caixa.id = "CaixaConfig";
    caixa.style.cssText = `
        height: 170px;
            margin-top: -15px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        background: ${Ccor.Config};
        transition: all 0.5s ease;
        opacity: 1;
        flex-direction: column;
        padding: 10px;
        overflow: auto;
        width: 210px;
        border: solid steelblue;
        `;

    function criarCaixaSeg() {
      const caixa = document.createElement("div");
      caixa.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            `;
      return caixa;
    }

    const TitulomodoCalculo = criarTitulo("Modo de Calculo");
    const recalculando = criarLinhaTextoComBot(1, "Recalculando");
    const primeiroLogue = criarLinhaTextoComBot(2, "Primeiro Logue");

    const modoCalculo = criarCaixaSeg();
    modoCalculo.append(TitulomodoCalculo, recalculando, primeiroLogue);

    const quanContZero = criarLinhaTextoComBot(3, "Automático");

    const ContTMA = document.createElement("div");
    ContTMA.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        `;

    const inputTMA = document.createElement("input");
    inputTMA.className = "placeholderPerso";
    inputTMA.setAttribute("placeholder", CConfig.ValorMetaTMA);
    inputTMA.type = "number";
    inputTMA.style.cssText = `
        height: 16px;
        color: white;
        background-color: transparent;
        border: solid 1px white;
        width: 50px;
        font-size: 12px;
        `;

    const MetaTMAC = criarLinhaTextoComBot(6, "Meta TMA");

    const InputTMABot = document.createElement("div");
    InputTMABot.style.cssText = `display: flex; align-items: center;`;

    const SalvarTMA = criarBotSalv(14, "Salvar");
    SalvarTMA.style.marginLeft = "5px";
    SalvarTMA.addEventListener("click", function () {
      const valorinputtma = inputTMA.value || inputTMA.placeholder;
      CConfig.ValorMetaTMA = valorinputtma;
      inputTMA.placeholder = valorinputtma;
      inputTMA.value = "";
      AtualizarTMA();
      ControleFront();
      SalvandoVari(1);
    });

    InputTMABot.append(inputTMA, SalvarTMA);
    ContTMA.append(MetaTMAC, InputTMABot);

    function entradatempo(idV, houm, placeholderV) {
      const input = document.createElement("input");
      input.className = "placeholderPerso";
      input.id = `Input${idV}`;
      input.type = "number";
      input.placeholder = placeholderV;
      input.min = 0;
      input.max = houm ? 23 : 59;
      input.style.cssText = `
                width: 42px;
                background: #ffffff00;
                border: solid 1px white;
                color: white;
                font-size: 12px;
            `;
      return input;
    }

    // Criar separador visual ":"
    function doispontos() {
      const DoisP = document.createElement("span");
      DoisP.textContent = ":";
      DoisP.style.cssText = `
                color: white;
                padding: 0 5px;
                font-size: 20px;
            `;
      return DoisP;
    }
    const [horasS, minutosS, segundosS] =
      CConfig.TempoEscaladoHoras.split(":").map(Number);
    const horaInputTE = entradatempo(
      "HoraEsc",
      1,
      String(horasS).padStart(2, "0")
    );
    const minuInputTE = entradatempo(
      "MinuEsc",
      0,
      String(minutosS).padStart(2, "0")
    );

    const horaInputCaiHM = document.createElement("div");
    horaInputCaiHM.style.cssText = `display: flex; align-items: center;`;

    horaInputCaiHM.append(horaInputTE, doispontos(), minuInputTE);

    function salvarHorario() {
      const hora = parseInt(horaInputTE.value) || horasS;
      const minuto = parseInt(minuInputTE.value) || minutosS;

      const horaFormatada = String(hora).padStart(2, "0");
      const minutoFormatado = String(minuto).padStart(2, "0");
      const segundos = "00";

      const horarioFormatado = `${horaFormatada}:${minutoFormatado}:${segundos}`;

      // Salva na variável
      CConfig.TempoEscaladoHoras = horarioFormatado;

      horaInputTE.value = "";
      minuInputTE.value = "";
      horaInputTE.placeholder = horaFormatada;
      minuInputTE.placeholder = minutoFormatado;
    }

    const horaInputCai = document.createElement("div");
    horaInputCai.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        `;
    const SalvarHora = criarBotSalv(13, "Salvar");
    SalvarHora.style.marginLeft = "5px";
    SalvarHora.addEventListener("click", function () {
      salvarHorario();
      ControleFront();
      SalvandoVari(1);
    });
    horaInputCai.append(horaInputCaiHM, SalvarHora);

    const InputCailogueManual = document.createElement("div");
    InputCailogueManual.style.cssText = `display: flex; align-items: center;`;

    const horaInputlogueManual = entradatempo(
      "HLManual",
      1,
      String("0").padStart(2, "0")
    );
    horaInputlogueManual.addEventListener("input", function () {
      salvarHorariologueManual();
    });
    const minuInputlogueManual = entradatempo(
      "MLManual",
      0,
      String("0").padStart(2, "0")
    );
    minuInputlogueManual.addEventListener("input", function () {
      salvarHorariologueManual();
    });

    InputCailogueManual.append(
      horaInputlogueManual,
      doispontos(),
      minuInputlogueManual
    );

    function salvarHorariologueManual() {
      const hora = parseInt(
        horaInputlogueManual.value || horaInputlogueManual.placeholder
      );
      const minuto = parseInt(
        minuInputlogueManual.value || minuInputlogueManual.placeholder
      );
      const horaFormatada = String(hora).padStart(2, "0");
      const minutoFormatado = String(minuto).padStart(2, "0");
      const segundos = "00";
      const horarioFormatado = `${horaFormatada}:${minutoFormatado}:${segundos}`;
      horaInputlogueManual.placeholder = horaFormatada;
      minuInputlogueManual.placeholder = minutoFormatado;
      CConfig.ValorLogueManual = horarioFormatado;
      SalvarLogueManual(1);
    }

    const logueManualC = criarBotaoSlide2(13, () => {
      CConfig.LogueManual = !CConfig.LogueManual;
      if (CConfig.LogueManual) {
        horaInputCailogueManual.prepend(InputCailogueManual);
        const [horasIm, minutosIm, segundosIm] = converterParaTempo(
          Segun.QualLogou
        )
          .split(":")
          .map(Number);
        horaInputlogueManual.value = String(horasIm).padStart(2, "0");
        minuInputlogueManual.value = String(minutosIm).padStart(2, "0");
      } else {
        InputCailogueManual.remove();
        iniciarBusca();
      }
      SalvarLogueManual(1);
      AtualizarConf();
    });
    logueManualC.style.cssText = `
        margin-left: 6px;
        `;

    const horaInputCailogueManual = document.createElement("div");
    horaInputCailogueManual.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        `;

    horaInputCailogueManual.append(logueManualC);

    const ContlogueManual = criarCaixaSeg();

    ContlogueManual.append(
      criarTitulo("Logue Manual"),
      horaInputCailogueManual
    );

    const ContTempEsc = criarCaixaSeg();

    ContTempEsc.append(criarTitulo("Tempo Escalado"), horaInputCai);

    const InputMin = document.createElement("input");
    InputMin.className = "placeholderPerso";
    InputMin.id = "InputMin";
    InputMin.placeholder = CConfig.ValorAuto;
    InputMin.type = "number";
    InputMin.min = "1";
    InputMin.max = "99";
    InputMin.style.cssText = `
        width: 40px;
        height: 16px;
        color: white;
        background: #ffffff00;
        border: solid 1px white;
        margin: 0px 3px;
        `;
    InputMin.addEventListener("input", function () {
      CConfig.ValorAuto = InputMin.value || 1;
      InputMin.placeholder = InputMin.value || 1;
    });

    const textoMinu = document.createElement("div");
    textoMinu.textContent = "Minutos";

    const MostX = document.createElement("div");
    MostX.id = "InputMinX";
    MostX.textContent = "X";
    MostX.style.cssText = `margin: 0px 3px;`;

    const bolaMinu = criarBotaoSlide(4);

    const aCada = document.createElement("div");
    aCada.style.cssText = `
        display: flex;
        align-items: center;
        margin: 3px 0px;
        justify-content: space-between;
        width: 100%;
        `;

    const textoACada = document.createElement("div");
    textoACada.textContent = "A Cada";

    const aCada1 = document.createElement("div");
    aCada1.style.cssText = `
        display: flex;
        `;

    aCada1.append(textoACada, InputMin, MostX, textoMinu);
    aCada.append(aCada1, bolaMinu);

    const manual = criarLinhaTextoComBot(5, "Manual");

    const modoBusca = criarCaixaSeg();
    modoBusca.append(criarTitulo("Modo de Busca"), quanContZero, aCada, manual);

    function criarSeparador() {
      const separador = document.createElement("div");
      separador.style.cssText = `
            width: 100%;
            margin: 8px 0px;
            outline: 1px dashed white;
            `;
      return separador;
    }

    const caixaDeBotres = criarCaixaSeg();

    const BotaoResetT = criarBotSalv(15, "Restaurar Config");

    BotaoResetT.addEventListener("click", function () {
      caixa.appendChild(
        ADDCaixaDAviso("Restaurar Config", () => {
          SalvandoVari(2);
          iniciarBusca();
        })
      );
    });

    caixaDeBotres.append(BotaoResetT);

    const caixaDeCor = criarCaixaSeg();
    caixaDeCor.append(
      criarTitulo("Cores"),
      LinhaSelCor(7, "Principal", Ccor.Principal),
      LinhaSelCor(8, "Atualizando", Ccor.Atualizando),
      LinhaSelCor(9, "Meta TMA", Ccor.MetaTMA),
      LinhaSelCor(10, "Erro", Ccor.Erro),
      LinhaSelCor(11, "Offline", Ccor.Offline),
      LinhaSelCor(12, "Config", Ccor.Config)
    );

    const CIgOffline = criarCaixaSeg();
    const IgOffline = criarLinhaTextoComBot(16, "Ignorar Offline");
    CIgOffline.append(IgOffline);

    const CFixaValor = criarCaixaSeg();
    const FixaValor = criarLinhaTextoComBot(18, "Faixa Fixa");
    CFixaValor.append(FixaValor);

    const CIgTMA = criarCaixaSeg();
    const IgTMA = criarLinhaTextoComBot(19, "Ignorar TMA");
    CIgTMA.append(IgTMA);

    const CIgErro = criarCaixaSeg();
    const IgErro = criarLinhaTextoComBot(20, "Ignorar Erro Nice");
    CIgErro.append(IgErro);

    const CIgEst = criarCaixaSeg();

    const IgEst = criarLinhaTextoComBot(22, "Notificar Estouro");
    const IgEstSom = criarLinhaTextoComBot(23, "Som");
    CIgEst.append(criarTitulo("Estouro de Pausa"));
    CIgEst.append(IgEst);
    CIgEst.append(IgEstSom);

    const Cbotavan = criarCaixaSeg();
    const botavan = criarBotSalv(21, "Avançado");
    botavan.addEventListener("click", function () {
      const CavancadoV = document.getElementById("Cavancado");
      if (!CavancadoV) {
        caixa.append(Cavancado);
      } else {
        CavancadoV.remove();
      }
    });
    Cbotavan.append(botavan);

    const CBBancDa = criarCaixaSeg();
    const BBancDa = criarTitulo("Banco de Dados");
    BBancDa.addEventListener("click", function () {
      if (CBancDa.innerHTML === "") {
        listarChavesEConteudos(); // Preenche o conteúdo
      } else {
        CBancDa.innerHTML = ""; // Limpa o conteúdo
      }
    });

    BBancDa.style.cssText = `
        cursor: pointer;
        text-decoration: underline;
        font-size: 13px;
        margin: auto auto 5px;
        `;
    CBBancDa.append(BBancDa);

    const CBancDa = criarCaixaSeg();
    CBancDa.id = "CBancDa";

    CBBancDa.append(CBancDa);

    const Cavancado = criarCaixaSeg();
    Cavancado.id = "Cavancado";

    const CValoresEnc = criarCaixaSeg();
    const tValoresEnc = criarTitulo("Valores Encontrados");
    const C2ValoresEnc = criarCaixaSeg();
    C2ValoresEnc.style.alignItems = "center";
    tValoresEnc.addEventListener("click", function () {
      if (C2ValoresEnc.innerHTML === "") {
        C2ValoresEnc.innerHTML = `
        <div>Disponivel = ${Htime.Disponivel}</div>
        <div>Trabalhando = ${Htime.Trabalhando}</div>
        <div>Indisponivel = ${Htime.Indisponivel}</div>
        <div>Atendidas = ${stt.vAtendidas}</div>
        `;
      } else {
        C2ValoresEnc.innerHTML = ""; // Limpa o conteúdo
      }
    });
    tValoresEnc.style.cssText = `
        cursor: pointer;
        text-decoration: underline;
        font-size: 13px;
        margin: auto auto 5px;
        `;

    CValoresEnc.append(tValoresEnc);
    CValoresEnc.append(C2ValoresEnc);

    Cavancado.append(CBBancDa);
    Cavancado.append(criarSeparador());
    Cavancado.append(CValoresEnc);

    caixa.append(
      ContTempEsc,
      criarSeparador(),
      ContlogueManual,
      criarSeparador(),
      CFixaValor,
      CIgOffline,
      CIgTMA,
      CIgErro,
      criarSeparador(),
      CIgEst,
      criarSeparador(),
      ContTMA,
      criarSeparador(),
      modoBusca,
      criarSeparador(),
      modoCalculo,
      criarSeparador(),
      caixaDeCor,
      criarSeparador(),
      caixaDeBotres,
      criarSeparador(),
      Cbotavan,
      criarSeparador()
    );

    document.body.appendChild(caixa);

    // Função auxiliar para criar linha com texto e bolinha
    function criarLinhaTextoComBot(idbola, texto) {
      const linha = document.createElement("div");
      linha.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin: 3px 0px;
            `;

      const textoDiv = document.createElement("div");
      textoDiv.textContent = texto;

      const botao = criarBotaoSlide(idbola);

      linha.append(textoDiv, botao);
      return linha;
    }

    function LinhaSelCor(a, b, c) {
      const div1 = document.createElement("div");
      div1.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 5px;
            `;

      const inputCor = document.createElement("input");
      inputCor.id = `cor${a}`;
      inputCor.type = "color";
      inputCor.value = c; // Corrigido aqui

      inputCor.style.cssText = `
            height: 20px;
            width: 20px;
            padding: 0px;
            border: none;
            background: none;
            cursor: pointer;
             `;

      const textoDiv = document.createElement("div");
      textoDiv.textContent = b;

      const botao = criarBotSalv(a, "Salvar");

      botao.addEventListener("click", function () {
        Ccor.Varian = inputCor.value;
        copiarTexto(Ccor.Varian);
        AtualizarConf(a);
        ControleFront();
        SalvandoVari(1);
      });

      div1.append(inputCor, textoDiv, botao);
      return div1;
    }

    return caixa;
  }

  function criarBotSalv(a1, a2) {
    const Botao = document.createElement("button");
    Botao.id = `Botao${a1}`;
    Botao.style.cssText = `
            padding: 2px;
            border-radius: 8px;
            border: 1px solid;
            cursor: pointer;
            background-color: transparent;
            color: white;
            font-size: 12px;
            height: 22px;
            `;
    Botao.textContent = `${a2}`;

    return Botao;
  }

  function AtualizarConf(zz) {
    var CaixaConfig = document.getElementById("CaixaConfig");
    var InputMin = document.getElementById("InputMin");
    var InputMinX = document.getElementById("InputMinX");
    var CaiDPa = document.getElementById("CaiDPa");
    var BotPa = document.getElementById("BotPa");
    var minhaCaixa = document.getElementById("minhaCaixa");

    if (zz === 1) {
      CConfig.ModoSalvo = 0;
    }
    if (zz === 2) {
      CConfig.ModoSalvo = 1;
    }
    if (zz === 3) {
      CConfig.Vigia = 1;
      CConfig.AutoAtivo = 0;
    }
    if (zz === 4) {
      InputMin.value = CConfig.ValorAuto;
      CConfig.Vigia = 0;
      CConfig.AutoAtivo = 1;
      atualizarAuto();
      console.log("NiceMonk Valor Auto : ", CConfig.ValorAuto);
    }
    if (zz === 5) {
      CConfig.Vigia = 0;
      CConfig.AutoAtivo = 0;
    }
    if (zz === 6) {
      CConfig.MetaTMA = !CConfig.MetaTMA;
      AtualizarTMA();
    }
    if (zz === 7) {
      Ccor.Principal = Ccor.Varian;
      BGround.ContValores = Ccor.Principal;
      BotPa.style.backgroundColor = Ccor.Principal;
      document
        .querySelectorAll(".slider-button27.active")
        .forEach((element) => {
          element.style.backgroundColor = Ccor.Principal;
        });
    }
    if (zz === 8) {
      Ccor.Atualizando = Ccor.Varian;
    }
    if (zz === 9) {
      Ccor.MetaTMA = Ccor.Varian;
      AtualizarTMA();
    }
    if (zz === 10) {
      Ccor.Erro = Ccor.Varian;
    }
    if (zz === 11) {
      Ccor.Offline = Ccor.Varian;
      ControleFront();
    }
    if (zz === 12) {
      Ccor.Config = Ccor.Varian;
      CaixaConfig.style.backgroundColor = Ccor.Config;
      if (CaiDPa) CaiDPa.style.backgroundColor = Ccor.Config;
    }
    if (zz === 14) {
      CConfig.MostraValorOff = CConfig.MostraOff
        ? !CConfig.MostraValorOff
        : CConfig.MostraValorOff;
    }
    if (zz === 15) {
      stt.AbaConfig = !stt.AbaConfig;

      if (stt.AbaConfig) {
        if (stt.AbaPausas) {
          stt.AbaPausas = 0;
          CaiDPa.remove();
        }
        minhaCaixa.appendChild(criarC());
        AtualizarConf();
      } else {
        CaixaConfig.remove();
      }
    }
    if (zz === 16) {
      CConfig.IgnorarOff = !CConfig.IgnorarOff;
      if (CConfig.IgnorarOff) {
        CConfig.MostraValorOff = 0;
      }
    }
    if (zz === 17) {
      stt.AbaPausas = !stt.AbaPausas;
      if (stt.AbaPausas) {
        if (stt.AbaConfig) {
          stt.AbaConfig = 0;
          CaixaConfig.remove();
        }
        minhaCaixa.appendChild(ADDCaiPausas());
        AtualizarConf();
      } else {
        CaiDPa.remove();
      }
    }
    if (zz === 18) {
      CConfig.FaixaFixa = !CConfig.FaixaFixa;
    }
    if (zz === 19) {
      CConfig.IgnorarTMA = !CConfig.IgnorarTMA;
      AtualizarTMA(0);
    }
    if (zz === 20) {
      CConfig.IgnorarErroNice = !CConfig.IgnorarErroNice;

      CConfig.IgnorarTMA = CConfig.IgnorarErroNice;
      CConfig.IgnorarOff = CConfig.IgnorarErroNice;
      AtualizarTMA(0);
      if (CConfig.IgnorarErroNice) {
        AtualizarConf(5);
      }
    }
    if (zz === 22) {
      CConfig.Estouro = !CConfig.Estouro;
      if (!CConfig.Estouro) CConfig.SomEstouro = 0;
    }
    if (zz === 23) {
      if (CConfig.Estouro) {
        CConfig.SomEstouro = !CConfig.SomEstouro;
        RepetirBeep();
      } else {
        CConfig.SomEstouro = 0;
      }
    }

    ControleFront(8);
    if (InputMin) InputMin.style.display = CConfig.AutoAtivo ? "flex" : "none";
    if (InputMinX)
      InputMinX.style.display = !CConfig.AutoAtivo ? "flex" : "none";

    atualizarVisual("Bot14", CConfig.MostraValorOff);

    if (stt.AbaConfig) {
      atualizarVisual("Bot1", !CConfig.ModoSalvo);
      atualizarVisual("Bot2", CConfig.ModoSalvo);
      atualizarVisual("Bot6", CConfig.MetaTMA);
      atualizarVisual("Bot3", CConfig.Vigia);
      atualizarVisual("Bot4", CConfig.AutoAtivo);
      var vari1 = CConfig.Vigia || CConfig.AutoAtivo ? 0 : 1;
      atualizarVisual("Bot5", vari1);
      atualizarVisual("Bot13", CConfig.LogueManual);
      atualizarVisual("Bot16", CConfig.IgnorarOff);
      atualizarVisual("Bot18", CConfig.FaixaFixa);
      atualizarVisual("Bot19", CConfig.IgnorarTMA);
      atualizarVisual("Bot20", CConfig.IgnorarErroNice);
      atualizarVisual("Bot22", CConfig.Estouro);
      atualizarVisual("Bot23", CConfig.SomEstouro);
    }

    if (zz > 0 && zz !== 14) {
      SalvandoVari(1);
    }
    VerificacoesN1();
    ControleFront();
  }

  function atualizarVisual(a, quem) {
    var x = document.getElementById(a);
    if (!x) {
      console.warn(`NiceMonk Elemento com ID '${a}' não encontrado.`);
      return;
    }

    if (quem) {
      if (!x.classList.contains("active")) {
        x.classList.add("active");
        x.style.backgroundColor = Ccor.Principal;
      }
    } else {
      if (x.classList.contains("active")) {
        x.classList.remove("active");
        x.style.backgroundColor = "#ccc";
      }
    }
  }

  function criarBotaoSlide2(IdBot, funcao) {
    // Adiciona estilos apenas uma vez
    if (!document.getElementById("estilo-slide")) {
      const style = document.createElement("style");
      style.id = "estilo-slide";
      style.textContent = `
          .slider-button27 {
            position: relative;
            width: 26px;
            height: 14px;
            background-color: #ccc;
            border-radius: 15px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .slider-circle {
            position: absolute;
            top: 1px;
            left: 1px;
            width: 12px;
            height: 12px;
            background-color: white;
            border-radius: 50%;
            transition: transform 0.3s ease;
          }

          .slider-button27.active {
            background-color: ${Ccor.Principal};
          }

          .slider-button27.active .slider-circle {
            transform: translateX(12px);
          }

          .status {
            margin-left: 10px;
            font-size: 16px;
          }

          .toggle-container {
            display: flex;
            align-items: center;
          }
        `;
      document.getElementsByTagName("head")[0].appendChild(style);
    }

    const toggleContainer = document.createElement("div");
    toggleContainer.className = "toggle-container";

    const slider = document.createElement("div");
    slider.className = "slider-button27";
    slider.id = `Bot${IdBot}`;

    const circle = document.createElement("div");
    circle.className = "slider-circle";

    slider.appendChild(circle);
    toggleContainer.appendChild(slider);

    slider.addEventListener("click", () => {
      funcao();
    });

    return toggleContainer;
  }

  function criarBotaoSlide(IdBot) {
    // Adiciona estilos apenas uma vez
    if (!document.getElementById("estilo-slide")) {
      const style = document.createElement("style");
      style.id = "estilo-slide";
      style.textContent = `
          .slider-button27 {
            position: relative;
            width: 26px;
            height: 14px;
            background-color: #ccc;
            border-radius: 15px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .slider-circle {
            position: absolute;
            top: 1px;
            left: 1px;
            width: 12px;
            height: 12px;
            background-color: white;
            border-radius: 50%;
            transition: transform 0.3s ease;
          }

          .slider-button27.active {
            background-color: ${Ccor.Principal};
          }

          .slider-button27.active .slider-circle {
            transform: translateX(12px);
          }

          .status {
            margin-left: 10px;
            font-size: 16px;
          }

          .toggle-container {
            display: flex;
            align-items: center;
          }
        `;
      document.getElementsByTagName("head")[0].appendChild(style);
    }

    const toggleContainer = document.createElement("div");
    toggleContainer.className = "toggle-container";

    const slider = document.createElement("div");
    slider.className = "slider-button27";
    slider.id = `Bot${IdBot}`;

    const circle = document.createElement("div");
    circle.className = "slider-circle";

    slider.appendChild(circle);
    toggleContainer.appendChild(slider);

    slider.addEventListener("click", () => {
      AtualizarConf(IdBot);
    });

    return toggleContainer;
  }

  function observarDisponibilidade() {
    const alvo = document.querySelector(LugarJS.Status);
    const CaiDPa = document.getElementById("CaiDPa");

    if (!alvo) {
      return;
    }

    const text = alvo?.textContent || "";
    const StatusNOV = text.trim().split(" ")[0];

    const tiposStatus = [
      "Lanche",
      "Descanso",
      "Particular",
      "Falha",
      "Feedback",
      "Treinamento",
      "PRE",
      "Dispon",
    ];

    for (const tipo of tiposStatus) {
      verificacaoStatus(tipo);
    }

    if (StatusNOV !== stt.StatusANT) {
      stt.StatusANT = StatusNOV;
      atualizarID1();
    }

    VeriEstDPausa();

    function VeriEstDPausa() {
      let a = "00:00:00";
      let b = 0;
      let f = "";

      if (StatusNOV.includes("Descanso")) {
        a = "00:10:00";
        f = "Descanso";
        b = 1;
      } else if (StatusNOV.includes("Lanche")) {
        a = "00:20:00";
        f = "Lanche";
        b = 1;
      }
      let c = converterParaSegundos(a);

      if (Segun.ContAtual > c && b) {
        stt.Estouro = 1;
        let d = Segun.ContAtual - c;

        if (!stt.Estour1 && CConfig.SomEstouro) {
          stt.Estour1 = 1;
          tocarBeep();
          setTimeout(function () {
            stt.intervaloBeep = 3;
            RepetirBeep();
          }, 15000);
        }

        const vEstouro = document.getElementById("vEstouro");
        const tEstouro = document.getElementById("tEstouro");
        tEstouro.textContent = `Estourou a pausa ${f}:`;
        vEstouro.textContent = converterParaTempo(d);
        //console.log(`Estouro de Pausa ${tipo}:`, d);
      } else {
        stt.Estouro = 0;
        stt.Estour1 = 0;
        stt.intervaloBeep = 3;
      }
      let e = stt.Estouro && CConfig.Estouro ? 1 : 0;
      const Alinha2 = document.getElementById("Alinha2");
      Alinha2.style.visibility = e ? "visible" : "hidden";
      Alinha2.style.opacity = e ? "1" : "0";
      Alinha2.style.marginBottom = e ? "" : "-18px";
    }

    function FimdePausa(tipo) {
      stt.FPausaS = converterParaSegundos(mostrarHora());
      stt.DPausaS = stt.FPausaS - stt.IPausaS;
      var DPausaS1 = converterParaTempo(stt.DPausaS);
      var y = tipo.includes("Dispon") ? 2 : stt.Ndpausas;

      if (y === 2)
        console.log(
          `NiceMonk Valor de Tempo em Disponivel : Inicial ${stt.IPausaS} / Fim ${stt.FPausaS} / Duração ${stt.DPausaS}`
        );

      atualizarCampos(y, "Fim", mostrarHora());
      atualizarCampos(y, "Duracao", DPausaS1);

      if (CaiDPa) AtuaPausas();
    }

    function verificacaoStatus(tipo) {
      if (StatusNOV.includes(tipo)) {
        if (!stt.StatusANT.includes(tipo)) {
          stt.IPausaS = converterParaSegundos(mostrarHora());
          stt.Ndpausas = stt.Ndpausas + 1;

          let a = tipo.includes("Dispon") ? 2 : stt.Ndpausas;
          let b = tipo.includes("PRE") ? "Logout" : tipo;
          let c = "00:00:00";
          let e = 0;
          if (tipo.includes("Descanso")) {
            c = "00:10:00";
            e = 1;
          } else if (tipo.includes("Lanche")) {
            c = "00:20:00";
            e = 1;
          }
          let d = converterParaSegundos(c);
          let f = e ? converterParaTempo(stt.IPausaS + d) : 0;
          if (e) {
            console.log(`NiceMonk o D Esta : ${d}`);
          }
          let g = e ? "<-Volta" : 0;
          if (stt.Ndpausas >= 100) {
            stt.Ndpausas = 2;
          }

          if (a === 2) {
            atualizarCampos(a, "pausa", "Disponivel");
            atualizarCampos(a, "Inicio", mostrarHora());
            atualizarCampos(a, "Fim", 0);
          } else {
            AddouAtualizarPausas(a, b, mostrarHora(), f, g);
          }

          if (CaiDPa) AtuaPausas();
        }
      } else if (stt.StatusANT.includes(tipo)) {
        FimdePausa(tipo);
      }
    }
  }

  function AddTituloCp(titulo) {
    const caixa = document.createElement("div");
    caixa.innerHTML = `${titulo}`;
    caixa.style.cssText = `
        font-size: 14px;
            border-bottom-style: dashed;
            border-width: 1px;
            margin-bottom: 6px;
        `;
    return caixa;
  }

  function ADDCaiPausas() {
    const caixa = document.createElement("div");
    caixa.id = "CaiDPa";
    caixa.style.cssText = `
        background: ${Ccor.Config};
        max-height: 170px;
        margin-top: -15px;
        border-radius: 8px;
        display: flex;
        padding: 5px;
        width: auto;
        border: solid steelblue;
        transition: 0.5s;
        flex-direction: row;
        overflow: auto;
        align-items: center;
        justify-content: center;
       `;

    function ADDCaixa1(id) {
      const caixa = document.createElement("div");
      caixa.id = id;
      caixa.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0px 6px;
        `;
      return caixa;
    }

    // Criar colunas

    const CPausa = ADDCaixa1("CPausa");

    const CExcl = ADDCaixa1("CExcl");

    const CInicio = ADDCaixa1("CInicio");

    const CFim = ADDCaixa1("CFim");

    const CDuracao = ADDCaixa1("CDuracao");

    // Montar estrutura final
    caixa.append(CExcl, CPausa, CInicio, CFim, CDuracao);

    return caixa;
  }

  function ADDBotPa() {
    const caixa = document.createElement("div");
    caixa.id = "BotPa";
    caixa.innerHTML = "P";
    caixa.style.cssText = `
        background: ${Ccor.Principal};
        height: 20px;
        width: 20px;
        border-radius: 15px;
        padding: 5px;
        display: flex;
        align-items: center;
        transition: all 0.5s ease;
        visibility: hidden;
        opacity: 0;
        cursor: pointer;
        justify-content: center;
        margin-left: auto;
       margin-right: 5px;
        margin-top: -20px;
        margin-bottom: 20px;
        `;
    caixa.addEventListener("click", function () {
      AtualizarConf(17);
      ControleFront(3);
      const CaiDPa = document.getElementById("CaiDPa");
      if (CaiDPa) AtuaPausas();
      Controle(1);
    });
    // Adiciona o evento de mouseover ao circuloclick
    caixa.addEventListener("mouseover", function () {
      Controle(1);
    });

    // Adiciona o evento de mouseout ao circuloclick
    caixa.addEventListener("mouseout", function () {
      Controle(0);
    });
    function Controle(x) {
      caixa.style.width = x ? "auto" : "20px";
      //Esperar antes de mudar o innerHTML
      caixa.innerHTML = x
        ? stt.AbaPausas
          ? "Fechar"
          : "Pausas"
        : stt.AbaPausas
        ? "F"
        : "P";
    }
    return caixa;
  }

  function abrirDB(callback) {
    const request = indexedDB.open(nomeBD, 1);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(StoreBD)) {
        db.createObjectStore(StoreBD);
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      callback(db);
    };

    request.onerror = function (event) {
      console.error(
        "NiceMonk Erro ao abrir o banco de dados:",
        event.target.errorCode
      );
    };
  }

  function AddOuAtuIindexdb(nomechave, dados) {
    abrirDB(function (db) {
      const transacao = db.transaction([StoreBD], "readwrite");
      const store = transacao.objectStore(StoreBD);
      const request = store.put(dados, nomechave);

      request.onsuccess = function () {
        console.log(
          `NiceMonk Dados salvos com sucesso na chave "${nomechave}"`
        );
      };

      request.onerror = function (event) {
        console.error(
          "NiceMonk Erro ao salvar os dados:",
          event.target.errorCode
        );
      };
    });
  }

  function RecDadosindexdb(nomechave) {
    return new Promise((resolve, reject) => {
      abrirDB(function (db) {
        const transacao = db.transaction([StoreBD], "readonly");
        const store = transacao.objectStore(StoreBD);
        const request = store.get(nomechave);

        request.onsuccess = function (event) {
          const resultado = event.target.result;
          resolve(resultado !== undefined ? resultado : false);
        };

        request.onerror = function (event) {
          reject(event.target.errorCode);
        };
      });
    });
  }

  function listarChavesEConteudos() {
    abrirDB(function (db) {
      const transacao = db.transaction([StoreBD], "readonly");
      const store = transacao.objectStore(StoreBD);
      const request = store.getAllKeys();

      request.onsuccess = function (event) {
        const chaves = event.target.result;

        var asta = 0;
        chaves.forEach((chave) => {
          const reqConteudo = store.get(chave);

          reqConteudo.onsuccess = function (e) {
            const conteudo = e.target.result;

            const CaixaConfig = document.getElementById("CaixaConfig");
            const CBancDa = document.getElementById("CBancDa");

            // Criar estrutura HTML
            const divPai = document.createElement("div");
            divPai.style.cssText = `width: 100%;`;
            const TituloEBot = document.createElement("div");
            TituloEBot.style.cssText = `
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        margin: 6px 0px;
                        `;

            const divChave = document.createElement("div");
            divChave.textContent = chave;
            divChave.style.cssText = `
                        cursor: pointer;
                        text-decoration: underline;
                        font-size: 13px;
                        `;

            const divConteudo = document.createElement("div");
            divConteudo.style.cssText = `
                        display: none;
                        justify-content: center;
                        `;

            divConteudo.textContent = JSON.stringify(conteudo, null, 2);

            divChave.addEventListener("click", function () {
              if (
                divConteudo.style.display === "none" ||
                divConteudo.style.display === ""
              ) {
                divConteudo.style.display = "flex";
              } else {
                divConteudo.style.display = "none";
              }
            });

            asta = asta + 1;
            const bot = document.createElement("div");
            bot.id = `Chave${asta}`;
            bot.style.cssText = `
                        cursor: pointer;
                        `;
            bot.textContent = "❌";
            bot.addEventListener("click", function () {
              CaixaConfig.appendChild(
                ADDCaixaDAviso("Excluir", () => {
                  ApagarChaveIndexDB(chave);
                  CBancDa.innerHTML = "";
                  listarChavesEConteudos();
                })
              );
            });

            TituloEBot.appendChild(divChave);
            TituloEBot.appendChild(bot);
            divPai.appendChild(TituloEBot);
            divPai.appendChild(divConteudo);

            // Adicionar ao DOM (exemplo: dentro de um elemento com id="resultado")

            CBancDa.appendChild(divPai);
          };
        });
      };

      request.onerror = function (event) {
        console.error("Erro ao listar as chaves:", event.target.errorCode);
      };
    });
  }

  function ApagarChaveIndexDB(nomechave) {
    abrirDB(function (db) {
      const transacao = db.transaction([StoreBD], "readwrite");
      const store = transacao.objectStore(StoreBD);
      const request = store.delete(nomechave);

      request.onsuccess = function () {
        console.log(`NiceMonk Chave "${nomechave}" apagada com sucesso.`);
      };

      request.onerror = function (event) {
        console.error(
          "NiceMonk Erro ao apagar a chave:",
          event.target.errorCode
        );
      };
    });
  }

  function SalvarLogueManual(x) {
    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split("T")[0];
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const ontemFormatado = ontem.toISOString().split("T")[0];

    const valorEdata = {
      ValorLogueManual: CConfig.ValorLogueManual,
      LogueManual: CConfig.LogueManual,
      data: hojeFormatado,
    };

    if (!dadosLogueManu || dadosLogueManu.data !== hojeFormatado) {
      x = 1;
      //console.log("NiceMonk Data Diferente de Hoje");
    }
    if (dadosLogueManu.data === ontemFormatado) {
      AddOuAtuIindexdb(ChavePrimLogueOntem, dadosLogueManu);
    }

    if (x) {
      AddOuAtuIindexdb(ChavelogueManu, valorEdata);
      //console.log("NiceMonk Informação salva para a data de hoje  LogueManual: ",valorEdata);
    } else {
      CConfig.ValorLogueManual = dadosLogueManu.ValorLogueManual;
      CConfig.LogueManual = dadosLogueManu.LogueManual;
      //console.log("NiceMonk x False");
    }
  }

  function verificarESalvar(x) {
    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split("T")[0];
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const ontemFormatado = ontem.toISOString().split("T")[0];

    var convert = converterParaTempo(Segun.Logou);
    const valorEdata = { valor: convert, data: hojeFormatado }; // Usa a data de hoje e o valor passado

    if (!dadosPrimLogue || dadosPrimLogue.data !== hojeFormatado) {
      valorEdata.valor = "24:00:00";
      x = 1;
    }
    if (dadosPrimLogue.data === ontemFormatado) {
      AddOuAtuIindexdb(ChavePrimLogueOntem, dadosPrimLogue);
    }

    if (x) {
      console.log(
        "NiceMonk Anteriormente salvo em primeiroLogue: ",
        dadosPrimLogue
      );
      AddOuAtuIindexdb(ChavePrimLogue, valorEdata);
      dadosPrimLogue = valorEdata;
      console.log(
        "NiceMonk Informação salva para a data de hoje primeiroLogue: ",
        valorEdata
      );
      Segun.LogouSalvo = converterParaSegundos(valorEdata.valor);
    } else {
      Segun.LogouSalvo = converterParaSegundos(dadosPrimLogue.valor);
      console.log(
        "NiceMonk Informação salva em primeiroLogue: ",
        dadosPrimLogue
      );
    }
  }

  function SalvandoVari(a) {
    let AsVari = {
      CConfig: { ...CConfig },
      Ccor: { ...Ccor },
    };

    function ondemudar(x) {
      Object.assign(CConfig, x.CConfig);
      Object.assign(Ccor, x.Ccor);
    }

    switch (a) {
      case 1:
        AddOuAtuIindexdb(ChaveConfig, AsVari);
        ondemudar(AsVari);
        break;

      case 2:
        if (typeof PCConfig !== "undefined" && typeof PCcor !== "undefined") {
          AsVari.CConfig = { ...PCConfig };
          AsVari.Ccor = { ...PCcor };
          AddOuAtuIindexdb(ChaveConfig, AsVari);
          ondemudar(AsVari);
        } else {
          console.warn("PCConfig ou PCcor não estão definidos.");
        }
        break;

      case 3:
        if (typeof dadosSalvosConfi !== "undefined") {
          ondemudar(dadosSalvosConfi);
          console.log(`NiceMonk Dados em ${ChaveConfig}:`, dadosSalvosConfi);
        } else {
          console.log(
            `NiceMonk Não foram encontrados dados em ${ChaveConfig}, restaurado ao padrão:`,
            dadosSalvosConfi
          );
          SalvandoVari(2);
        }
        break;

      default:
        console.warn("Parâmetro inválido para SalvandoVari:", a);
    }
  }

  function salvarDPausas() {
    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split("T")[0];
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const ontemFormatado = ontem.toISOString().split("T")[0];

    const valorEdata = [
      { id: 1, data: hojeFormatado, Ndpausas: 2, StatusANT: "", IPausaS: "" },
    ];

    // Garante que dadosdePausas seja um array
    if (!Array.isArray(dadosdePausas)) {
      dadosdePausas = [];
    }

    const itemComData = dadosdePausas.find((item) => item.id === 1);

    if (!itemComData || itemComData.data !== hojeFormatado) {
      dadosdePausas = [...valorEdata]; // reinicia com os dados padrão
      AddOuAtuIindexdb(ChavePausas, dadosdePausas);
    } else {
      stt.Ndpausas = itemComData.Ndpausas;
      stt.StatusANT = itemComData.StatusANT;
      stt.IPausaS = itemComData.IPausaS;
    }
  }

  function AddouAtualizarPausas(id, pausa, Inicio, Fim, Duracao) {
    const novoItem = { id, pausa, Inicio, Fim, Duracao };

    // Garante que dadosdePausas seja um array
    if (!Array.isArray(dadosdePausas)) {
      dadosdePausas = [];
    }

    const index = dadosdePausas.findIndex((item) => item.id === id);

    if (index !== -1) {
      dadosdePausas[index] = { ...dadosdePausas[index], ...novoItem };
    } else {
      dadosdePausas.push(novoItem);
    }

    AddOuAtuIindexdb(ChavePausas, dadosdePausas);
  }

  function atualizarCampos(id, campo, valor) {
    const index = dadosdePausas.findIndex((item) => item.id === id);

    if (index !== -1) {
      dadosdePausas[index][campo] = valor; // Atualiza o campo dinamicamente
    } else {
      // Cria novo item com o campo e valor fornecidos
      const novoItem = { id };
      novoItem[campo] = valor;
      dadosdePausas.push(novoItem);
    }

    AddOuAtuIindexdb(ChavePausas, dadosdePausas);

    if (campo === "Duracao") {
      console.log(`NiceMonk Tabela salva : `, ChavePausas);
    }
  }

  function removerPausaPorId(id) {
    const index = dadosdePausas.findIndex((item) => item.id === id);

    if (index !== -1) {
      dadosdePausas.splice(index, 1); // Remove o item do array
      AddOuAtuIindexdb(ChavePausas, dadosdePausas); // Atualiza o IndexedDB
      AtuaPausas();
      console.log(`NiceMonk item com id ${id} removido.`);
    } else {
      console.log(`NiceMonk item com id ${id} não encontrado.`);
    }
  }

  function atualizarID1() {
    if (!dadosdePausas) {
      salvarDPausas();
    }
    const index = dadosdePausas.findIndex((item) => item.id === 1);
    if (index !== -1) {
      dadosdePausas[index].Ndpausas = stt.Ndpausas;
      dadosdePausas[index].StatusANT = stt.StatusANT;
      dadosdePausas[index].IPausaS = stt.IPausaS;
    }
    AddOuAtuIindexdb(ChavePausas, dadosdePausas);
  }

  function AtuaPausas() {
    const CPausa = document.getElementById("CPausa");
    const CInicio = document.getElementById("CInicio");
    const CFim = document.getElementById("CFim");
    const CDuracao = document.getElementById("CDuracao");
    const CExcl = document.getElementById("CExcl");

    if (CExcl) {
      CExcl.innerHTML = "";
      CExcl.appendChild(AddTituloCp("Excl"));
    }
    if (CPausa) {
      CPausa.innerHTML = "";
      CPausa.appendChild(AddTituloCp("Pausa"));
    }
    if (CInicio) {
      CInicio.innerHTML = "";
      CInicio.appendChild(AddTituloCp("Início"));
    }
    if (CFim) {
      CFim.innerHTML = "";
      CFim.appendChild(AddTituloCp("Fim"));
    }
    if (CDuracao) {
      CDuracao.innerHTML = "";
      CDuracao.appendChild(AddTituloCp("Duração"));
    }

    function ADDitem(id, campo, valor) {
      const caixa = document.createElement("div");
      caixa.id = `${campo}${id}`;
      caixa.innerHTML = valor;

      if (campo === "id") {
        if (id === 2) {
          caixa.style.cssText = `
                visibility: hidden;
                opacity: 0;
                `;
        } else {
          caixa.style.cssText = `
                cursor: pointer;
                `;
        }
        caixa.addEventListener("click", () => {
          const CaiDPa = document.getElementById("CaiDPa");
          CaiDPa.appendChild(
            ADDCaixaDAviso("Excluir", () => {
              removerPausaPorId(id);
            })
          );
        });
      }

      return caixa;
    }

    if (dadosdePausas && Array.isArray(dadosdePausas)) {
      const ordenado = [...dadosdePausas].sort((a, b) => a.id - b.id);

      ordenado.forEach((item) => {
        if (item.id === 1) return;

        CExcl.appendChild(ADDitem(item.id, "id", "❌"));
        CPausa.appendChild(ADDitem(item.id, "pausa", item.pausa || ""));
        CInicio.appendChild(
          ADDitem(item.id, "inicio", item.Inicio || "<---->")
        );
        CFim.appendChild(ADDitem(item.id, "fim", item.Fim || "<---->"));
        CDuracao.appendChild(
          ADDitem(item.id, "duracao", item.Duracao || "<---->")
        );
      });
    }
  }

  function ADDCaixaDAviso(titulo, funcao) {
    const caixa = document.createElement("div");
    caixa.id = "CaiDeAvi";
    caixa.style.cssText = `
        background: ${Ccor.Principal};
        position: absolute;
        padding: 6px 10px;
        border-radius: 12px;
       display: flex;
        flex-direction: column;
        align-items: center;
        `;
    const Ctitulo = document.createElement("div");
    Ctitulo.innerHTML = titulo;
    Ctitulo.style.cssText = `
            font-size: 14px;
            border-bottom-style: dashed;
            border-width: 1px;
            margin-bottom: 6px;
        `;

    const TC = document.createElement("div");
    TC.style.cssText = `
        margin-bottom: 8px;
        `;

    TC.innerHTML = "Tem Certeza ?";
    const CaixaSouN = document.createElement("div");
    CaixaSouN.style.cssText = `
        display: flex;
        justify-content: space-between;
        width: 100%;
        `;

    function SimouNao(texto) {
      const a = document.createElement("div");
      a.innerHTML = texto;
      a.style.cssText = `
            cursor: pointer;
            border: white 1px solid;
            border-radius: 15px;
            padding: 2px 4px;
           `;
      a.addEventListener("mouseover", function () {
        a.style.background = "white";
        a.style.color = Ccor.Principal;
      });

      a.addEventListener("mouseout", function () {
        a.style.background = "";
        a.style.color = "";
      });
      a.addEventListener("click", function () {
        if (texto === "Sim") {
          funcao();
          caixa.remove();
        } else {
          caixa.remove();
        }
      });
      return a;
    }

    CaixaSouN.appendChild(SimouNao("Sim"));
    CaixaSouN.appendChild(SimouNao("Não"));

    caixa.appendChild(Ctitulo);
    caixa.appendChild(TC);
    caixa.appendChild(CaixaSouN);

    return caixa;
  }

  function tocarBeep() {
    const contextoAudio = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscilador = contextoAudio.createOscillator();
    const ganho = contextoAudio.createGain();

    oscilador.type = "sine"; // Tipo de onda
    oscilador.frequency.setValueAtTime(700, contextoAudio.currentTime); // Frequência em Hz
    ganho.gain.setValueAtTime(0.6, contextoAudio.currentTime); // Volume entre 0.0 e 1.0

    oscilador.connect(ganho);
    ganho.connect(contextoAudio.destination);

    oscilador.start();
    oscilador.stop(contextoAudio.currentTime + 0.5); // Duração de 0.5 segundos
  }

  function RepetirBeep() {
    if (stt.Estouro && CConfig.SomEstouro && !stt.BeepRet) {
      stt.BeepRet = 1;
      setTimeout(function () {
        stt.BeepRet = 0;
        tocarBeep();
        RepetirBeep();
      }, stt.intervaloBeep * 1000);
    }
  }

  // Your code here...
})();
