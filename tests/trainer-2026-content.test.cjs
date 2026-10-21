const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
test('the complete legacy card content is preserved byte for byte',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),raw=html.match(/const RAW=\[([\s\S]*?)\n\];/)[1];
 assert.equal(require('node:crypto').createHash('sha256').update(raw).digest('hex'),'147917f269f305affc4f623e734491d51830c76f93cf40f59074d23f1eda2abe');
});
function readData(){const filename=path.join(root,'trainer-2026-data.js');assert.ok(fs.existsSync(filename),'The verified question catalog is not integrated');const ctx={window:{}};vm.runInNewContext(fs.readFileSync(filename,'utf8'),ctx);return JSON.parse(JSON.stringify(ctx.window.FB2026));}
test('production content contains all 26 B and 26 derived A questions, with sources and valid criteria',()=>{
 const data=readData(),allIds=new Set(),sourceIds=new Set(data.sources.map(s=>s.id));
 const expected={A:3,B:3,N:4,P:3,Z:3,O:4,G:3,K:1,R:2};
 for(const origin of ['A','B']){
  const questions=data.questions.filter(q=>q.origin===origin);assert.equal(questions.length,26);
  const counts={};for(const q of questions){counts[q.area]=(counts[q.area]||0)+1;assert.match(q.id,new RegExp('^'+origin+'26-\\d{2}$'));assert.ok(!allIds.has(q.id));allIds.add(q.id);for(const key of ['topic','question','answer','note'])assert.ok(q[key].trim());assert.ok(q.criteria.length);for(const criterion of q.criteria){assert.equal(criterion.points,1);assert.ok(criterion.text.trim());}assert.ok(q.sourceIds.length);q.sourceIds.forEach(id=>assert.ok(sourceIds.has(id)));}
  assert.deepEqual(counts,expected);
 }
 assert.equal(data.questions.length,52);assert.equal(allIds.size,52);
 for(const source of data.sources){assert.ok(source.title);assert.equal(new URL(source.url).protocol,'https:');}
});
test('2026 is an explicit mixed paper covering all nine areas without duplicate questions',()=>{
 const data=readData(),engine=require('../trainer-2026-engine.js'),qs=engine.selectQuestions(data,'2026');
 assert.equal(qs.length,26);assert.equal(new Set(qs.map(q=>q.id)).size,26);assert.equal(new Set(qs.map(q=>q.area)).size,9);assert.equal(qs.filter(q=>q.origin==='A').length,13);assert.equal(qs.filter(q=>q.origin==='B').length,13);
 for(const [kind,max] of [['A',83],['B',85],['2026',87]])assert.equal(engine.assess(engine.selectQuestions(data,kind),{}).max,max);
});
