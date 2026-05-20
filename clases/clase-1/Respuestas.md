# Actividad 1 — Análisis de Casos

**1. ¿Es correcto lo que dijo el Rector? ¿Por qué la distinción del director de TI es técnicamente importante?**  
El Rector usa "Internet" coloquialmente para decir "accesible online". Técnicamente tiene razón en la dirección pero no en la capa. El director de TI es correcto: publicar algo en HTTP sobre Internet y hacerlo visible en la WWW son decisiones separadas. Importa para firewall, DNS público y
mantenimiento.

**2. Si usan HTTP sobre Internet pero solo para usuarios internos de la UTN, ¿están usando Internet o la WWW, o ambos?**  
Ambos. Usan la infraestructura de Internet (TCP/IP) pero solo habilitan el servicio web (HTTP) para usuarios de la red intern a. Esto es
técnicamente una intranet web —corren HTTP sobre Internet privado. No es accesible desde la WWW pública.

**3. ¿Qué organismo (W3C o IETF) define los estándares más relevantes para este sistema de notas? Justifica.**  
Ambos. IETF define HTTP, TLS/HTTPS y DNS, que son la base del sistema. W3C define HTML, CSS y accesibilidad para el frontend. Sin embargo, IETF tiene más peso operativo para el funcionamiento y seguridad del sistema.



# Actividad 2 — Toma de Decisión Técnica

**1. Para cada necesidad (A, B, C), decide qué topología implementar: Internet, Intranet o Extranet. Justifica en 2 líneas cada una.**

- **A) Sitio de información pública con trámites para vecinos:** Internet. Debe ser accesible para cualquier persona desde fuera de la municipalidad.
- **B) Sistema interno de gestión de planillas para RRHH:** Intranet. Solo debe tener acceso el personal autorizado porque maneja datos sensibles.
- **C) Portal para empresas constructoras:** Extranet. Permite acceso controlado a usuarios externos autorizados.

**2. ¿Cuál de los tres sistemas requiere más inversión en seguridad? ¿Por qué?**  
La Intranet y la Extranet requieren mayor seguridad. La Intranet protege información sensible como salarios y la Extranet expone datos hacia usuarios externos autenticados.

**3. ¿Podría un mismo servidor físico alojar los tres sistemas de forma segura? ¿Cómo lo lograrías conceptualmente?**  
Sí. Se puede usar virtualización o contenedores como Docker y segmentación de red mediante VLANs o firewall para aislar cada servicio.



# Actividad 3 — Disección y Diseño de URLs

## Parte A: Componentes de la URL

**URL:**  
`https://api.github.com:443/repos/bryancs/isw521/issues?state=open&labels=semana1#comentarios`

- Esquema: `https`
- Host: `api.github.com`
- Puerto: `443`
- Path: `/repos/bryancs/isw521/issues`
- Query String: `state=open&labels=semana1`
- Fragmento: `#comentarios`

## Parte B: Clean URLs

- `/cursos/isw-521/2026-ii/san-carlos`
- `/estudiantes/2022-0001`
- `/cursos/isw-521/semanas/3/materiales`



# Actividad 4 — Mapeando el árbol DNS

**1. Para cada URL: identifica el TLD, el SLD y el subdominio (si lo hay).**

| URL | TLD | SLD | Subdominio |
|---------|-----|-----|------------|
| campus.utn.ac.cr | .cr | utn.ac | campus |
| www.netflix.com | .com | netflix | www |
| api.github.io | .io | github | api |
| app.maravilla.co.cr | .cr | maravilla.co | app |

**¿Cuáles son ccTLD y cuáles gTLD?**  
- ccTLD: .cr y .io  
- gTLD: .com  

**2. ¿Quién administra el TLD .cr? ¿Y el .com? ¿Necesitás ICANN para registrar un subdominio?**  
- .cr lo administra NIC Costa Rica.  
- .com lo administra Verisign bajo ICANN.  
- No se necesita ICANN para crear un subdominio.  

**3. Si la UTN quisiera crear egresados.utn.ac.cr, ¿necesita pagar a un registrar?**  
No. La UTN ya posee el dominio utn.ac.cr, entonces solo necesita crear el subdominio en su servidor DNS.

**4. ¿Qué diferencia hay entre un registro A y un registro CNAME en DNS?**  
- Registro A: relaciona un dominio directamente con una dirección IP.  
- CNAME: relaciona un dominio con otro dominio como alias.