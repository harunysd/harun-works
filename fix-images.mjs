import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const contentDir = 'content/project';
const updates = {
  '01-komuta-merkezi.md':       { image: '/img/01-komuta-banner.png',    preview: '/img/01-komuta-preview.png' },
  '02-arsiv-dijitalizasyonu.md':{ image: '/img/02-arsiv-banner.png',     preview: '/img/02-arsiv-preview.png' },
  '03-ibb-akom.md':             { image: '/img/03-akom-banner.png',      preview: '/img/03-akom-preview.png' },
  '04-ivlp.md':                 { image: '/img/04-ivlp-banner.png',      preview: '/img/04-ivlp-preview.png' },
  '05-kentsel-donusum.md':      { image: '/img/05-donusum-banner.png',   preview: '/img/05-donusum-preview.png' },
  '06-kentsel-tasarim.md':      { image: '/img/06-tasarim-banner.png',   preview: '/img/06-tasarim-preview.png' },
  '07-fikirtepe.md':            { image: '/img/07-fikirtepe-banner.png', preview: '/img/07-fikirtepe-preview.png' },
  '08-bagcilar-gunesli.md':     { image: '/img/08-gunesli-banner.png',   preview: '/img/08-gunesli-preview.png' },
  '09-kara-surlari.md':         { image: '/img/09-surlar-banner.png',    preview: '/img/09-surlar-preview.png' },
  '10-yedikule-belgradkapi.md': { image: '/img/10-yedikule-banner.png',  preview: '/img/10-yedikule-preview.png' },
  '11-topkapi.md':              { image: '/img/11-topkapi-banner.png',   preview: '/img/11-topkapi-preview.png' },
  '12-mudanya.md':              { image: '/img/12-mudanya-banner.png',   preview: '/img/12-mudanya-preview.png' },
  '13-buyuk-valide-han.md':     { image: '/img/13-validehan-banner.png', preview: '/img/13-validehan-preview.png' },
  '14-gelibolu.md':             { image: '/img/14-gelibolu-banner.png',  preview: '/img/14-gelibolu-preview.png' },
  '15-beykoz.md':               { image: '/img/15-beykoz-banner.png',    preview: '/img/15-beykoz-preview.png' },
  '16-kent-ici-ulasim.md':      { image: '/img/16-ulasim-banner.png',    preview: '/img/16-ulasim-preview.png' },
  '17-berlin.md':               { image: '/img/17-berlin-banner.png',    preview: '/img/17-berlin-preview.png' },
};

for (const [file, paths] of Object.entries(updates)) {
  const filePath = join(contentDir, file);
  let content = readFileSync(filePath, 'utf8');
  content = content.replace(/image: '\/img\/[^']+\.jpg'/, `image: '${paths.image}'`);
  content = content.replace(/previewImage: '\/img\/[^']+\.jpg'/, `previewImage: '${paths.preview}'`);
  writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', file);
}
