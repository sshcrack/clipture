# Clipture
## ☄ Record your favourite moments self-hosted!
[![discordBadge](https://img.shields.io/discord/638769122330804234?style=for-the-badge&color=7289da)](https://discord.gg/WHYhUF4)
![codeBadge](https://img.shields.io/github/languages/code-size/sshcrack/clipture?style=for-the-badge)
![issuesOpen](https://img.shields.io/github/issues/sshcrack/clipture?style=for-the-badge)


# Download & Install (Windows only)
<!-- BEGIN LATEST DOWNLOAD BUTTON -->
<!-- END LATEST DOWNLOAD BUTTON -->

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
