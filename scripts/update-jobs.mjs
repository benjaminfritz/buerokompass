import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function jobIdentity(url){
 const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password)throw new Error('HTTPS original job URL required.');
 const host=u.hostname.toLowerCase();
 if((host==='indeed.com'||host.endsWith('.indeed.com'))&&/^[a-f0-9]{16}$/.test(u.searchParams.get('jk')||u.searchParams.get('vjk')||'')){const key=u.searchParams.get('jk')||u.searchParams.get('vjk');return{id:`indeed-${key}`,source:'Indeed',url:`https://de.indeed.com/viewjob?jk=${key}`};}
 if(host==='stepstone.de'||host.endsWith('.stepstone.de')){const m=u.pathname.match(/--(\d+)-(?:inline|stepstone)\.html$/);if(m){u.search='';u.hash='';return{id:`stepstone-${m[1]}`,source:'Stepstone',url:u.toString()};}}
 if(host==='arbeitsagentur.de'||host.endsWith('.arbeitsagentur.de')){const m=u.pathname.match(/^\/jobsuche\/jobdetail\/([A-Za-z0-9_-]+)\/?$/);if(m)return{id:`ba-${m[1]}`,source:'Arbeitsagentur',url:`https://www.arbeitsagentur.de/jobsuche/jobdetail/${m[1]}`};}
 throw new Error('A direct original listing from one of the three portals is required.');
}
export function mergeResearch(existing,previous,input){
 if(!input||!Array.isArray(input.jobs)||!Array.isArray(input.sources))throw new Error('Expected jobs and source results.');
 const time=Date.parse(input.searchedAt);if(!Number.isFinite(time)||time>Date.now()+300000)throw new Error('Invalid research timestamp.');
 const names=['Stepstone','Indeed','Arbeitsagentur'];if(input.sources.length!==3||new Set(input.sources.map(s=>s.name)).size!==3)throw new Error('All three source statuses are required.');
 for(const s of input.sources){if(!names.includes(s.name)||!['success','partial','failed'].includes(s.status))throw new Error('Invalid source status.');}
 const next=existing.map(j=>({...j})),byId=new Map(next.map(j=>[j.id,j]));let added=0,updated=0;
 for(const candidate of input.jobs){const identity=jobIdentity(candidate.url);if(candidate.source!==identity.source)throw new Error('Source does not match job URL.');for(const key of ['title','company','location'])if(typeof candidate[key]!=='string'||!candidate[key].trim()||candidate[key].length>300)throw new Error(`Invalid ${key}.`);for(const key of ['employment','salary'])if(candidate[key]!=null&&(typeof candidate[key]!=='string'||candidate[key].length>300))throw new Error(`Invalid ${key}.`);
 if(typeof candidate.evidenceUrl!=='string'||new URL(candidate.evidenceUrl).protocol!=='https:')throw new Error('Evidence URL required.');
 const old=byId.get(identity.id);const item={...identity,title:candidate.title.trim(),company:candidate.company.trim(),location:candidate.location.trim(),employment:candidate.employment||old?.employment||'',salary:candidate.salary||old?.salary||'',addedAt:old?.addedAt||new Date(time).toISOString(),kind:'recherchiert',evidenceUrl:candidate.evidenceUrl};
 if(old){if(Object.keys(item).some(k=>old[k]!==item[k]))updated++;Object.assign(old,item);}else{next.push(item);byId.set(item.id,item);added++;}}
 const sources=input.sources.map(s=>({name:s.name,status:s.status,lastSuccessAt:s.status==='success'?new Date(time).toISOString():previous.sources.find(p=>p.name===s.name)?.lastSuccessAt||null}));
 return{jobs:next,research:{lastAttemptAt:new Date(time).toISOString(),sources},added,updated};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(!process.argv[2])throw new Error('Usage: node scripts/update-jobs.mjs <researched-input.json> [--dry-run]');
 const result=mergeResearch(JSON.parse(fs.readFileSync(path.join(root,'data/jobs.json'))),JSON.parse(fs.readFileSync(path.join(root,'data/research.json'))),JSON.parse(fs.readFileSync(process.argv[2])));
 if(!process.argv.includes('--dry-run')){for(const [file,value] of [['jobs.json',result.jobs],['research.json',result.research]]){const target=path.join(root,'data',file);fs.writeFileSync(target+'.tmp',JSON.stringify(value,null,2)+'\n');fs.renameSync(target+'.tmp',target);}}
 console.log(JSON.stringify({added:result.added,updated:result.updated,total:result.jobs.length,sourceStatus:result.research.sources}));
}
