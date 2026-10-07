/*
 * ECS Chat Widget — floating chat bubble for excellencecodesolution.tech
 * Usage:
 *   <script src="/ecs-chat-widget.js" data-api="https://YOUR-BACKEND.onrender.com"></script>
 * or set  window.ECS_CHAT_API = "https://YOUR-BACKEND.onrender.com"  before loading.
 */
(function () {
  if (window.__ecsChatLoaded) return;
  window.__ecsChatLoaded = true;

  var script = document.currentScript;
  var API_BASE = (
    (script && script.dataset && script.dataset.api) ||
    window.ECS_CHAT_API ||
    window.location.origin
  ).replace(/\/+$/, "");

  var STORAGE_KEY = "ecs_chat_session";
  var GREETING =
    "Hi! 👋 I'm the ECS assistant. Ask me about our services, trainings, portfolio, team, or how to book a demo.";
  var QUICK = ["Your services", "Training fees", "Book a demo", "Portfolio"];

  function getSession() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setSession(id) {
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) {}
  }
  var sessionId = getSession();

  // ------------------------------------------------------------ styles
  var css = `
  .ecs-chat, .ecs-chat * { box-sizing: border-box; font-family: inherit; }
  .ecs-chat { --ecs-primary:#8159af; --ecs-primary-dark:#6a4593; --ecs-bg:#ffffff; --ecs-text:#1f1f29;
    --ecs-muted:#6b6b7b; --ecs-bot:#f3eff8; --ecs-border:#e6e1ee;
    position:fixed; right:20px; bottom:20px; z-index:2147483000; font-size:15px; line-height:1.45; }
  @media (prefers-color-scheme: dark) {
    .ecs-chat { --ecs-bg:#17161c; --ecs-text:#ecebf1; --ecs-muted:#a3a1b0; --ecs-bot:#26232f; --ecs-border:#2f2c38; }
  }
  .ecs-chat__btn { width:60px; height:60px; border-radius:50%; border:none; cursor:pointer; background:var(--ecs-primary);
    color:#fff; display:grid; place-items:center; box-shadow:0 8px 24px rgba(129,89,175,.45); transition:transform .2s, background .2s; }
  .ecs-chat__btn:hover { background:var(--ecs-primary-dark); transform:scale(1.05); }
  .ecs-chat__btn svg { width:28px; height:28px; }
  .ecs-chat__panel { position:absolute; right:0; bottom:76px; width:370px; height:540px; max-height:calc(100vh - 110px);
    background:var(--ecs-bg); color:var(--ecs-text); border:1px solid var(--ecs-border); border-radius:18px;
    box-shadow:0 18px 50px rgba(0,0,0,.22); display:none; flex-direction:column; overflow:hidden; }
  .ecs-chat--open .ecs-chat__panel { display:flex; animation:ecs-pop .18s ease-out; }
  @keyframes ecs-pop { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  .ecs-chat__head { background:var(--ecs-primary); color:#fff; padding:14px 16px; display:flex; align-items:center; gap:10px; }
  .ecs-chat__avatar { width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.2); display:grid; place-items:center; font-weight:700; font-size:13px; }
  .ecs-chat__title { font-weight:600; font-size:15px; }
  .ecs-chat__sub { font-size:12px; opacity:.85; }
  .ecs-chat__close { margin-left:auto; background:none; border:none; color:#fff; font-size:22px; cursor:pointer; line-height:1; padding:4px; }
  .ecs-chat__body { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
  .ecs-msg { max-width:85%; padding:10px 13px; border-radius:14px; white-space:pre-wrap; word-wrap:break-word; }
  .ecs-msg--bot { background:var(--ecs-bot); align-self:flex-start; border-bottom-left-radius:4px; white-space:normal; max-width:92%; }
  .ecs-msg--bot p { margin:0 0 8px; } .ecs-msg--bot p:last-child { margin-bottom:0; }
  .ecs-msg--bot .ecs-h { font-weight:700; margin-top:4px; }
  .ecs-msg--bot ul, .ecs-msg--bot ol { margin:0 0 8px; padding-left:20px; }
  .ecs-msg--bot ul:last-child, .ecs-msg--bot ol:last-child { margin-bottom:0; }
  .ecs-msg--bot li { margin:3px 0; }
  .ecs-msg--bot li.ecs-sub { margin-left:16px; list-style-type:circle; font-size:14px; }
  .ecs-msg--bot code { background:rgba(129,89,175,.12); padding:1px 5px; border-radius:4px; font-size:13px; }
  .ecs-table { overflow-x:auto; margin:4px 0 8px; border:1px solid var(--ecs-border); border-radius:10px; }
  .ecs-table table { border-collapse:collapse; width:100%; font-size:13px; }
  .ecs-table th, .ecs-table td { padding:7px 9px; text-align:left; border-bottom:1px solid var(--ecs-border); vertical-align:top; white-space:nowrap; }
  .ecs-table th { background:var(--ecs-primary); color:#fff; font-weight:600; }
  .ecs-table tr:last-child td { border-bottom:none; }
  .ecs-msg--user { background:var(--ecs-primary); color:#fff; align-self:flex-end; border-bottom-right-radius:4px; }
  .ecs-msg a { color:inherit; text-decoration:underline; }
  .ecs-msg--bot a { color:var(--ecs-primary); }
  .ecs-quick { display:flex; flex-wrap:wrap; gap:6px; }
  .ecs-quick button { border:1px solid var(--ecs-primary); color:var(--ecs-primary); background:transparent; border-radius:999px;
    padding:6px 12px; font-size:13px; cursor:pointer; }
  .ecs-quick button:hover { background:var(--ecs-primary); color:#fff; }
  .ecs-typing { display:inline-flex; gap:4px; }
  .ecs-typing span { width:7px; height:7px; border-radius:50%; background:var(--ecs-muted); animation:ecs-blink 1.2s infinite; }
  .ecs-typing span:nth-child(2){ animation-delay:.2s } .ecs-typing span:nth-child(3){ animation-delay:.4s }
  @keyframes ecs-blink { 0%,80%,100%{opacity:.25} 40%{opacity:1} }
  .ecs-chat__form { display:flex; gap:8px; padding:12px; border-top:1px solid var(--ecs-border); }
  .ecs-chat__input { flex:1; border:1px solid var(--ecs-border); background:var(--ecs-bg); color:var(--ecs-text);
    border-radius:12px; padding:10px 12px; font-size:15px; outline:none; }
  .ecs-chat__input:focus { border-color:var(--ecs-primary); }
  .ecs-chat__send { border:none; background:var(--ecs-primary); color:#fff; border-radius:12px; padding:0 14px; cursor:pointer; }
  .ecs-chat__send:disabled { opacity:.5; cursor:default; }
  .ecs-chat__foot { text-align:center; font-size:11px; color:var(--ecs-muted); padding:0 0 8px; }
  @media (max-width: 480px) {
    .ecs-chat { right:12px; bottom:12px; }
    .ecs-chat__panel { position:fixed; inset:0; width:100%; height:100%; max-height:none; border-radius:0; bottom:0; }
  }`;
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ------------------------------------------------------------ markup
  var root = document.createElement("div");
  root.className = "ecs-chat";
  root.innerHTML =
    '<div class="ecs-chat__panel" role="dialog" aria-label="ECS chat">' +
      '<div class="ecs-chat__head">' +
        '<div class="ecs-chat__avatar">ECS</div>' +
        '<div><div class="ecs-chat__title">ECS Assistant</div><div class="ecs-chat__sub">Usually replies instantly</div></div>' +
        '<button class="ecs-chat__close" aria-label="Close chat">&times;</button>' +
      "</div>" +
      '<div class="ecs-chat__body"></div>' +
      '<form class="ecs-chat__form">' +
        '<input class="ecs-chat__input" type="text" placeholder="Type your question…" maxlength="1000" autocomplete="off" />' +
        '<button class="ecs-chat__send" type="submit" aria-label="Send">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>' +
        "</button>" +
      "</form>" +
      '<div class="ecs-chat__foot">AI assistant · answers may need confirmation</div>' +
    "</div>" +
    '<button class="ecs-chat__btn" aria-label="Open chat">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
    "</button>";
  document.body.appendChild(root);

  var body = root.querySelector(".ecs-chat__body");
  var form = root.querySelector(".ecs-chat__form");
  var input = root.querySelector(".ecs-chat__input");
  var sendBtn = root.querySelector(".ecs-chat__send");
  var started = false;
  var busy = false;

  // ------------------------------------------------------------ helpers
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // ---- tiny Markdown renderer (text is HTML-escaped first, so it is safe)
  function inline(str) {
    var tokens = [];
    function keep(html) { tokens.push(html); return "\u0000" + (tokens.length - 1) + "\u0000"; }
    str = str.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (m, t, u) {
      return keep('<a href="' + u + '" target="_blank" rel="noopener">' + t + "</a>");
    });
    str = str.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, function (u) {
      return keep('<a href="' + u + '" target="_blank" rel="noopener">' + u + "</a>");
    });
    str = str.replace(/([\w.+-]+@[\w-]+\.[\w.-]*\w)/g, function (e) {
      return keep('<a href="mailto:' + e + '">' + e + "</a>");
    });
    str = str.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    str = str.replace(/`([^`]+)`/g, "<code>$1</code>");
    return str.replace(/\u0000(\d+)\u0000/g, function (m, i) { return tokens[+i]; });
  }
  function cells(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (c) { return c.trim(); });
  }
  function format(text) {
    var lines = escapeHtml(text.replace(/\r/g, "")).split("\n");
    var out = [], para = [], i = 0;
    function flush() { if (para.length) { out.push("<p>" + para.map(inline).join("<br>") + "</p>"); para = []; } }
    while (i < lines.length) {
      var line = lines[i];
      // table: header row followed by |---|---|
      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        flush();
        var head = cells(line), rows = [];
        i += 2;
        while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(cells(lines[i])); i++; }
        var t = '<div class="ecs-table"><table><thead><tr>' +
          head.map(function (h) { return "<th>" + inline(h) + "</th>"; }).join("") + "</tr></thead><tbody>";
        rows.forEach(function (r) { t += "<tr>" + r.map(function (c) { return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>"; });
        out.push(t + "</tbody></table></div>");
        continue;
      }
      // heading
      var h = line.match(/^\s*#{1,6}\s+(.*)$/);
      if (h) { flush(); out.push('<p class="ecs-h">' + inline(h[1]) + "</p>"); i++; continue; }
      // bullet or numbered list
      if (/^\s*([-*•]|\d+[.)])\s+/.test(line)) {
        flush();
        var ordered = /^\s*\d+[.)]\s+/.test(line);
        var html = ordered ? "<ol>" : "<ul>";
        while (i < lines.length && (ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*•]\s+/).test(lines[i])) {
          var indent = lines[i].match(/^\s*/)[0].length;
          var item = lines[i].replace(/^\s*([-*•]|\d+[.)])\s+/, "");
          html += "<li" + (indent >= 2 ? ' class="ecs-sub"' : "") + ">" + inline(item) + "</li>";
          i++;
        }
        out.push(html + (ordered ? "</ol>" : "</ul>"));
        continue;
      }
      if (!line.trim()) { flush(); i++; continue; }
      para.push(line);
      i++;
    }
    flush();
    return out.join("");
  }
  function scrollDown() { body.scrollTop = body.scrollHeight; }
  function scrollToTop(el) {
    var offset = el.getBoundingClientRect().top - body.getBoundingClientRect().top;
    body.scrollTo({ top: body.scrollTop + offset - 12, behavior: "smooth" });
  }
  function addMsg(text, who) {
    var el = document.createElement("div");
    el.className = "ecs-msg ecs-msg--" + who;
    if (who === "bot") el.innerHTML = format(text);
    else el.textContent = text;
    body.appendChild(el);
    if (who === "user") scrollDown();
    return el;
  }
  function addQuick() {
    var wrap = document.createElement("div");
    wrap.className = "ecs-quick";
    QUICK.forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.onclick = function () { wrap.remove(); send(q); };
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
  }
  function setBusy(v) { busy = v; sendBtn.disabled = v; }

  function open() {
    root.classList.add("ecs-chat--open");
    if (!started) { started = true; addMsg(GREETING, "bot"); addQuick(); }
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() { root.classList.remove("ecs-chat--open"); }

  async function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    var userEl = addMsg(text, "user");
    input.value = "";
    setBusy(true);
    var typing = document.createElement("div");
    typing.className = "ecs-msg ecs-msg--bot";
    typing.innerHTML = '<span class="ecs-typing"><span></span><span></span><span></span></span>';
    body.appendChild(typing);
    scrollDown();
    try {
      var res = await fetch(API_BASE + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      if (data.session_id) { sessionId = data.session_id; setSession(sessionId); }
      typing.remove();
      addMsg(data.answer || "Sorry, I couldn't find an answer.", "bot");
      scrollToTop(userEl);
    } catch (err) {
      typing.remove();
      addMsg(
        "Sorry, I can't connect right now. Please email hello@excellencecodesolution.tech or call +92 320 4581181.",
        "bot"
      );
      scrollToTop(userEl);
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  root.querySelector(".ecs-chat__btn").onclick = function () {
    root.classList.contains("ecs-chat--open") ? close() : open();
  };
  root.querySelector(".ecs-chat__close").onclick = close;
  form.onsubmit = function (e) { e.preventDefault(); send(input.value); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
})();
