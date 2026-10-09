<div align="center" id="top"> 
</div>

<p align="center">
  <img src="img/cobrakai_menu.png" alt="CobraKaiBot Menu" height="200px" width="250px"/><br>
  <code>======================================</code><br>
  <b><font size="6">COBRAKAI BOT V1 - BY SICARIOOFC</font></b><br>
  <code>======================================</code>
</p>

<div align="center">
<p align="center">
    <a href="https://www.youtube.com/@nms_sicario023">
        <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" title="📌 YouTube"/>
    </a>
    <a href="https://t.me/mds_inmunes2">
        <img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" title="📌 Telegram"/>
    </a>
    <a href="https://teamzetasprivate.kesug.com">
        <img src="https://img.shields.io/badge/TeamZetasPrivate-000000?style=for-the-badge&logo=About.me&logoColor=white" title="📌 TeamZetasPrivate"/>
    </a>
    <a href="mailto:teamzetasprivatev1@gmail.com">
        <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" title="📌 Gmail"/>
    </a>
    <a href="https://www.paypal.com/paypalme/SicariOfc025">
        <img src="https://img.shields.io/badge/PayPal-blue?style=for-the-badge&logo=paypal&logoColor=white" title="📌 PayPal"/>
    </a>
</p>
</div>

 <h4 align="center"> 
	🚧  CobraKaiBot 🚀 Bajo construcción...  🚧
</h4>

## Acerca del bot

Bot de WhatsApp Multi-Dispositivo creado con Node.js.

Permite buscar archivos, APKs y usar funciones con IA, además de un sistema de registro encriptado para mayor seguridad.

Fue creado por _SicariOfc_ para uso personal y en grupos.

Si te gustó el proyecto, deja una ⭐ en el repo. y apoyar el proyecto, eso me ayuda mucho a seguir mejorándolo.

📥 Donaciones: [PayPal - @SicariOfc025](https://www.paypal.com/paypalme/SicariOfc025)

## 📌 Comandos Principales

A continuación se muestran algunos de los comandos más relevantes disponibles en **CobraKaiBot V1**:

<details>
<summary><b>👥Comandos en Privado y Grupo</b></summary>

<br>

| Nombre            | Comando             | Caracteristicas                  |
| ----------------- | ------------------- | -------------------------------- |
| **Privado/Grupo** | `/start o /menu`    | Iniciar bot - Ver menu principal |
| **Privado/Grupo** | `.ping`             | Ver velocidad del bot            |
| **Privado/Grupo** | `.creador`          | Ver mi creador                   |
| **Privado/Grupo** | `/repo` o `/github` | Clonar bot                       |
| **Grupo**         | `/extgrup`          | Ver menu admins grupo            |
| **Grupo**         | `/appsyextra`       | Ver menu APKs e IA               |

</details>

## Requisitos necesarios

- Node.js (Para la creación y lectura de codigo del bot)
- FFmpeg (Obligatorio para descargar música/video)
- Un editor de código o IDE (Usaremos Visual Studio Code)
- Una consola de prueba: PowerShell7
- APIs: Google Cloud Console, Custom Search y Unsplash

## Lenguajes y herramientas usados

Estos son los lenguajes y herramientas que se ocupo para el proyecto:

- [Node.js](https://nodejs.org/es)
- [FFmpeg](https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [PowerShell7](https://github.com/powershell/powershell/releases)
- [Unsplash](https://unsplash.com/oauth/applications)
- [Google Cloud Console](https://console.cloud.google.com)
- [Custom Search](https://programmablesearchengine.google.com/controlpanel/all)

## 1. Instalar FFmpeg

- **Windows:** Descargar de [ffmpeg.org](https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip) y agrégalo al PATH.
- **Ubuntu:** `sudo apt install ffmpeg -y`

## Instalación en Windows (PowerShell 7)

```powershell
# Nota: Asegúrate de tener instalado previamente: Node.js, FFmpeg y Git en tu sistema.

# Clonar repositorio
git clone https://github.com/programador024/CobraKaiBot-WA.git

# Acceder a la carpeta
cd CobraKaiBot-WA

# Instalar dependencias
npm install

# Iniciar CobraKaiBot V1
npm start

# Detener bot: Presiona Ctrl + C
```

## Instalación en Ubuntu (Google Cloud)

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Git y FFmpeg
sudo apt install -y git ffmpeg

# Instalar Node.js (Versión LTS recomendada v20)
curl -fsSL https://nodesource.com | sudo -E bash -
sudo apt install -y nodejs

# Clonar repositorio y acceder
git clone https://github.com/programador024/CobraKaiBot-WA.git
cd CobraKaiBot-WA

# Instalar dependencias
npm install

# Ejecutar CobraKaiBot V1 manualmente
npm start

# Detener el bot: Presiona Ctrl + C
# Para dejarlo 24/7, revisa la sección de PM2 más abajo.
```

## Instalación en Termux (Móvil / Tablet / Emulador)

```bash
# 1. Actualizar el sistema e instalar dependencias
pkg update && pkg upgrade -y
pkg install -y nodejs git ffmpeg python make clang build-essential libvips

# 2. Clonar repositorio y acceder
git clone https://github.com/programador024/CobraKaiBot-WA.git
cd CobraKaiBot-WA

# 3. Instalar dependencias y reconstruir SQLite
npm install --ignore-scripts
npm rebuild better-sqlite3

# --- MODO MANUAL ---
# Ejecutar CobraKaiBot V1 normalmente
npm start
# Para detener el bot: Presiona Ctrl + C

# --- MODO 24/7 (Seguir ejecutando en segundo plano) ---
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar CobraKaiBot V1 con PM2
pm2 start index.js --name "cobrakai-bot"

# Comandos útiles de PM2:
# Ver el estado del bot:   pm2 status
# Ver los logs en vivo:    pm2 logs
# Detener el bot:          pm2 stop cobrakai-bot
# Reiniciar el bot:        pm2 restart cobrakai-bot
```

## Para dejarlo 24/7 en Google Cloud (Ubuntu)

```bash
# Asegúrate de estar dentro de la carpeta del bot
cd ~/CobraKaiBot-WA

# Instalar PM2 de forma global
sudo npm install -g pm2

# Iniciar CobraKaiBot V1 con PM2
pm2 start index.js --name "cobrakai-bot"

# Configurar PM2 para que el bot se inicie automáticamente si el servidor se reinicia
pm2 startup
pm2 save

# --- COMANDOS ÚTILES DE MONITOREO ---
# Ver estado del bot
pm2 status

# Ver logs en tiempo real (Escaneo de código QR / Mensajes)
pm2 logs cobrakai-bot

# Reiniciar bot
pm2 restart cobrakai-bot

# Detener el bot
pm2 stop cobrakai-bot
```

## 📄 Licencia

Este proyecto está bajo una licencia de uso personal y no comercial.

Todos los derechos reservados © 2026 [SicariOfc](https://github.com/programador024)

> Mira el archivo [LICENSE](./LICENSE) para más detalles.

- ✅ Uso personal / grupos permitido
- ❌ Prohibida su venta o lucro

&#xa0;

<h2 tabindex="-1" class="heading-element" dir="auto">Rachas-Contribución y Lenguaje <img class="emoji" title=":octocat:" alt=":octocat:" src="https://github.githubassets.com/images/icons/emoji/octocat.png" height="20" width="20" align="absmiddle"></h2>

<p align="center">
<table align="left">
<tr border="none">
<td width="60%" align="center">
  <img title="🔥 Rachas y Contribuciones" alt="Rachas-Contribuciones" src="https://github-readme-streak-stats.herokuapp.com/?user=programador024&theme=dark&hide_border=false" /> 
</td>

<td width="40%" align="center">
  <!-- Muestra el lenguaje del repositorio específico del bot de WhatsApp -->
 <img align="center" src="https://github-readme-stats.anuraghazra1.vercel.app/api/top-langs/?username=programador024&theme=dark&hide_border=false&no-bg=true&no-frame=true&langs_count=10&hide=python" title="Lenguaje usado"/>
</td>
</tr>
</table>
</p>

  <br>
<br><br>

<a href="#top">Volver arriba</a>
