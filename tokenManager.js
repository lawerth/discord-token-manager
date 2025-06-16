const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = './tokens.json';

function readTokens() {
  if (!fs.existsSync(path)) fs.writeFileSync(path, '[]');
  const raw = fs.readFileSync(path);
  return JSON.parse(raw);
}

function writeTokens(tokens) {
  fs.writeFileSync(path, JSON.stringify(tokens, null, 2));
}

function removeToken(index) {
  const tokens = readTokens();
  if (tokens[index]) {
    tokens.splice(index, 1);
    writeTokens(tokens);
  }
}

async function addToken(token) {
  const user = await fetchUser(token);
  if (!user) {
    console.log('❌ Geçersiz token, eklenmedi.\n');
    return;
  }

  const tokens = readTokens();
  if (tokens.some(t => t.token === token)) {
    console.log('⚠️ Bu token zaten kayıtlı.\n');
    return;
  }

  tokens.push({
    token,
    username: user.username
  });

  writeTokens(tokens);
  console.log(`✅ ${user.username} eklendi.\n`);
}

async function fetchUser(token) {
  try {
    const res = await fetch('https://discord.com/api/v9/users/@me', {
      headers: {
        Authorization: token
      }
    });

    if (res.status !== 200) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('İstek başarısız:', err.message);
    return null;
  }
}

module.exports = {
  readTokens,
  addToken,
  removeToken
};
