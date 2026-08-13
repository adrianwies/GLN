import './global.css'
import './style.css'
import logoUrl from './assets/LogoGLN.png'

const products = [
['Bola Ocho','Whisky','Intenso · Roble','1527281400683-1aae777175f8'],
['Soviet','Vodka','Puro · Cristalino','1608885898957-a5598a1f3a45'],
['El Mariachi','Tequila','Agave · Carácter','1510812431401-41d2bd2722f3'],
['Mr. Jigger','Gin','Botánico · Fresco','1609951651556-5334e2706168'],
['Bandolero','Ron','Cálido · Especiado','1569529465841-dfecdab7503b']
]
const cards=products.map((p,i)=>`<article class="card reveal"><div class="pic"><img src="https://images.unsplash.com/photo-${p[3]}?auto=format&fit=crop&w=900&q=85" alt="${p[0]}"><b>0${i+1}</b><a href="#contacto">↗</a></div><div class="info"><div><small>${p[1]}</small><h3>${p[0]}</h3></div><span>${p[2]}</span></div></article>`).join('')
document.querySelector('#app').innerHTML=`
<header><a class="logo" href="#inicio"><img src="${logoUrl}" alt="Grupo de Licores Nacionales"></a><nav><a href="#inicio">Inicio</a><a href="/productos/">Productos</a><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a></nav><a class="explore" href="/productos/">Explorar colección ↗</a><button class="menu">☰</button></header>
<main>
<section class="hero" id="inicio"><div class="videos"><video autoplay muted loop playsinline poster="https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80"><source src="https://assets.mixkit.co/videos/preview/mixkit-bartender-serving-a-cocktail-in-a-bar-43529-large.mp4"></video><video autoplay muted loop playsinline poster="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"><source src="https://assets.mixkit.co/videos/preview/mixkit-bartender-preparing-a-cocktail-12380-large.mp4"></video><video autoplay muted loop playsinline poster="https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&w=900&q=80"><source src="https://assets.mixkit.co/videos/preview/mixkit-pouring-whiskey-in-a-glass-with-ice-39832-large.mp4"></video></div><div class="shade"></div><div class="heroText"><p class="tag">Destilados con identidad</p><h1>El carácter de<br><em>una gran noche.</em></h1><div><p>Seleccionamos licores que convierten cada encuentro en una historia digna de recordar.</p><a href="#productos">↓</a></div></div></section>
<section class="products pad" id="productos"><div class="title reveal"><div><p class="tag">Nuestra selección</p><h2>Una línea para<br><em>cada celebración.</em></h2></div><p>De perfiles clásicos a expresiones audaces. Cinco marcas creadas para acompañar distintos gustos, momentos y maneras de celebrar.</p></div><div class="grid">${cards}</div></section>
<section class="about" id="nosotros"><div class="aboutPic reveal"><span>GLN<small>DESDE SIEMPRE<br>PARA CELEBRAR</small></span></div><div class="aboutText reveal"><p class="tag">Quiénes somos</p><h2>Tradición que se sirve.<br><em>Calidad que se queda.</em></h2><p>En Grupo de Licores Nacionales reunimos marcas con personalidad propia y un compromiso común: ofrecer calidad constante en cada botella.</p><p>Trabajamos junto a distribuidores, comercios y aliados para llevar experiencias memorables a cada mesa.</p><div class="facts"><b>5<small>LÍNEAS EXCLUSIVAS</small></b><b>100%<small>PASIÓN NACIONAL</small></b><b>24/7<small>PARA BRINDAR</small></b></div></div></section>
<section class="moment pad"><p class="tag">Elige tu momento</p><h2>No vendemos botellas.<br><em>Creamos el motivo para abrirlas.</em></h2><div class="moments"><article><small>01</small><h3>La previa</h3><p>La noche apenas comienza. Elige una botella que esté a la altura.</p></article><article><small>02</small><h3>La celebración</h3><p>Un logro, un reencuentro, una fecha. Haz que el brindis cuente.</p></article><article><small>03</small><h3>El regalo</h3><p>Buen gusto, listo para entregar. Nosotros te ayudamos a elegir.</p></article></div><a class="gold" href="#contacto">Encuentra tu botella ↗</a></section>
<section class="contact pad" id="contacto"><div><p class="tag">Hablemos</p><h2>Tu próximo brindis<br><em>empieza aquí.</em></h2><p>¿Quieres comprar, distribuir nuestras marcas o conocer más? Déjanos tus datos.</p></div><form><label>Nombre completo<input required placeholder="Tu nombre"></label><label>Correo electrónico<input required type="email" placeholder="correo@ejemplo.com"></label><label>Estoy interesado en<select><option>Comprar productos</option><option>Ser distribuidor</option><option>Información comercial</option></select></label><label>Mensaje<textarea placeholder="Cuéntanos cómo podemos ayudarte"></textarea></label><button>Enviar consulta <b>↗</b></button><output></output></form></section>
</main><footer><b>GLN.</b><div>Grupo de Licores Nacionales S.A.C.<br>Lima, Perú</div><div>Instagram · Facebook<br>ventas@gln.com.pe</div><small>© 2026 GLN. Toma con responsabilidad. Prohibida la venta de alcohol a menores de edad.</small></footer>`
const menu=document.querySelector('.menu'),nav=document.querySelector('nav');menu.onclick=()=>nav.classList.toggle('open');nav.querySelectorAll('a').forEach(a=>a.onclick=()=>nav.classList.remove('open'))
const observer=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('visible')),{threshold:.1});document.querySelectorAll('.reveal').forEach(e=>observer.observe(e))
addEventListener('scroll',()=>document.querySelector('header').classList.toggle('solid',scrollY>50),{passive:true})
document.querySelector('form').onsubmit=e=>{e.preventDefault();e.target.querySelector('output').textContent='Gracias. Recibimos tu consulta y te contactaremos pronto.';e.target.reset()}




