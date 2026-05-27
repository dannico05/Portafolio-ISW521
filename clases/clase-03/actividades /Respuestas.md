## Actividad 1 — Haedware vs Demon

**1. ¿Qué tres comandos ejecutarías primero para saber si el problema es hardware o proceso? Justifica cada uno.**

- `ping servidor`  
  Permite verificar si la máquina responde en la red.

- `systemctl status nginx`  
  Permite comprobar si el servicio Nginx está activo, detenido o con errores.

- `journalctl -u nginx`  
  Muestra los logs del servicio para identificar errores de configuración o ejecución.

**2. Si el proceso nginx está "failed" pero la VM responde ping, ¿qué hacés exactamente? Escribí los comandos en orden.**

```bash
systemctl status nginx
nginx -t                     # Verifica si existe algún error de sintaxis en la configuración.
journalctl -u nginx          # Revisa los registros para encontrar la causa del fallo.
systemctl restart nginx      # Reinicia el servicio después de corregir los errores.
systemctl status nginx       # Confirma que el servicio quedó funcionando correctamente.
```

**3. ¿En qué situación reiniciar la VM completa Sí sería la decisión correcta? Dame al menos un ejemplo concreto.**

Reiniciar la VM completa sería apropiado cuando existe un problema del sistema operativo o del hardware virtual y no solamente del servicio.

Ejemplo:

El servidor deja de responder completamente.
El sistema se queda sin memoria y los procesos dejan de funcionar.
Existe un kernel panic o un bloqueo general del sistema operativo.


## Actividad 1.2 — Virtual Hosting

**1. Escribí las 3 entradas necesarias en /etc/hosts**

192.168.1.10 portafolio.local
192.168.1.10 api.local
192.168.1.10 admin.local

**2. Describí la configuración mínima de Nginx con 3 bloques server.**

server {
    listen 80;
    server_name portafolio.local;
    root /var/www/portafolio;
}

server {
    listen 80;
    server_name api.local;
    root /var/www/api;
}

server {
    listen 80;
    server_name admin.local;
    root /var/www/admin;
}

**3. ¿Qué pasa si olvidás poner server_name en uno de los bloques?**

Tu respuesta está correcta.

Si un bloque no tiene server_name, Nginx utilizará el servidor por defecto. Dependiendo del orden de carga de los archivos de configuración, las peticiones podrían ser atendidas por el primer bloque disponible o por el virtual host configurado como predeterminado.

## Actividad 3.1 — ¿Sitio Web o Aplicación Web?

Tus respuestas están correctas según la solución de la presentación.

**A) La Nación Digital**

Respuesta: Híbrido (sitio web con componentes de aplicación).

Justificación:

Permite autenticación mediante cuenta de usuario.
Tiene comentarios y favoritos.
Mantiene estado del usuario.
Incluye funcionalidades propias de una aplicación web.

**B) Portafolio Estático**

Respuesta: Sitio Web.

Justificación:

No utiliza base de datos.
No tiene autenticación.
Solo muestra información.
No existe gestión de estado ni CRUD.

**C) Google Sheets**

Respuesta: Aplicación Web.

Justificación:

Permite crear, editar y eliminar datos.
Tiene autenticación.
Guarda cambios en tiempo real.
Permite colaboración entre usuarios.

## Actividad 4 — Despliegue Manual

**1. ¿Usarías FTP, SFTP o SCP para transferir los archivos? ¿Por qué?**

Usaría SCP o SFTP.

SCP es ideal para automatización y línea de comandos.
SFTP es más cómodo cuando se utiliza una interfaz gráfica.
Ambos cifran la información mediante SSH.
FTP no se recomienda porque transmite datos y credenciales en texto plano.

Ejemplo:

scp -r ./dist usuario@192.168.1.10:/var/www/mi-app/

**2. ¿Cómo configurarías DB_URL, JWT_SECRET y PORT sin escribirlas en el código?**

La mejor práctica es utilizar variables de entorno mediante un archivo .env.

Ejemplo:

DB_URL=mongodb://localhost
JWT_SECRET=supersecreto
PORT=3000

Y acceder desde Node.js mediante:

process.env.DB_URL
process.env.JWT_SECRET
process.env.PORT

**3. Un colega sugiere subir el archivo .env al repositorio. Dame 3 razones para rechazar esa idea.**

Las credenciales quedarían expuestas públicamente.
Git guarda historial, por lo que aunque se elimine después, seguiría accesible.
Todos los colaboradores tendrían acceso a secretos de producción.

## Actividad 5 — Debug de CORS

**Caso 1**

fetch("https://api.miproyecto.com/datos", {
  mode: "no-cors"
})
.then(r => r.json())

**¿Qué sale mal?**

mode: "no-cors" no permite que JavaScript lea la respuesta.

Aunque la petición llegue al servidor, r.json() fallará porque la respuesta es opaca y no puede ser procesada.

**Caso 2**

Servidor responde:

Access-Control-Allow-Origin: *

Cliente:

fetch("https://api.miproyecto.com/perfil", {
  credentials: "include"
})

**¿Qué sale mal?**

No se puede usar credentials: "include" junto con Access-Control-Allow-Origin: *.

El servidor debe indicar un origen específico y agregar:

Access-Control-Allow-Credentials: true

**Caso 3**

Frontend hace un DELETE con Authorization y el servidor no maneja OPTIONS.

**¿Qué ocurre?**

El navegador envía primero una petición preflight OPTIONS.

Como el servidor no responde correctamente a OPTIONS, el preflight falla y la petición DELETE nunca llega al servidor.

Error típico:

Response to preflight request doesn't pass access control check