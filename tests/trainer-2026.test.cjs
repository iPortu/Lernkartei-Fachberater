const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const enginePath = path.join(__dirname, '..', 'trainer-2026-engine.js');
const load = () => { assert.ok(fs.existsSync(enginePath), '2026 engine is not implemented'); return require(enginePath); };
const fixture = {questions:[{id:'B26-01',area:'A',origin:'B',question:'Testfrage B',answer:'Testlösung',criteria:[{text:'Kriterium',points:1}],sourceIds:[]},{id:'A26-01',area:'B',origin:'A',question:'Testfrage A',answer:'Testlösung',criteria:[{text:'Erstens',points:1},{text:'Zweitens',points:1}],sourceIds:[]}],exam2026:['A26-01','B26-01'],sources:[]};
test('paper selection preserves the fixed mixed order and does not mutate data', () => {
 const engine=load();
 assert.deepEqual(engine.selectQuestions(fixture,'2026').map(q=>q.id),['A26-01','B26-01']);
 assert.deepEqual(engine.selectQuestions(fixture,'B').map(q=>q.id),['B26-01']);
 assert.deepEqual(engine.selectQuestions(fixture,'A').map(q=>q.id),['A26-01']);
 assert.equal(fixture.questions.length,2);
 assert.throws(()=>engine.selectQuestions(fixture,'official'));
});
test('self assessment counts only explicit checked criteria and includes unanswered questions',()=>{
 const engine=load();
 const result=engine.assess(fixture.questions, {'A26-01':[true,false], 'B26-01':[true]});
 assert.deepEqual(result,{earned:2,max:3,percent:67,areas:{A:{earned:1,max:1},B:{earned:1,max:2}}});
 assert.equal(engine.assess(fixture.questions,{}).earned,0);
 assert.equal(engine.assess(fixture.questions,{'A26-01':[false,true,true,true]}).earned,1);
 assert.equal(engine.assess(fixture.questions,{'A26-01':['yes',1]}).earned,0);
});
test('draft validation rejects stale versions and unknown question ids without breaking stored learning',()=>{
 const engine=load();
 const draft={version:1,kind:'2026',phase:'writing',answers:{'B26-01':'meine Antwort'},checks:{},startedAt:123};
 assert.equal(engine.restoreDraft(JSON.stringify(draft),fixture).answers['B26-01'],'meine Antwort');
 for(const bad of ['{broken','null',JSON.stringify({...draft,kind:'official'}),JSON.stringify({...draft,version:99}),JSON.stringify({...draft,answers:{stranger:'x'}}),JSON.stringify({...draft,answers:{'B26-01':23}}),JSON.stringify({...draft,phase:'unknown'})])assert.equal(engine.restoreDraft(bad,fixture),null);
});
test('learning filters keep the original pool distinct from A, B and mixed 2026',()=>{
 const engine=load(); const cards=[{id:'old'},{id:'B26-01',origin:'B'},{id:'A26-01',origin:'A'}];
 assert.deepEqual(engine.filterCards(cards,'base',fixture).map(q=>q.id),['old']);
 assert.deepEqual(engine.filterCards(cards,'A',fixture).map(q=>q.id),['A26-01']);
 assert.equal(engine.filterCards(cards,'2026',fixture).length,2);
 assert.equal(engine.filterCards(cards,'all',fixture).length,3);
});
