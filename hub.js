/* Speccy Gaming (hub): hub.js
   A lista de jogos vem só de jogos.json: para publicar um jogo novo, ponha o ícone em img/ e
   acrescente um item no JSON (campos opcionais: "novo": true mostra um selo, "ativo": false esconde).
   Os jogos só apontam para a hub (menu "Outros Jogos"), então não precisam mudar. */
(function () {
  'use strict';

  // ícones e redes sociais vêm do on.js (mesma fonte dos jogos)
  var ON = window.ON;

  function el(tag, cls, texto) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (texto) n.textContent = texto;
    return n;
  }

  function seguro(u) {
    try { return new URL(u, location.href).protocol === 'https:'; } catch (e) { return false; }
  }

  function desenhar(lista) {
    var box = document.getElementById('jogos');
    box.textContent = '';
    lista.forEach(function (j, n) {
      if (!j || !j.nome || j.ativo === false || !seguro(j.url)) return;
      var a = el('a', 'card');
      a.href = j.url;
      a.style.setProperty('--n', n);
      a.setAttribute('aria-label', 'Jogar ' + j.nome);
      if (j.icone) {
        var img = el('img');
        img.src = j.icone; img.alt = ''; img.width = 120; img.height = 120; img.decoding = 'async';
        a.appendChild(img);
      }
      a.appendChild(el('span', 'card-nome', j.nome));
      if (j.tag) a.appendChild(el('span', 'card-tag', j.tag));
      if (j.novo) a.appendChild(el('span', 'card-novo', 'Novo'));
      a.appendChild(el('span', 'card-desc', j.descricao || j.curta || ''));
      a.appendChild(el('span', 'btn btn-primary', 'Jogar'));
      box.appendChild(a);
    });
  }

  function carregar() {
    var cache = null;
    try { cache = JSON.parse(localStorage.getItem('speccy.jogos')); } catch (e) { /* ignora */ }
    if (cache && cache.length) desenhar(cache);
    fetch('jogos.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        if (!d || !Array.isArray(d.jogos) || !d.jogos.length) return;
        try { localStorage.setItem('speccy.jogos', JSON.stringify(d.jogos)); } catch (e) { /* ignora */ }
        desenhar(d.jogos);
      })
      .catch(function () {
        // offline: fica com o que já está na tela; sem cópia nenhuma, avisa
        var box = document.getElementById('jogos');
        if (!box.children.length) box.appendChild(el('p', 'sem-jogos', 'Não consegui carregar a lista de jogos. Confira a conexão e recarregue a página.'));
      });
  }

  function redes() {
    var ul = document.getElementById('redes');
    ON.redes.forEach(function (r) {
      var li = el('li');
      var a = el('a');
      a.href = r[2];
      if (r[3]) { a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML = ON.icone(r[0], 20);
      a.appendChild(el('span', '', r[1]));
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  /* modo escuro (mesma chave de configuração dos jogos, com prefixo da hub) */
  function tema() {
    var btn = document.getElementById('tema-btn');
    var d = document.documentElement;
    btn.innerHTML = ON.iconeTroca('sol', 'lua', d.getAttribute('data-tema') === 'escuro', 20); // mostra o tema atual
    function pintar() {
      var esc = d.getAttribute('data-tema') === 'escuro';
      btn.setAttribute('aria-pressed', String(esc));
      ON.trocar(btn, esc);                                                                         // troca com transição
      var m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute('content', esc ? '#071a33' : '#007ACC');
    }
    btn.addEventListener('click', function () {
      var esc = d.getAttribute('data-tema') !== 'escuro';
      if (esc) d.setAttribute('data-tema', 'escuro'); else d.removeAttribute('data-tema');
      try {
        var c = JSON.parse(localStorage.getItem('speccy.cfg') || '{}');
        c.escuro = esc;
        localStorage.setItem('speccy.cfg', JSON.stringify(c));
      } catch (e) { /* ignora */ }
      pintar();
    });
    pintar();
  }

  carregar();
  redes();
  tema();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./service-worker.js').catch(function () {});
    });
  }
})();
