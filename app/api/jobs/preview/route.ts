import { getChatGPTUser } from '@/app/chatgpt-auth';
import { canonicalUrl,seedJobs } from '@/lib/jobs';
import { extractJobPreview } from '@/lib/job-preview';
export const dynamic='force-dynamic';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
function validOrigin(req:Request){const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin;}
async function readHtml(response:Response){
 const length=Number(response.headers.get('content-length')||0);if(length>1_500_000)throw new Error('too large');
 const reader=response.body?.getReader();if(!reader)return '';
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1_500_000){await reader.cancel();throw new Error('too large');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}return new TextDecoder().decode(bytes);
}
async function fetchListing(input:string){
 let url=canonicalUrl(input).url;
 for(let redirects=0;redirects<4;redirects++){
  const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(8000),headers:{Accept:'text/html,application/xhtml+xml','User-Agent':'Mozilla/5.0 (compatible; Buerokompass/1.0)'} });
  if(response.status>=300&&response.status<400){const location=response.headers.get('location');if(!location)throw new Error('redirect');url=canonicalUrl(new URL(location,url).toString()).url;continue;}
  if(!response.ok)throw new Error('unavailable');
  const type=response.headers.get('content-type')||'';if(!type.includes('text/html'))throw new Error('not html');
  return readHtml(response);
 }
 throw new Error('redirect');
}
export async function POST(req:Request){
 if(!validOrigin(req))return json({error:'Ungültige Anfrage.'},403);
 if(!(await getChatGPTUser()))return json({error:'Bitte melde dich zuerst an.'},401);
 let input:unknown;try{input=await req.json();}catch{return json({error:'Ungültige Eingabe.'},400);}
 if(!input||typeof input!=='object'||!('url' in input)||typeof input.url!=='string'||input.url.length>3000)return json({error:'Bitte einen gültigen Link einfügen.'},400);
 try{const canonical=canonicalUrl(input.url);const known=seedJobs.find(job=>canonicalUrl(job.url).url===canonical.url);if(known)return json({title:known.title,company:known.company,location:known.location});const html=await fetchListing(canonical.url);const preview=extractJobPreview(html);if(!preview.title&&!preview.company&&!preview.location||/^(just a moment|access denied|attention required)/i.test(preview.title))return json({error:'Auf dieser Seite konnten keine Jobdaten erkannt werden.'},422);return json(preview);}
 catch(e){if(e instanceof TypeError||e instanceof Error&&/Link|Unterstützt|HTTPS/.test(e.message))return json({error:e.message},400);return json({error:'Die Angaben konnten nicht automatisch gelesen werden. Du kannst sie weiterhin von Hand eintragen.'},422);}
}
