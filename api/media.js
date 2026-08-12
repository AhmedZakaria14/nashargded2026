const ALLOWED_HOSTS=new Set(['adselams.com','www.adselams.com']);
const IMAGE_EXT=/\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:$|\?)/i;

function candidateUrls(raw){
  const out=[];
  const add=value=>{if(value&&!out.includes(value))out.push(value)};
  let u;
  try{u=new URL(raw)}catch{return out}
  if(!ALLOWED_HOSTS.has(u.hostname.toLowerCase()))return out;
  u.protocol='https:';
  u.hash='';
  add(u.toString());

  const noQuery=new URL(u.toString());
  noQuery.search='';
  add(noQuery.toString());

  for(const base of [...out]){
    if(/\.webp$/i.test(base))add(base.replace(/\.webp$/i,''));
    else if(/\.webp(?:\?)/i.test(base))add(base.replace(/\.webp(?=\?)/i,''));
  }

  for(const base of [...out]){
    try{
      const x=new URL(base);
      const restored=x.pathname.replace(/-\d+x\d+(?=\.(?:avif|gif|jpe?g|png|webp)$)/i,'');
      if(restored!==x.pathname){x.pathname=restored;add(x.toString())}
    }catch{}
  }
  return out;
}

async function fetchCandidate(url,signal){
  const response=await fetch(url,{
    redirect:'follow',
    signal,
    headers:{
      'User-Agent':'Mozilla/5.0 (compatible; ELNASHARGROUP-MediaProxy/2.0; +https://nashargded2026.vercel.app)',
      'Referer':'https://adselams.com/',
      'Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language':'en-US,en;q=0.9,ar;q=0.8'
    }
  });
  if(!response.ok)return null;
  const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!(type.startsWith('image/')||(!type&&IMAGE_EXT.test(url))))return null;
  const body=Buffer.from(await response.arrayBuffer());
  if(!body.length)return null;
  return {body,type:type||'application/octet-stream',etag:response.headers.get('etag')||''};
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD'){
    res.setHeader('Allow','GET, HEAD');
    return res.status(405).end('Method Not Allowed');
  }

  const raw=Array.isArray(req.query.u)?req.query.u[0]:req.query.u;
  const candidates=candidateUrls(raw||'');
  if(!candidates.length)return res.status(400).end('Invalid media URL');

  for(const url of candidates){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try{
      const result=await fetchCandidate(url,controller.signal);
      if(!result)continue;
      res.statusCode=200;
      res.setHeader('Content-Type',result.type);
      res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800, max-age=3600');
      res.setHeader('CDN-Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
      res.setHeader('Vary','Accept');
      res.setHeader('X-Content-Type-Options','nosniff');
      res.setHeader('Cross-Origin-Resource-Policy','cross-origin');
      if(result.etag)res.setHeader('ETag',result.etag);
      if(req.method==='HEAD')return res.end();
      return res.end(result.body);
    }catch(error){
      // Continue to the next safe WordPress variant on timeout/network/404-like failures.
    }finally{
      clearTimeout(timer);
    }
  }

  res.setHeader('Cache-Control','no-store');
  return res.status(404).end('Media unavailable');
};
