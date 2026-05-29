# Portfolio de Clase #4 — Control de Versiones, Dependencias y Herramientas Modernas


## Actividad 1 — Diagnóstico de Commits, .gitignore y Estados Git

**1. ¿Cuáles commits violan Conventional Commits? Reescribilos con el formato correcto.**  
Todos los commits del historial están mal porque ninguno sigue el estándar de Conventional Commits. El formato correcto es `tipo(alcance): descripción`.

| Commit      | Mensaje Original                     | Versión corregida                                      |
|-------------|--------------------------------------|--------------------------------------------------------|
| `a3f1c09`   | arreglo del login                    | `fix(auth): arreglar bucle de redirección en login`    |
| `b7e2d41`   | cambios de bryan esta semana         | `chore: actualizar dependencias y limpiar código`      |
| `9c4a887`   | feature nueva para el cliente        | `feat(checkout): agregar formulario de pago multi-step`|
| `f016334`   | node_modules/express/index.js        | `chore: eliminar node_modules/ del repositorio`        |
| `e5d2198`   | *env                                  | `chore: agregar archivo .env (inseguro, no hacerlo)`   |

**2. ¿Cuáles commits representan un problema de seguridad? ¿Qué debiste haber configurado antes del primer commit?**  

- `e5d2198`: contiene datos sensibles (credenciales, claves). Hay que revocar esas claves inmediatamente.  
- `f016334`: no es un problema de seguridad directo, pero es una mala práctica enorme (nunca subir `node_modules/`).  

Antes del primer commit se debe configurar el **.gitignore** para excluir archivos peligrosos o innecesarios. Un `.gitignore` correcto sería:

```gitignore
# Dependencias y builds
node_modules/
dist/
build/
coverage/

# Variables de entorno y archivos sensibles
.env
.env.local
.env.*.local

# Archivos de sistema y logs
*.log
.DS_Store
```

> **Nota importante:** `package-lock.json` **NO** debe ir en `.gitignore`.

**3. ¿En qué estado Git está un archivo recién creado sin `git add`? ¿Y uno con `git add` pero sin commit?**  

- Archivo recién creado sin `git add`: está **Untracked** (no rastreado). Git no lo supervisa ni lo incluirá en el próximo commit.  
- Archivo con `git add` pero sin commit: está en el área de **Staged** (preparado). Significa que ya está listo para el próximo commit.


## Actividad 2 — Autenticación y Sincronización con GitHub

**1. ¿Cuál es el comando correcto para descargar los cambios de tu compañero SIN modificar tu rama local? ¿Por qué preferirías ese en lugar de `git pull`?**  

El comando es:

```bash
git fetch origin
```

Es preferible porque solo descarga los cambios sin fusionarlos automáticamente. Así puedes revisar primero si hay errores o conflictos, antes de que se te pueda caer el código. `git pull` hace un `fetch` + `merge` automático, lo cual puede ser riesgoso.

Para revisar los cambios después del `fetch`:

```bash
git log origin/main --oneline --graph
git diff main origin/main
```

**2. Después de inspeccionar los cambios, querés integrarlos. ¿Qué secuencia de comandos usarías para hacer un historial limpio y lineal?**  

```bash
# 1. Asegurarse de tener los últimos cambios
git fetch origin

# 2. Reubicar tus commits encima de la rama actualizada
git rebase origin/main

# 3. Finalmente el push acepta (fast-forward)
git push origin main
```

**3. Tu `git push` falla con `rejected -- non-fast-forward`. ¿Qué significa eso y cuál es el flujo correcto para resolverlo?**  
Significa que el servidor remoto tiene commits que tú no tienes localmente. Nunca uses `git push --force` en ramas compartidas. El flujo correcto es:

```bash
git fetch origin
git rebase origin/main
git push origin main
```


## Actividad 3 — Branching, Merge y Pull Request

**1. ¿Qué tipo de merge ocurrirá al integrar `feature/user-profile` en `main`? Justificá técnicamente si será fast-forward o 3-way merge.**  

Será un **3-way merge**. Porque `main` y `feature/user-profile` tienen un ancestro común, pero ambas ramas avanzaron de forma independiente. Git necesita comparar tres puntos (el ancestro común y las dos puntas) para fusionarlas.

**2. Tu compañero tiene cambios en `origin/feature/dark-mode`. ¿Qué comandos usás para revisar sus cambios SIN integrarlos todavía?**  

```bash
# Descargar las referencias remotas sin modificar la rama local
git fetch origin

# Ver los commits nuevos en esa rama
git log main..origin/feature/dark-mode --oneline

# Ver los cambios en los archivos (diff)
git diff main origin/feature/dark-mode

# Explorar interactivamente (opcional, te deja en detached HEAD)
git checkout origin/feature/dark-mode
```

**3. Describí los 4 elementos esenciales que debe tener la descripción de un Pull Request profesional.**  

- **A) Título claro y descriptivo:** debe seguir el formato Conventional Commit y resumir el cambio en una línea.  
- **B) Contexto / Por qué:** explicar la razón del cambio, qué problema soluciona o qué mejora aporta.  
- **C) Lista de cambios:** detallar los archivos modificados, las clases nuevas y los cambios relevantes.  
- **D) Instrucciones para probar:** pasos concretos que otro desarrollador pueda seguir para reproducir el comportamiento y verificar que funciona.



## Actividad 4 — Diagnóstico de package.json

**1. Identificá cuáles paquetes están mal clasificados (en `dependencies` cuando deberían ser `devDependencies`). Justificá cada uno.**  

| Paquete      | Justificación |
|--------------|----------------|
| `vite`       | Solo se usa durante el desarrollo y para el build. En producción no se necesita. |
| `eslint`     | Solo se usa en desarrollo para mantener estándares de código. |
| `vitest`     | Solo se ejecuta en el entorno de testing, no en producción. |
| `typescript` | En producción solo corre el código JavaScript generado, no TypeScript. |

**2. Hay un problema grave en el `.gitignore`. ¿Cuál es y qué consecuencia concreta tiene para el equipo?**  

El archivo `package-lock.json` no debe ignorarse nunca.  
**Consecuencia:** cada desarrollador instala versiones distintas de las dependencias, y el servidor de integración continua (CI) puede romperse por una actualización sutil que nadie notó.

**3. Los scripts no son consistentes con las herramientas declaradas. Identificá la inconsistencia y reescribí los scripts correctamente.**  

La inconsistencia es que usan `webpack` y `node server.js`, pero el proyecto está declarado con **Vite** (y no tiene Webpack instalado). Los scripts corregidos para Vite serían:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "vitest run",
  "lint": "eslint . --fix"
}
```