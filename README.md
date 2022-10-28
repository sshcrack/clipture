<img src="https://github.com/sshcrack/clipture/blob/master/src/assets/renderer/logo_text.svg?raw=true" width="300"></img>
## ☄ Record your favourite moments self-hosted!
[![discordBadge](https://img.shields.io/discord/638769122330804234?style=for-the-badge&color=7289da)](https://discord.gg/WHYhUF4)
![codeBadge](https://img.shields.io/github/languages/code-size/sshcrack/clipture?style=for-the-badge)
![issuesOpen](https://img.shields.io/github/issues/sshcrack/clipture?style=for-the-badge)
![lines](https://img.shields.io/tokei/lines/github/sshcrack/clipture?style=for-the-badge)
![status](https://img.shields.io/github/workflow/status/sshcrack/clipture/Release?style=for-the-badge)

# Download (Windows only)
### Official Build:&nbsp;&nbsp;&nbsp;&nbsp;[![Official Build](https://custom-icon-badges.herokuapp.com/badge/-Download-blue?style=for-the-badge&logo=download&logoColor=white)](https://clipture.sshcrack.me/api/download)

## Selfhosting
Make sure you have yarn installed, if not sure:
```bash
npm i -g yarn
```

Clone repository
```bash
git clone https://github.com/sshcrack/clipture-server
```
Replace defaults with your config files in .env.local

Build:
```bash
 yarn build
```

Start: 
```bash
  yarn start
```

Build the client: 
<a href="#building">Click here</a>

## Building
Replace url and other information with yours in file src/Globals/MainGlobals.ts

Build obs-studio-node and add it to the project:
```
git clone https://github.com/sshcrack/obs-studio-node-fix && cd obs-studio-node-fix && yarn local:config && yarn local:build && cd obs-studio-node && tar -cvf ../out.tar.gz . && cd .. && cd .. && yarn add ./obs-studio-node-fix/out.tar.gz
```

### Releasing
Generate setup files:
```bash
yarn make
```
Your files will be available in out/make
