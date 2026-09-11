import { readFileSync, writeFileSync } from 'fs';

// Fix Valide Han content
const valideHan = readFileSync('content/project/13-buyuk-valide-han.md', 'utf8');
const newValideHan = valideHan
  .replace(
    `İstanbul Tarihi Yarımada'da yer alan Büyük Valide Han ve çevresinin morfolojik, mimari ve işlevsel katmanlarını ele alan kentsel doku analizidir.`,
    `İstanbul Tarihi Yarımada'nın en büyük ve en karmaşık yapı topluluklarından biri olan Büyük Valide Han ve çevresini konu alan kentsel doku çalışmasıdır.`
  )
  .replace(
    `Hanın kent içi ulaşım akslarıyla bağlantılarını, avlu hiyerarşisini, zanaat ve ticaret kullanım biçimleri ile yapısal bozulmalarını yerinde inceleyerek haritaladım ve mekânsal tipoloji analizlerini ürettim.`,
    `Hanın kent içindeki konumsal ilişkilerini, ulaşım akslarıyla bağlantısını, avlu hiyerarşisini ve kat konfigürasyonunu, zanaat-ticaret kullanım örüntülerini ve yapısal bozulma durumunu yerinde gözlemleyerek belgeledim; mekânsal tipoloji ve morfoloji analizlerini ürettim.`
  );
writeFileSync('content/project/13-buyuk-valide-han.md', newValideHan, 'utf8');
console.log('Valide Han updated');

// Fix about-me text
const aboutMeNew = `Şehir planlama, afet yönetimi, CBS ve dijital sistemlerin kesişiminde üretiyorum. Mekânsal analizden kriz operasyonlarına, veri altyapılarından karar destek araçlarına kadar geniş bir alanda çalışıyorum.

İBB AKOM'da afet ve kriz yönetimi süreçlerinde görev alıyor; tarihsel veri arşivlerinin dijitalleştirilmesi, mekânsal veri altyapıları ve operasyonel karar destek sistemleri geliştiriyorum. Bunların yanında bağımsız olarak web uygulamaları, otomasyon sistemleri ve yapay zekâ destekli araçlar üretiyorum.

Mimar Sinan Güzel Sanatlar Üniversitesi Şehir ve Bölge Planlama mezunuyum. Yıldız Teknik Üniversitesi'nde Kentsel Dönüşüm ve Planlama yüksek lisansımı sürdürüyorum. 2025'te IVLP kapsamında ABD'de afet yönetimi ve kentsel arama-kurtarma sistemlerini yerinde inceleme fırsatı buldum.
`;
writeFileSync('content/about-me.md', aboutMeNew, 'utf8');
console.log('About-me updated');
