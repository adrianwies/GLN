import '../src/global.css'
import './productos.css'
import logoUrl from '../src/assets/LogoGLN.png'
const products=[
['Bola Ocho','Whisky','Intenso · Roble','1527281400683-1aae777175f8'],
['Soviet','Vodka','Puro · Cristalino','1608885898957-a5598a1f3a45'],
['El Mariachi','Tequila','Agave · Carácter','1510812431401-41d2bd2722f3'],
['Mr. Jigger','Gin','Botánico · Fresco','1609951651556-5334e2706168'],
['Bandolero','Ron','Cálido · Especiado','1569529465841-dfecdab7503b']
]
const cards=products.map((p,i)=>`<article class="card reveal"><div class="pic"><img src="https://images.unsplash.com/photo-${p[3]}?auto=format&fit=crop&w=900&q=85" alt="${p[0]}"><b>0${i+1}</b><a href="/#contacto" aria-label="Consultar ${p[0]}">↗</a></div><div class="info"><div><small>${p[1]}</small><h3>${p[0]}</h3></div><span>${p[2]}</span></div></article>`).join('')
document.querySelector('#app').innerHTML=`
<header class="solid"><a class="logo" href="/"><img src="${logoUrl}" alt="Grupo de Licores Nacionales"></a><nav><a href="/">Inicio</a><a class="page-active" href="/productos/">Productos</a><a href="/#nosotros">Nosotros</a><a href="/#contacto">Contacto</a></nav><a class="explore" href="/#contacto">Consultar ↗</a><button class="menu">☰</button></header>
<main><section class="inner-hero"><div><p class="tag">Portafolio GLN</p><h1>Nuestras líneas,<br><em>nuestro carácter.</em></h1><p>Una selección pensada para cada ocasión, desde perfiles clásicos hasta sabores que se atreven a ir más allá.</p></div></section><section class="collection-page"><div class="collection-intro"><h2>Explora la colección</h2><p>Cinco identidades únicas, un mismo compromiso con la calidad.</p></div><div class="grid">${cards}</div></section></main>
<footer><b>GLN.</b><div>Grupo de Licores Nacionales S.A.C.<br>Lima, Perú</div><div>Instagram · Facebook<br>ventas@gln.com.pe</div><small>© 2026 GLN. Toma con responsabilidad. Prohibida la venta de alcohol a menores de edad.</small></footer>`
const nav=document.querySelector('nav');document.querySelector('.menu').onclick=()=>nav.classList.toggle('open');nav.querySelectorAll('a').forEach(a=>a.onclick=()=>nav.classList.remove('open'))
const observer=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('visible')),{threshold:.1});document.querySelectorAll('.reveal').forEach(e=>observer.observe(e))



