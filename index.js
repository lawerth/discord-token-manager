const fs = require('fs');
const inquirer = require('inquirer').default;
const readline = require('readline');
const { Client } = require('discord.js-selfbot-v13');
const { checkForUpdates } = require('./.version');

let tokens = fs.existsSync('tokens.json') ? JSON.parse(fs.readFileSync('tokens.json')) : [];
let activeClients = [];

function saveTokens() {
  fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
}

async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Bir seçenek seçin:',
      choices: [
        'Token Ekle',
        'Token Sil',
        'Tokenleri Listele',
        'Tokenleri Aktif Et',
        'Aktif Tokenleri Listele',
        'Aktif Tokenleri Çevrimdışı Bırak',
        'Çıkış'
      ]
    }
  ]);

  if (action === 'Token Ekle') {
    const { token } = await inquirer.prompt([{ type: 'input', name: 'token', message: 'Yeni tokeni girin:' }]);

    try {
      const client = new Client();
      await client.login(token);
      const username = client.user.username;
      tokens.push({ token, username });
      saveTokens();
      console.log(`✅ Token başarıyla eklendi: ${username}`);
      client.destroy();
    } catch {
      console.log('❌ Geçersiz token, eklenmedi.');
    }

    return mainMenu();
  }

  if (action === 'Token Sil') {
    if (tokens.length === 0) return console.log('📭 Kayıtlı token yok.'), mainMenu();
    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: 'Silinecek token(ler)i seçin:',
        choices: tokens.map((t, i) => ({ name: t.username, value: i }))
      }
    ]);
    selected.sort((a, b) => b - a).forEach(i => tokens.splice(i, 1));
    saveTokens();
    console.log('🗑️ Seçilen token(ler) silindi.');
    return mainMenu();
  }

  if (action === 'Tokenleri Listele') {
    if (tokens.length === 0) return console.log('📭 Kayıtlı token yok.'), mainMenu();
    console.log('\n📋 Kayıtlı Tokenler:\n');
    tokens.forEach((t, i) => console.log(`${i + 1}. ${t.username}`));
    console.log('');
    return mainMenu();
  }

  if (action === 'Tokenleri Aktif Et') {
    if (tokens.length === 0) return console.log('📭 Token yok.'), mainMenu();
    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: 'Aktif edilecek token(ler)i seçin:',
        choices: tokens.map((t, i) => ({ name: t.username, value: i }))
      }
    ]);

    for (const i of selected) {
      const t = tokens[i];
      const client = new Client();
      client.on('ready', () => console.log(`✅ Aktif: ${client.user.username}`));
      client.login(t.token);
      activeClients.push({ username: t.username, client });
    }

    return mainMenu();
  }

  if (action === 'Aktif Tokenleri Listele') {
    if (activeClients.length === 0) return console.log('❌ Aktif token yok.\n'), mainMenu();
    console.log('\n🟢 Aktif Tokenler:\n');
    activeClients.forEach((t, i) => console.log(`${i + 1}. ${t.username}`));
    console.log('');
    return mainMenu();
  }

  if (action === 'Aktif Tokenleri Çevrimdışı Bırak') {
    if (activeClients.length === 0) return console.log('❌ Aktif token yok.\n'), mainMenu();
    activeClients.forEach(({ client }) => client.destroy());
    activeClients = [];
    console.log('🔌 Tüm tokenler çevrimdışı bırakıldı.\n');
    return mainMenu();
  }

  if (action === 'Çıkış') {
    console.log('👋 Görüşmek üzere!');
    process.exit(0);
  }
}

(async () => {
  await checkForUpdates();
  await mainMenu();
})();
