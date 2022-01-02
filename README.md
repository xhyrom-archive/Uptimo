## How to install

Requirements:
- NodeJS v16+ [Windows](https://nodejs.org) [Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
- Git [Windows](https://git-scm.com/) [Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-20-04)
- Build Essential (Required for Ubuntu)
    - `sudo apt-get install build-essential`

```bash
git clone https://github.com/xHyroM/Uptimo.git
cd Muploader

npm ci

# Rename template.env.local to .env.local
mv template.env.local .env.local

# Change enviroments in .env.local 
nano .env.local

# After save
npm run build

npm run start -- -p 8080
# Running!
```