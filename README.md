# Clipture
## ☄ Record your favourite moments self-hosted!

# <a href="#download">Download & Install (Windows only)</a>

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
  yarn start -p 3001
```

Build the client with your server (replace url in Globals.ts):
<a href="#developing-this-project">Click here</a>

## Developing this project:
Building obs-studio-node and adding it to the project:
```
git clone https://github.com/sshcrack/obs-studio-node-fix && cd obs-studio-node-fix && yarn local:config && yarn local:build && cd obs-studio-node && tar -cvf ../out.tar.gz . && cd .. && cd .. && yarn add ./obs-studio-node-fix/out.tar.gz
```

Packaging:
```bash
yarn package
```

Generate Setup.EXE
```bash
yarn make
```
