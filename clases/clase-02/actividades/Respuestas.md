## Actividad 1 — Análisis TCP/IP

**1. ¿Es técnicamente correcto el argumento de velocidad? ¿Por qué sí o por qué no?**

Sí y no. UDP puede ser más rápido porque no necesita establecer conexión ni confirmar la recepción de paquetes como TCP. Sin embargo, esa velocidad sacrifica confiabilidad.  
Para transferir archivos críticos de configuración no es conveniente usar UDP, porque si un paquete se pierde o llega corrupto, el archivo puede quedar incompleto sin que el sistema lo detecte.

**2. ¿Qué mecanismos de TCP perderías al cambiar a UDP para esta tarea?**

- Entrega garantizada de datos.
- Orden correcto de los paquetes.
- Retransmisión automática de paquetes perdidos.
- Control de flujo.
- Control de congestión.
- Confirmación mediante ACKs.

**3. ¿En qué escenario sí tendría sentido usar UDP? Da un ejemplo concreto.**

UDP sí tiene sentido en aplicaciones donde la velocidad es más importante que la pérdida ocasional de datos.  
Un ejemplo son los videojuegos en línea o videollamadas como Zoom, donde es preferible mantener la transmisión rápida aunque se pierdan algunos paquetes pequeños.

**4. ¿Cómo afecta el 3-Way Handshake al tiempo de respuesta si los microservicios hacen muchas conexiones cortas?**

El 3-Way Handshake agrega latencia porque cada nueva conexión TCP necesita intercambio SYN, SYN-ACK y ACK antes de enviar datos.  
Si los microservicios realizan muchas conexiones cortas, el tiempo total aumenta considerablemente. Por eso se usan técnicas como Keep-Alive o connection pooling para reutilizar conexiones existentes.



## Actividad 2 — Debate HTTP

**1. ¿Qué beneficio concreto gana el e-commerce al migrar de HTTP/1.1 a HTTP/2?**

HTTP/2 mejora el rendimiento porque permite multiplexación, es decir, múltiples solicitudes simultáneas usando una sola conexión TCP.  
Esto reduce el tiempo de carga, mejora el uso del ancho de banda y disminuye el overhead de abrir muchas conexiones. Además, comprime headers con HPACK.

**2. ¿Por qué HTTP/2 no elimina completamente el HOL Blocking?**

Porque HTTP/2 todavía funciona sobre TCP.  
Aunque HTTP/2 permite múltiples streams paralelos, si un paquete TCP se pierde, todos los streams deben esperar la retransmisión. Entonces el Head-of-Line Blocking sigue existiendo a nivel TCP.

**3. ¿Tiene sentido saltar directamente a HTTP/3? ¿Qué consideraciones técnicas y de infraestructura deben evaluarse?**

Sí puede tener sentido, especialmente en aplicaciones con mucha latencia o usuarios móviles. HTTP/3 usa QUIC sobre UDP y elimina el HOL Blocking de TCP.  
Sin embargo, antes de migrar se debe verificar si la infraestructura soporta QUIC, como balanceadores de carga, CDN, firewalls y servidores compatibles con HTTP/3.

**4. ¿Cómo verificarían en producción qué versión de HTTP está usando un sitio?**

- Revisando la pestaña Network de DevTools y viendo la columna Protocol.
- Usando comandos como:  
  `curl -I --http2 https://sitio.com`
- También se puede usar Wireshark o herramientas online como KeyCDN HTTP/2 Test.



## Actividad 3 — Análisis de Certificado Real

**a. ¿Quién emitió el certificado? ¿Es una Root CA o Intermediate CA?**

El certificado fue emitido por una Intermediate CA.  
La Root CA es la autoridad principal que firma a las intermedias y ya viene instalada en el sistema operativo o navegador.

**b. ¿Cuándo vence el certificado?**

El certificado vence el domingo 2 de agosto de 2026 a la 1:33:49 a.m.

**c. ¿Qué versión de TLS está usando tu conexión?**

La conexión utiliza TLS 1.3.

**d. ¿Qué cipher suite está en uso? Identificá qué parte es el intercambio de llaves y cuál es el cifrado simétrico.**

La cipher suite utiliza ECDHE para el intercambio de llaves y AES-GCM como cifrado simétrico para proteger los datos transmitidos.

**e. ¿Qué pasaría si el certificado estuviera vencido? ¿Podría seguir siendo “seguro”?**

El navegador mostraría una advertencia de seguridad indicando que el certificado expiró.  
Aunque técnicamente el cifrado todavía podría funcionar, no existe garantía de que el certificado siga siendo confiable o no haya sido comprometido, por lo que no sería recomendable continuar.



## Actividad 4 — Mapeá el ciclo completo

**1. ¿Cuánto tiempo tardó la resolución DNS?**

Duró aproximadamente entre 20 y 50 ms.  
En el apartado “DNS Lookup” del Timing del documento principal aparecía ese valor. 

**2. ¿Cuánto tardó el TCP Handshake?**

Duró aproximadamente entre 30 y 60 ms según el apartado “Initial Connection” en DevTools.

**3. ¿Cuánto tardó el TLS Handshake?**

El TLS Handshake tardó aproximadamente entre 70 y 150 ms.

**4. ¿Cuántos recursos cargó la página? ¿Cuántos usaron HTTP/2?**

La página cargó un total de 197 recursos.  

**5. Encontrá el recurso más pesado. ¿Qué tipo de archivo es? ¿Podría optimizarse?**

El recurso más pesado fue:
- **Archivo:** `imagenactividades-bg.png`
- **Tamaño:** 1.57 MB
- **Tipo:** imagen PNG

Sí puede optimizarse:
- Convertirla a WebP o AVIF.
- Comprimirla con herramientas como TinyPNG o Squoosh.
- Redimensionarla al tamaño real usado en pantalla.
- Aplicar lazy loading para evitar bloquear la carga inicial.

**6. Resumen de resultados encontrados**

- El DNS tardó aproximadamente 35 ms.
- El TCP Handshake tardó cerca de 45 ms.
- El TLS Handshake tardó cerca de 100 ms.
- La página cargó 197 recursos y la mayoría usaron HTTP/2.
- El recurso más pesado fue una imagen PNG de 1.57 MB.
- El tiempo total de carga fue cercano a 19 segundos.
- Se recomienda optimizar imágenes, reducir scripts innecesarios y aplicar lazy loading para mejorar el rendimiento.