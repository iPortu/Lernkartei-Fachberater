/* Written practice stays local; it does not call an AI or a remote grading service. */
(function(){
 'use strict';
 const data=window.FB2026,engine=window.Trainer2026,box=document.getElementById('writtenBox');
 if(!data||!engine){box.innerHTML='<div class="feedback no">Die Trainingsdaten fehlen. Bitte die vollständige Ausgabe inklusive trainer-2026-data.js öffnen.</div>';return;}
 const KEY='kgfb-written-2026-v1';
 const titles={B:'B · Vorlage vom 15.10.2026',A:'A · abgeleiteter Übungssatz','2026':'2026 · gemischte Trainingsvariante'};
 let draft=null;
 try{draft=engine.restoreDraft(localStorage.getItem(KEY),data);}catch(_){}
 function persist(){
  let ok=true;try{localStorage.setItem(KEY,JSON.stringify(draft));}catch(_){ok=false;}
  const note=box.querySelector('#writtenSave');if(note)note.textContent=ok?'Entwurf auf diesem Gerät gespeichert.':'Speichern nicht möglich. Bitte Antworten exportieren, bevor du die Seite verlässt.';
  return ok;
 }
 function points(q){return q.criteria.reduce((sum,c)=>sum+c.points,0);}
 function questions(){return engine.selectQuestions(data,draft.kind);}
 function sourceLinks(q){return (q.sourceIds||[]).map(id=>data.sources.find(s=>s.id===id)).filter(Boolean).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join(' · ');}
 function start(){
  const kind=document.getElementById('writtenKind').value;
  draft={version:1,kind,phase:'writing',answers:{},checks:{},startedAt:Date.now()};persist();render();
 }
 function landing(){
  document.getElementById('examBox').hidden=false;
  box.innerHTML=`<div class="panel edition-panel"><span class="eyebrow">Schriftlicher Trainer · 2026</span><h2>Erst antworten. Dann vergleichen.</h2>
  <p>Kurze offene Fragen wie in deiner Vorlage: nennen, erklären, zuordnen. Formuliere deine Antworten in eigenen Worten. Erst nach der Abgabe werden Musterlösungen und Bewertungskriterien sichtbar.</p>
  <label for="writtenKind">Übungssatz</label><select id="writtenKind"><option value="2026">2026 · gemischte Trainingsvariante</option><option value="B">B · Vorlage vom 15.10.2026</option><option value="A">A · abgeleiteter Übungssatz</option></select>
  <p id="writtenDescription" class="small muted"></p><button class="btn primary" id="writtenStart">Schriftliches Training starten</button>
  <p class="small muted">Alle drei Sätze sind Übungsmaterial, keine offizielle Prüfung. A ist eigenständig aus dem Themenprofil von B abgeleitet, nicht die echte Prüfung A. Punkte und Richtzeit sind Trainingsvorschläge, keine offizielle Bewertung. Rechts- und Verbandsfragen beziehen sich auf Bayern.</p>
  <details><summary>Was wurde aus der Vorlage übernommen?</summary><p class="small">B enthält die Fragen deiner übergebenen Vorlage, redaktionell überarbeitet und mit fachlich geprüften Musterantworten. 2026 mischt Fragen aus A und B. Die neue Ausgabe ergänzt den Grundstock; sie ersetzt ihn nicht. Einige Antworten der Vorlage wurden berichtigt. Hinweise und Quellen stehen nach der Abgabe bei der jeweiligen Frage.</p></details></div>`;
  const selector=document.getElementById('writtenKind');
  selector.onchange=()=>{const qs=engine.selectQuestions(data,selector.value),total=qs.reduce((n,q)=>n+points(q),0);document.getElementById('writtenDescription').textContent=`${qs.length} Fragen · ${total} mögliche Trainingspunkte · frei gewählte Richtzeit: 45 Minuten. Ohne Countdown oder automatische Abgabe.`;};
  selector.onchange();document.getElementById('writtenStart').onclick=start;
 }
 function header(){
  return `<div class="panel edition-panel"><span class="eyebrow">${draft.phase==='writing'?'Schriftliche Antworten':draft.phase==='review'?'Musterlösungen & Selbstbewertung':'Auswertung'}</span><h2>${esc(titles[draft.kind])}</h2>
  <p class="small muted">${questions().length} Fragen · Übung, nicht offiziell. ${draft.phase==='writing'?'Deine Antworten werden lokal gespeichert. Lösungen erst nach Abgabe.':'Bewerte nur, was tatsächlich in deiner eigenen Antwort steht. Sinngleiche Formulierungen zählen. Keine automatische KI-Benotung.'}</p>
  <p class="small muted" id="writtenSave" role="status" aria-live="polite"></p>
  <div class="row"><button class="btn" id="writtenExport">Antworten exportieren</button><button class="btn" id="writtenPrint">Drucken</button><button class="btn" id="writtenReset">Anderen Satz wählen</button></div></div>`;
 }
 function questionHTML(q,index,review){
  return `<article class="panel written-question" id="written-${esc(q.id)}"><div class="meta row"><span class="chip">${esc(AREA[q.area].name)}</span><span class="small muted">${points(q)} ${points(q)===1?'Punkt':'Punkte'} · ${esc(q.id)}</span></div><h3>${index+1}. ${esc(q.question)}</h3>
  <span class="small muted">${q.origin==='B'?'Vorlage B · redaktionell überarbeitet':'Übung A · eigenständig abgeleitet'}</span>
  ${review?`<div class="own-answer"><strong>Deine Antwort</strong><p>${esc(draft.answers[q.id]||'Keine Antwort notiert.')}</p></div>
  <div class="model-answer"><strong>Musterlösung</strong><p>${esc(q.answer)}</p></div>
  ${q.note?`<div class="feedback small">${esc(q.note)}</div>`:''}
  <fieldset class="criteria"><legend>Selbstbewertung · passende Aussagen deiner Antwort ankreuzen</legend>${q.criteria.map((c,i)=>`<label><input type="checkbox" data-question="${esc(q.id)}" data-criterion="${i}" ${draft.checks[q.id]?.[i]===true?'checked':''}> <span>${esc(c.text)} <small>(${c.points} ${c.points===1?'Punkt':'Punkte'})</small></span></label>`).join('')}</fieldset>
  <details class="small"><summary>Fachquellen zur Musterlösung</summary><div class="source-links">${sourceLinks(q)}</div></details>`:
  `<label for="answer-${esc(q.id)}">Deine schriftliche Antwort</label><textarea id="answer-${esc(q.id)}" data-answer="${esc(q.id)}" rows="4" placeholder="Stichpunkte oder kurze Sätze …">${esc(draft.answers[q.id]||'')}</textarea>`}</article>`;
 }
 function bindCommon(){
  document.getElementById('writtenReset').onclick=()=>{
   if(!window.confirm('Diesen schriftlichen Entwurf verwerfen und einen anderen Satz wählen? Dein Karteikarten-Fortschritt bleibt erhalten.'))return;
   draft=null;try{localStorage.removeItem(KEY);}catch(_){}landing();
  };
  document.getElementById('writtenPrint').onclick=()=>window.print();
  document.getElementById('writtenExport').onclick=()=>{
   const text=[titles[draft.kind],'Übungsmaterial · keine offizielle Prüfung','',...questions().map((q,i)=>`${i+1}. ${q.question}\nMeine Antwort:\n${draft.answers[q.id]||'—'}${draft.phase==='writing'?'':`\nMusterlösung:\n${q.answer}`}\n`)].join('\n');
   const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=`fachberater-${draft.kind}-antworten.txt`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
 }
 function renderResult(){
  const result=engine.assess(questions(),draft.checks);
  const weak=Object.entries(result.areas).filter(([,r])=>r.earned/r.max<0.6).map(([id])=>id);
  box.innerHTML=header()+`<div class="panel"><span class="eyebrow">Deine Selbsteinschätzung</span><h2><span class="num">${result.earned} / ${result.max}</span> Trainingspunkte</h2><p class="num">${result.percent} %</p><p class="muted">Kein offizielles Prüfungsergebnis und keine Bestehensprognose. Auch unbeantwortete Fragen zählen zur Gesamtpunktzahl.</p>
  <div class="stack">${Object.entries(result.areas).map(([id,r])=>`<div class="result-row"><span>${esc(AREA[id].name)}</span><span class="num">${r.earned}/${r.max}</span></div>`).join('')}</div>
  <p>${weak.length?'Nächste Lernschwerpunkte: '+esc(weak.map(id=>AREA[id].name).join(', '))+'.':'Du hast in jedem Bereich mindestens 60 % selbst bewertet. Wiederhole zur Kontrolle ohne Musterlösung.'}</p>
  <div class="row"><button class="btn primary" id="writtenRepeat">Diesen Satz erneut schreiben</button><button class="btn" id="writtenReview">Antworten und Lösungen ansehen</button></div></div>`;
  bindCommon();
  document.getElementById('writtenReview').onclick=()=>{draft.phase='review';persist();render();};
  document.getElementById('writtenRepeat').onclick=()=>{
   if(!window.confirm('Neuen Versuch starten? Die bisherigen Antworten werden ersetzt; das gespeicherte Ergebnis bleibt erhalten.'))return;
   draft={version:1,kind:draft.kind,phase:'writing',answers:{},checks:{},startedAt:Date.now()};persist();render();
  };
  persist();
 }
 function render(){
  document.getElementById('examBox').hidden=Boolean(draft);
  if(!draft)return landing();
  if(draft.phase==='result')return renderResult();
  const review=draft.phase==='review';
  box.innerHTML=header()+questions().map((q,i)=>questionHTML(q,i,review)).join('')+
   `<div class="panel">${review?'<p>Die Auswahl der Kriterien ist deine ehrliche Selbsteinschätzung. Nicht angekreuzte Kriterien ergeben 0 Punkte.</p><button class="btn primary" id="writtenFinish">Selbstbewertung abschließen</button>':'<p id="writtenCount" class="small muted"></p><p class="small muted">Nach der Abgabe kannst du deine Antworten nicht mehr bearbeiten. Unbeantwortete Fragen bleiben im Ergebnis enthalten.</p><button class="btn primary" id="writtenSubmit">Abgeben und Musterlösungen öffnen</button>'}</div>`;
  bindCommon();
  if(!review){
   const counter=()=>{document.getElementById('writtenCount').textContent=`${questions().filter(q=>(draft.answers[q.id]||'').trim()).length} von ${questions().length} Antworten notiert.`;};
   box.querySelectorAll('[data-answer]').forEach(input=>input.oninput=()=>{draft.answers[input.dataset.answer]=input.value;persist();counter();});
   counter();document.getElementById('writtenSubmit').onclick=()=>{draft.phase='review';draft.submittedAt=Date.now();persist();render();box.scrollIntoView?.({block:'start'});};
  }else{
   box.querySelectorAll('[data-criterion]').forEach(input=>input.onchange=()=>{const id=input.dataset.question;const checked=draft.checks[id]||(draft.checks[id]=questions().find(q=>q.id===id).criteria.map(()=>false));checked[Number(input.dataset.criterion)]=input.checked;persist();});
   document.getElementById('writtenFinish').onclick=()=>{
    const result=engine.assess(questions(),draft.checks);
    const attemptId='written-'+draft.startedAt;
    const previous=state.exams.find(e=>e.attemptId===attemptId);
    const entry={t:Date.now(),p:result.percent,n:questions().length,kind:draft.kind,earned:result.earned,max:result.max,attemptId};
    if(previous)Object.assign(previous,entry);else state.exams.push(entry);
    save();draft.phase='result';persist();render();box.scrollIntoView?.({block:'start'});
   };
  }
  persist();
 }
 document.getElementById('openWritten').onclick=()=>{show('exam');box.scrollIntoView?.({block:'start'});};
 render();
})();
