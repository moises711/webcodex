from urllib.request import urlopen
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor
import json,xml.etree.ElementTree as ET
import sys
from pathlib import Path
class Page(HTMLParser):
 def __init__(self):super().__init__();self.h1=0;self.meta={};self.canonical=None;self.schema=[];self.active=False;self.script='';self.text=[];self.scripting=False;self.hrefs=[];self.images=[]
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='h1':self.h1+=1
  if t=='meta':self.meta[d.get('property') or d.get('name')]=d.get('content')
  if t=='link' and d.get('rel')=='canonical':self.canonical=d.get('href')
  if t=='a':self.hrefs.append(d.get('href',''))
  if t=='img':self.images.append(d)
  if t=='script':self.scripting=True;self.active=d.get('type')=='application/ld+json';self.script=''
 def handle_data(self,d):
  if self.active:self.script+=d
  elif not self.scripting:self.text.append(d)
 def handle_endtag(self,t):
  if t=='script':
   if self.active:self.schema.append(json.loads(self.script))
   self.active=False;self.scripting=False
services=['sistemas','marketing','ciberseguridad','soporte-tecnico']
base=(sys.argv[1] if len(sys.argv)>1 else 'https://codexcusco.com').rstrip('/')
sitemap=ET.fromstring(urlopen(base+'/sitemap.xml').read())
urls=[item.text for item in sitemap.findall('.//{*}loc')]
paths=['/','/servicios','/empresa','/contactanos','/aviso','/buscar']+['/'+s for s in services]+[u.replace('https://codexcusco.com','') for u in urls if '/proyectos/' in u][:3]
def check(path):
 response=urlopen(base+path);raw=response.read().decode();p=Page();p.feed(raw)
 assert response.status==200,path
 assert p.h1==1,(path,p.h1)
 assert p.canonical.rstrip('/')==('https://codexcusco.com'+path).rstrip('/'),(path,p.canonical)
 for name in ['description','og:title','og:description','og:url','og:image','twitter:card','twitter:title','twitter:description','twitter:image']:assert p.meta.get(name),(path,name)
 assert 'ProfessionalService' in json.dumps(p.schema),path
 if path[1:] in services:
  assert 'Qué incluye este servicio' in ''.join(p.text),path
  faq=next(item for item in p.schema if item.get('@type')=='FAQPage')
  for q in faq['mainEntity']:assert q['name'] in ''.join(p.text) and q['acceptedAnswer']['text'] in ''.join(p.text),path
  assert all(t in json.dumps(p.schema) for t in ['Service','BreadcrumbList'])
  assert '/contactanos' in p.hrefs,path
 assert 'Cargando…' not in ''.join(p.text),path
 return {'path':path,'status':response.status,'h1':p.h1,'canonical':p.canonical,'schemas':[item.get('@type', '@graph') for item in p.schema],'images':len(p.images)}
with ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(check,paths))
destination=Path('output/seo/html-results.json')
destination.parent.mkdir(parents=True,exist_ok=True)
destination.write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False))
