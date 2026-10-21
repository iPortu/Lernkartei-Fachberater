const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
const data={sources:[{id:'test-source',title:'Testquelle',url:'https://example.org/'}],questions:[{id:'B26-01',area:'A',origin:'B',topic:'Botanik',question:'Testfrage B?',answer:'Lösung B',criteria:[{text:'Merkmal genannt',points:1}],sourceIds:['test-source'],note:'Redaktionell geprüft.'},{id:'A26-01',area:'B',origin:'A',topic:'Boden',question:'Testfrage A?',answer:'Lösung A',criteria:[{text:'Begründung',points:1}],sourceIds:['test-source'],note:''}],exam2026:['B26-01','A26-01']};
function boot(storage={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://trainer.test/',runScripts:'outside-only'});
 const w=dom.window;w.FB2026=data;w.confirm=()=>true;
 for(const [key,value] of Object.entries(storage))w.localStorage.setItem(key,value);
 for(const script of w.document.querySelectorAll('script')){
  const src=script.getAttribute('src');
  if(src==='trainer-2026-data.js')continue;
  require('node:vm').runInContext(src?fs.readFileSync(path.join(root,src),'utf8'):script.textContent,dom.getInternalVMContext());
 }
 return dom;
}
test('new cards join the learning pool without changing legacy ids or stored progress',()=>{
 const legacy={cards:{Aplaceholder:[4,12345]},exams:[{t:123,p:80,n:18}],updated:12345};
 const dom=boot({'kgfb-progress-v1':JSON.stringify(legacy)}),w=dom.window,d=w.document;
 assert.equal(d.getElementById('sTotal').textContent,'187');
 assert.deepEqual(JSON.parse(w.localStorage.getItem('kgfb-progress-v1')),legacy);
 const source=d.getElementById('learnSource');assert.ok(source,'Fragensatz-Filter fehlt');
 d.querySelector('[data-tab="learn"]').click();source.value='B';source.dispatchEvent(new w.Event('change'));
 assert.ok(d.getElementById('learnCard').textContent.includes('Testfrage B?'));
 assert.ok(!d.getElementById('learnCard').textContent.includes('Lösung B'));
 d.getElementById('reveal').click();assert.ok(d.getElementById('learnCard').textContent.includes('Lösung B'));
 dom.window.close();
});
test('written attempt saves text, hides solutions until submission and scores with explicit self review',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 d.getElementById('openWritten').click();
 assert.equal(d.getElementById('tab-exam').hidden,false);
 d.getElementById('writtenKind').value='2026';d.getElementById('writtenStart').click();
 assert.equal(d.querySelectorAll('#writtenBox textarea').length,2);
 assert.equal(d.getElementById('examBox').hidden,true);
 assert.ok(!d.getElementById('writtenBox').textContent.includes('Lösung B'));
 const input=d.querySelector('#writtenBox textarea');input.value='<script>alert(1)</script>Wasseraufnahme';input.dispatchEvent(new w.Event('input'));
 const saved=w.localStorage.getItem('kgfb-written-2026-v1');assert.ok(saved.includes('Wasseraufnahme'));
 d.getElementById('writtenSubmit').click();
 assert.ok(d.getElementById('writtenBox').textContent.includes('Lösung B'));
 assert.equal(d.querySelectorAll('#writtenBox script').length,0);
 const check=d.querySelector('[data-criterion]');check.checked=true;check.dispatchEvent(new w.Event('change'));
 d.getElementById('writtenFinish').click();
 assert.ok(d.getElementById('writtenBox').textContent.includes('1 / 2'));
 assert.equal(JSON.parse(w.localStorage.getItem('kgfb-progress-v1')).exams.length,1);
 assert.equal(JSON.parse(w.localStorage.getItem('kgfb-progress-v1')).exams[0].p,50);
 d.querySelector('[data-tab="overview"]').click();assert.ok(d.getElementById('history').textContent.includes('Schriftlich 2026'));
 dom.window.close();
});
test('a written draft resumes after reload and a rechecked result is not duplicated',()=>{
 let dom=boot(),w=dom.window,d=w.document;
 d.getElementById('writtenStart').click();
 let input=d.querySelector('[data-answer]');input.value='Gespeicherte Antwort';input.dispatchEvent(new w.Event('input'));
 const storage={'kgfb-written-2026-v1':w.localStorage.getItem('kgfb-written-2026-v1')};dom.window.close();
 dom=boot(storage);w=dom.window;d=w.document;
 assert.equal(d.querySelector('[data-answer]').value,'Gespeicherte Antwort');
 d.getElementById('writtenSubmit').click();d.getElementById('writtenFinish').click();
 d.getElementById('writtenReview').click();d.getElementById('writtenFinish').click();
 assert.equal(JSON.parse(w.localStorage.getItem('kgfb-progress-v1')).exams.length,1);
 dom.window.close();
});
test('corrupt written storage falls back to the picker without damaging old learning storage',()=>{
 const previous=JSON.stringify({cards:{old:[3,42]},exams:[],updated:42});
 const dom=boot({'kgfb-written-2026-v1':'{broken','kgfb-progress-v1':previous});
 assert.ok(dom.window.document.getElementById('writtenStart'));
 assert.equal(dom.window.localStorage.getItem('kgfb-progress-v1'),previous);dom.window.close();
});
test('overview area shortcuts reset a previously selected question-set filter',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 const source=d.getElementById('learnSource');source.value='A';
 d.querySelector('.area[data-a="A"]').click();
 assert.equal(source.value,'all');assert.ok(!d.getElementById('learnCard').textContent.includes('Nichts fällig'));
 d.querySelector('[data-tab="overview"]').click();source.value='B';d.getElementById('startDue').click();assert.equal(source.value,'all');
 dom.window.close();
});
test('the trainer has its own accessible logo and favicon',()=>{
 const dom=boot(),d=dom.window.document;
 const logo=d.querySelector('header.top img');assert.ok(logo,'Eigenes Logo im Kopfbereich fehlt');
 assert.equal(logo.getAttribute('src'),'assets/lerntrainer-logo.svg');assert.ok(logo.alt.includes('Lerntrainer'));
 assert.equal(d.querySelector('link[rel="icon"]').getAttribute('href'),'assets/lerntrainer-logo.svg');
 dom.window.close();
});
module.exports={boot};
