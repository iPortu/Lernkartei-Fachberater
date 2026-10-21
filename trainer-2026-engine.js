/* Pure selection and assessment rules. Also usable by the Node test runner. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Trainer2026=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function selectQuestions(data,kind){
  if(kind==='A'||kind==='B')return data.questions.filter(q=>q.origin===kind);
  if(kind==='2026'){
   const byId=new Map(data.questions.map(q=>[q.id,q]));
   return data.exam2026.map(id=>{if(!byId.has(id))throw new Error('Unbekannte Frage: '+id);return byId.get(id);});
  }
  throw new Error('Unbekannter Übungssatz: '+kind);
 }
 function assess(questions,checks){
  const result={earned:0,max:0,percent:0,areas:{}};
  for(const q of questions){
   const area=result.areas[q.area]||(result.areas[q.area]={earned:0,max:0});
   q.criteria.forEach((criterion,i)=>{
    const earned=checks[q.id]?.[i]===true?criterion.points:0;
    result.max+=criterion.points;result.earned+=earned;
    area.max+=criterion.points;area.earned+=earned;
   });
  }
  result.percent=result.max?Math.round(100*result.earned/result.max):0;
  return result;
 }
 function restoreDraft(raw,data){
  try{
   const draft=JSON.parse(raw);
   if(!draft||draft.version!==1||!['A','B','2026'].includes(draft.kind)||!['writing','review','result'].includes(draft.phase)||!Number.isFinite(draft.startedAt))return null;
   const qs=selectQuestions(data,draft.kind),ids=new Set(qs.map(q=>q.id));
   if(!draft.answers||Array.isArray(draft.answers)||typeof draft.answers!=='object'||!draft.checks||Array.isArray(draft.checks)||typeof draft.checks!=='object')return null;
   if(Object.entries(draft.answers).some(([id,text])=>!ids.has(id)||typeof text!=='string'))return null;
   if(Object.entries(draft.checks).some(([id,values])=>!ids.has(id)||!Array.isArray(values)||values.some(v=>typeof v!=='boolean')))return null;
   return draft;
  }catch(_){return null;}
 }
 function filterCards(cards,kind,data){
  if(kind==='base')return cards.filter(c=>!c.origin);
  if(kind==='A'||kind==='B')return cards.filter(c=>c.origin===kind);
  if(kind==='2026'){const ids=new Set(data.exam2026);return cards.filter(c=>ids.has(c.id));}
  return cards.slice();
 }
 return {selectQuestions,assess,restoreDraft,filterCards};
});
