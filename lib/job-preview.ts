export type JobPreview={title:string;company:string;location:string};

function text(value:unknown){return typeof value==='string'?value.trim():'';}
function record(value:unknown):Record<string,unknown>|null{return value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:null;}
function one(value:unknown):unknown{return Array.isArray(value)?value[0]:value;}
function isJobPosting(value:unknown){const type=record(value)?.['@type'];return type==='JobPosting'||Array.isArray(type)&&type.includes('JobPosting');}
function findJobPosting(value:unknown):Record<string,unknown>|null{
 if(!value||typeof value!=='object')return null;
 if(isJobPosting(value))return record(value);
 for(const child of Array.isArray(value)?value:Object.values(value)){const match=findJobPosting(child);if(match)return match;}
 return null;
}
function decode(value:string){return value.replace(/<[^>]*>/g,' ').replace(/&#(x?[0-9a-f]+);|&(amp|quot|apos|lt|gt);/gi,(_,numeric,named)=>numeric?String.fromCodePoint(parseInt(numeric.replace(/^x/i,''),numeric[0]?.toLowerCase()==='x'?16:10)):({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'}[String(named).toLowerCase()]||' ')).replace(/\s+/g,' ').trim();}
function meta(html:string,key:string){const tags=html.match(/<meta\b[^>]*>/gi)||[];for(const tag of tags){const name=tag.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1];if(name?.toLowerCase()!==key.toLowerCase())continue;return decode(tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1]||'');}return '';}

export function extractJobPreview(html:string):JobPreview{
 let posting:Record<string,unknown>|null=null;
 for(const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try{posting=findJobPosting(JSON.parse(match[1]));if(posting)break;}catch{}
 }
 const organization=record(one(posting?.hiringOrganization));
 const place=record(one(posting?.jobLocation));
 const address=record(one(place?.address));
 const documentTitle=decode(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/\s*[|–-]\s*(Stepstone|Indeed|Bundesagentur.*)$/i,'').trim();
 return{
  title:decode(text(posting?.title)||meta(html,'og:title')||meta(html,'twitter:title')||documentTitle).slice(0,240),
  company:decode(text(organization?.name)||text(posting?.company)).slice(0,200),
  location:decode(text(address?.addressLocality)||text(address?.addressRegion)||text(place?.name)).slice(0,200),
 };
}
