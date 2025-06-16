const packageVersion = require('./package.json').version;
const inquirer = require('inquirer').default;
const { execSync } = require('child_process');

async function checkForUpdates() {
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  const remoteUrl = 'https://raw.githubusercontent.com/lawerth/discord-token-manager/main/package.json';

  try {
    const res = await fetch(remoteUrl);
    if (!res.ok) throw new Error('Sürüm bilgisi alınamadı.');

    const remote = await res.json();
    const remoteVersion = remote.version;

    if (remoteVersion !== packageVersion) {
      console.log(`\n🔔 Yeni sürüm bulundu: v${remoteVersion} (Şu anki: v${packageVersion})`);

      const { update } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'update',
          message: 'Güncellemek ister misiniz?',
          default: true
        }
      ]);

      if (update) {
        try {
          console.log('\n📥 Güncelleme başlatılıyor...');
          execSync('git pull', { stdio: 'inherit' });
          console.log('\n✅ Güncelleme tamamlandı. Uygulama yeniden başlatılmalı.');
          process.exit(0);
        } catch (err) {
          console.log(`❌ Güncelleme başarısız: ${err.message}`);
          process.exit(1);
        }
      } else {
        console.log('⚠️ Güncelleme atlandı. Mevcut sürümle devam ediliyor.\n');
      }
    } else {
      console.log(`✅ Güncel sürüm kullanılıyor (v${packageVersion})\n`);
    }
  } catch (err) {
    console.log(`⚠️ Güncelleme kontrolü başarısız: ${err.message}\n`);
  }
}

module.exports = { checkForUpdates };
