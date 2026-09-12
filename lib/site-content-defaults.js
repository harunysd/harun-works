export const defaultSiteContent = {
  settings: {
    email: 'harunysd@gmail.com',
    secondaryEmail: 'iletisim@harun.works',
    displayName: 'Harun Yasir SARIDAŞ',
    tagline: 'Şehir Planlama · Afet Yönetimi · CBS · Dijital Sistemler',
    aboutText: `Şehir planlama, afet yönetimi, coğrafi bilgi sistemleri (CBS) ve dijital ürün geliştirme ekseninde çalışıyorum. Mekânsal veriyi; saha operasyonları, karar destek süreçleri ve kullanıcı odaklı yazılım çözümleriyle bir araya getiriyorum.

İBB AKOM’da afet ve kriz yönetimi operasyonlarında görev alıyor; olay verilerinin doğrulanması, operasyonel raporlama, mekânsal veri altyapıları ve karar destek sistemlerinin geliştirilmesi süreçlerine katkı sunuyorum. Bunun yanı sıra tarihsel arşivleri dijitalleştiriyor, kapalı devre yapay zekâ ve otomasyon araçları ile bağımsız web uygulamaları geliştiriyorum.

Mimar Sinan Güzel Sanatlar Üniversitesi Şehir ve Bölge Planlama Bölümü mezunuyum. Yıldız Teknik Üniversitesi’nde Kentsel Dönüşüm ve Planlama yüksek lisans eğitimimi sürdürüyorum. 2025 yılında ABD Dışişleri Bakanlığı’nın IVLP programı kapsamında afet yönetimi ve kentsel arama-kurtarma sistemlerini yerinde inceleyerek farklı kurumsal uygulamaları değerlendirdim.`,
    contactText: 'Bana bir e-posta gönderin',
  },
  blogPosts: [
  {
    "id": "post-yapay-zeka-ile-eski-tv-mi-akilli-bir-tv-sistemine-donusturdum",
    "title": "Yapay Zekâ ile Eski TV'mi Akıllı Bir TV Sistemine Dönüştürdüm",
    "slug": "yapay-zeka-ile-eski-tv-mi-akilli-bir-tv-sistemine-donusturdum",
    "excerpt": "Philips Ambilight TV ve Mi Stick ile çalışan kişisel akıllı TV deneyimi",
    "category": "Sistem",
    "publishedAt": "2026-09-12",
    "coverImage": "/img/blog/oem-tv-launcher/cover.png",
    "coverCaption": "Philips Ambilight TV ve Mi Stick ile çalışan kişisel akıllı TV ortamı",
    "body": "## Kısa özet\n\nBu proje, yapay zekâ destekli geliştirmeyle eski bir televizyonu ve elimdeki kumandayı yeniden değerlendiren kişisel bir TV platformu. Televizyonun HDMI girişine takılı Xiaomi Mi TV Stick'i küçük bir Android bilgisayar gibi kullandım; birlikte geliştirdiğimiz uygulama da bu cihazın ana ekranı, canlı TV uygulaması, radyo oynatıcısı ve film-dizi menüsü olarak çalışıyor.\n\nArtık televizyonu açtığımda karşıma reklam ve gereksiz önerilerle dolu standart bir menü değil, kendi kullanım alışkanlıklarıma göre şekillenen tek bir ekran geliyor. Belirtmek isterim: bu, benim tek başıma ezbere yazdığım bir uygulama değil. Fikir, donanım ve ürün kararları, gerçek cihaz testleri benden geldi; teknik üretim ve problem çözme gücü ise yapay zekâdan.\n\n## Kullandığım gerçek cihazlar\n\n| Parça | Bilgi |\n|---|---|\n| Televizyon | Philips 47PFL7008K/12, 47 inç, Ambilight ve EasyLink/HDMI-CEC destekli |\n| Android cihaz | Xiaomi Mi TV Stick (model: MiTV-AYFR0, cihaz kodu: soul) |\n| Bağlantı | Televizyona HDMI, internete Wi-Fi |\n| Görüntü | 1920 × 1080 çözünürlükte test edildi |\n\nÖnemli bir nokta: Televizyonu sökmedim, işletim sistemini de değiştirmedim. Görüntüyü televizyon gösteriyor; akıllı özellikleri ve hazırladığım menüyü Mi Stick çalıştırıyor.\n\n![Philips 47PFL7008K/12 üzerinde çalışan canlı yayın ve arkaya vuran Ambilight aydınlatması | yatay ince | orta](/img/blog/oem-tv-launcher/tv-canli-yayin.png)\n\n## Başlangıçta ne vardı?\n\nMi Stick üzerinde normal Android TV uygulamaları, Xiaomi'nin kendi TV menüleri ve bir IPTV yayın listesi vardı. Ancak hazır menüde reklamlar, öneriler ve kullanılmayan uygulamalar doluydu; yayın listesinde de aynı kanalın SD, HD, FHD, VIP veya Avrupa sürümleri ayrı ayrı görünüyordu.\n\nTeknik olarak çalışsa da günlük kullanımda yorucuydu: bir kanalı bulmak için uzun listelerde dolaşmak, farklı uygulamalar arasında geçiş yapmak, çalışmayan yayın bağlantılarını tekrar tekrar denemek gerekiyordu. Hedefim bu dağınık yapıyı tek bir ana ekranda toplamaktı.\n\n## Önce Mi Stick'i temizledim\n\nUygulamayı geliştirmeden önce cihazı sadeleştirdim. Root işlemi yapmadan, kablosuz ADB üzerinden Android'in paket yönetimi komutlarını kullandım; önce cihazın mevcut durumunu, sonra temizlik sonrası durumunu kaydedip karşılaştırdım.\n\nTemizlikte ayıkladıklarım:\n- Xiaomi'nin reklam ve tanıtım odaklı PatchWall, Mi Channel ve Mi TV Plus bileşenleri\n- stok Google TV launcher'ı ve ana ekrandaki öneri akışları\n- kullanılmayan üçüncü taraf IPTV, tarayıcı, oyun ve yayın uygulamaları\n- ihtiyacım olmayan ekran koruyucu, takvim, yazdırma ve bazı arka plan servisleri\n\n40'ın üzerinde uygulama/servis için işlem yaptım. Play Store, YouTube, Spotify ve sistemin çalışması için gerekli temel Android bileşenlerini korudum; hangi paketin neden temizlendiğini ve geri alınabileceğini gösteren bir liste ile bir geri yükleme betiği bıraktım.\n\nBu temizlikten sonra Mi Stick'in ana ekranı sakinleşti ve kendi uygulamamı cihazın TV ana ekranı olarak kullanmak mümkün oldu.\n\n## Yapay zekâ ile teknik ortaklık\n\nBu çalışma, yapay zekâ destekli kodlamanın gerçek donanım üzerinde uygulanmış bir örneği. Yapay zekâ olmasaydı bu kapsamda bir Android TV uygulamasını -- launcher, IPTV oynatma, kumanda yönlendirme, T9 klavye, erişilebilirlik servisi ve cihaz temizliğiyle birlikte -- geliştiremezdim.\n\nBen fikri, hedef kullanıcı deneyimini ve donanım bağlamını ortaya koydum: eski Philips kumandası kullanılacak, ana ekran sade olacak, kanallar Türkçe ve kolay bulunabilir olacak, IPTV.org listesindeki güncellemeler otomatik alınacak, çalışmayan yayınlarda uygulama mümkün olduğunca dayanıklı davranacaktı. Antigravity/Codex'i fikirden koda, dosya üretimine, mimari kararlara, hata çözümüne ve test sonuçlarını yorumlamaya kadar aktif kullandım.\n\nBenim katkım yalnızca başlangıç fikri değildi: cihazı hazırladım, gerçek kumandayla denedim, TV ekranındaki davranışları gözlemledim, neyin yanlış olduğunu tarif ettim, düzeltmeleri tekrar tekrar doğruladım ve hangi özelliklerin gerçekten işe yaradığını seçtim. Yapay zekâ teknik uygulama ortağımdı; ben ürün yönünü, kabul ölçütlerini ve gerçek kullanım testini yönettim.\n\n## Neden yenilikçi?\n\nBu proje yalnızca bir IPTV arayüzü değil; üç farklı unsuru tek bir deneyimde birleştiriyor:\n\n1. 2013 model Philips TV kumandasını, bağlama göre çalışan bir Android TV kumandasına dönüştürüyor.\n2. Hazır IPTV listesini sabit bir dosya olarak bırakmıyor; IPTV.org/Xtream kaynağından otomatik güncelliyor.\n3. Yapay zekâ ile üretilen yazılımı, temizlenmiş düşük maliyetli bir Mi TV Stick üzerinde gerçek TV kullanımına uyarlıyor.\n\n## Projenin can alıcı noktası: kumandasız kalmamak\n\nMi TV Stick gibi cihazların kutusundan çıkan standart kumandalar oldukça kısıtlı: yalnızca yön tuşları, OK, geri, ses ve birkaç uygulama kısayolu var. Rakam tuşu (0-9) ya da geleneksel Kanal İleri/Geri (CH+/CH-) tuşu yok. Bu yüzden sıradan bir kullanıcı bir kanalı açmak için dakikalarca menülerde gezinmek ya da ekrandaki sanal klavyede harf harf ilerlemek zorunda kalıyor.\n\nBu kısıtlamaya razı olmak yerine, televizyonun kendi 2013 model Philips kumandasını HDMI-CEC üzerinden sistemin ana kumandasına dönüştürdüm. Televizyondan gelen fiziksel tuş sinyallerini Android erişilebilirlik ve tuş yönlendirme katmanında yakalayarak klasik televizyon reflekslerini geri kazandım:\n\n- **Doğrudan rakamla kanal açma:** Kumandadan 1, 24 veya 62119 gibi bir sayı tuşlayarak, menülerde kaybolmadan ilgili kanala anında geçiyorum.\n- **Gerçek kanal değiştirme (zapping):** Fiziksel kanal yukarı/aşağı tuşlarıyla klasik televizyonlardaki gibi hızlı zapping yapılabiliyor.\n- **Rakam tuşlarından T9 Türkçe klavye:** Arama kutusu açıldığında aynı 0-9 tuşları, eski cep telefonlarındaki gibi çoklu basmalı (T9) klavyeye dönüşüyor; ç, ğ, ı, ö, ş, ü dahil Türkçe karakterlerle hızlı arama yapılabiliyor. Geliştirdiğim erişilebilirlik servisi sayesinde bu yöntem YouTube'un kendi arama ekranında bile çalışıyor.\n- **Bağlama duyarlı yönlendirme:** Aynı yön tuşları; canlı TV izlerken zapping ve rehber açmaya, film-dizi izlerken oynatma ve bilgi paneline, menüdeyken liste gezinmesine otomatik uyarlanıyor.\n\n![Fiziksel kumanda tuşlarıyla çalışan hızlı kanal değiştirme (zapping) çubuğu ve yayın bilgisi | yatay ince | orta](/img/blog/oem-tv-launcher/tv-zapping.png)\n\nBöylece ek bir kumanda veya kablosuz klavye almadan, 13 yıllık eski bir kumandayla modern bir akıllı televizyondan bile daha pratik bir TV deneyimi elde ettim.\n\n## Uygulamayı nasıl geliştirdim?\n\nUygulamayı Android Studio ve Gradle tabanlı bir Android projesi olarak hazırladım; arayüzde Java ve XML kullandım. Kanal listeleri için AndroidX RecyclerView, görüntü/ses oynatma için Android Media3/ExoPlayer, internet istekleri için OkHttp, veri düzenleme için Gson, kanal logoları için Glide kullandım.\n\nUygulamanın ana ekran olarak seçilebilmesi için Android TV'nin HOME ve LEANBACK özelliklerinden yararlandım; böylece Mi Stick'in kumandasındaki yön tuşlarıyla her ekranda doğal bir TV kullanımı elde ettim.\n\nKablosuz geliştirme akışım şöyleydi:\n\n1. Mi Stick'i Wi-Fi üzerinden bul\n2. `adb connect <Mi Stick yerel IP adresi>:5555`\n3. APK'yı yükle ve uygulamayı çalıştır\n4. TV karşısında kumanda ile test et\n5. Logları ve ekranı kontrol edip düzelt\n\nBu sayede her denemede USB kablosu takıp çıkarmadım; uygulamayı bilgisayardan televizyona kablosuz gönderip sonucu doğrudan TV ekranında gördüm.\n\n## Uygulamada yaptığım bölümler\n\n### Kişisel ana ekran\n\nAna ekranda TV, filmler, diziler, radyolar, YouTube, Play Store ve Spotify bölümleri var. Seçili bölüm belirgin renkle gösteriliyor; koyu arka plan, büyük yazılar ve sade simgeler televizyon izleme mesafesine göre tasarlandı. Alt menünün sırasını da kullanım şeklime göre düzenledim, böylece en sık kullandığım bölümlere birkaç tuşla ulaşıyorum.\n\n![Canlı TV yayını üzerinde açılan kişisel ana ekran dock menüsü | yatay ince | orta](/img/blog/oem-tv-launcher/tv-dock.png)\n\n### Canlı TV ve Akıllı Liste\n\nYayın listesini olduğu gibi göstermek yerine kanalları temizleyip kategorilere ayırdım: Akıllı Liste, Tüm Kanallar, Yedek TV, Ulusal, Haber, Spor, Belgesel, Çocuk, Sinema, Müzik, Dini, Yerel. Akıllı Liste'de aynı kanalın farklı kalite ve sağlayıcı kayıtlarını tek bir anlaşılır sırada topladım; kanal numarası, logo ve kanal adı aynı satırda görünüyor.\n\n![Akıllı liste, kanal numaraları, logolar ve favorilerle kategorize edilmiş sol kanal rehberi | yatay ince | orta](/img/blog/oem-tv-launcher/tv-kanal-rehberi.png)\n\nKumandada aşağı-yukarı tuşlarıyla geziniyor, OK ile kanalı açıyor, geri tuşuyla menüden çıkıyorum. Sık izlediğim kanalları favoriye ekleyip favoriler içinde ayrıca sıralayabiliyorum.\n\n### Film ve dizi bölümü\n\nCanlı yayınların yanına film ve diziler için ayrı menüler ekledim. Film posterleri, dizi bilgileri, sezonlar ve bölümler aynı uygulamanın içinde açılıyor; TV izlemekten filme geçmek için uygulama değiştirmiyorum.\n\n![Filmler (VOD) kataloğu ve Cinemeta üzerinden çekilen IMDb puanlama kartları | yatay ince | orta](/img/blog/oem-tv-launcher/filmler.png)\n\nBir kart üzerine gelindiğinde, uygulama temizlenmiş başlığı Cinemeta'nın Stremio API'sinde arıyor; sonuçtan IMDb kimliğini ve imdbRating alanını alarak IMDb puanını, özetini, yılını, türlerini ve uygun arka plan görselini gösteriyor. Sonuçlar bellekte önbelleğe alındığı için aynı başlık tekrar seçildiğinde ekran daha hızlı güncelleniyor.\n\nTeknik bir ayrıntı: uygulama IMDb sayfasını kazımıyor veya puan uydurmuyor; puanı Cinemeta'nın IMDb bağlantılı metadata alanından alıyor. Film ve dizi için ayrı arama uçları kullanılıyor; dizi aramasında film kataloğuna düşüp yanlış eşleşme olmaması için başlık temizleme, sonuç başlığı karşılaştırması ve içerik türü ayrımı uyguluyorum. Bu, örneğin \"Kurtlar Vadisi\" gibi dizilerde başka bir yapımın puanının gösterilmesi riskini azaltıyor.\n\n![Diziler menüsü ve kumandadan 0-9 tuşlarıyla çalışan Türkçe T9 arama ekranı | yatay ince | orta](/img/blog/oem-tv-launcher/diziler.png)\n\n### Radyo oynatıcısı\n\nRadyo bölümünde istasyon adı, logo, yayın bilgisi ve hareketli bir ses görselleştirmesi var; istasyonları listeleyip sıralayabiliyorum. Bu sayede televizyonu sadece görüntü için değil, müzik veya radyo dinlemek için de kullanabiliyorum.\n\n![Hareketli ses görselleştirmesi ve radyo istasyonu bilgileriyle radyo oynatıcı ekranı | yatay ince | orta](/img/blog/oem-tv-launcher/radio-player.png)\n\n### YouTube ve diğer uygulamalar\n\nMi Stick üzerinde zaten bulunan YouTube, Spotify ve Play Store'u kaldırmak yerine kendi ana ekranıma bağladım; kişisel TV menüm ile hazır Android TV uygulamaları birlikte çalışıyor.\n\n## IPTV.org listesinin otomatik güncellenmesi ve yayın dayanıklılığı\n\nUygulama ikinci bir IPTV sağlayıcısına bağlı değil; tek bir IPTV.org/Xtream listesinin kategori ve kanal verilerini otomatik yeniliyor. Açılışta önce son başarılı veriyi önbellekten gösterip ardından ağ üzerinden güncel listeyi alarak önbelleği tazeliyor. Böylece kaynak listeye yeni kanal, radyo veya içerik eklendiğinde, uygulamanın kanal ekranı APK değiştirmeden güncelleniyor. Aynı kanalın farklı kalite veya kayıtlarını ayrı bir sağlayıcı gibi değil, aynı kaynağın alternatif yayın kayıtları olarak sunuyorum.\n\nGerçek cihazda bazı kanalların geç açıldığını, bazılarında siyah ekran kaldığını, bazı bağlantıların hiç veri göndermediğini gördüm. Bu yüzden oynatıcıyı \"linki aç\" seviyesinde bırakmadım:\n\n- Bağlantı yanıt vermezse aynı kanalın alternatif kaydını deniyor.\n- Kanal değiştirirken önceki oynatmayı temizleyip yenisini daha sağlıklı başlatıyor.\n- Doğrudan TS akışını önceliklendiriyor; m3u8 rotası uygun yanıt vermediğinde alternatif akış biçimine geçiyor.\n- Ses ve görüntü zamanlamasını Mi Stick'in donanım oynatıcısına uygun hale getirdim.\n\nCNN Türk, Haber Global, TGRT, KRT, TELE1 ve Flash Haber gibi farklı yayınları arka arkaya test ettim; bir kaynak cevap vermediğinde uygulamanın yedek kaynağa geçebildiğini gördüm.\n\n## Kumanda ve gerçek kullanım testleri\n\nUygulamanın dokunmatik ekran için değil, elimdeki eski TV kumandası için tasarlanması en önemli gereksinimimdi. Şu akışları gerçek cihaz üzerinde test ettim:\n\n- sol tuşla canlı TV rehberini açma\n- kategori listesinde uzun süre aşağı gezinme\n- kategori ile kanal listesi arasında sağ-sol geçiş\n- OK ile kanal açma\n- kanal numarasını doğrudan tuşlama\n- geri tuşuyla ekranları kapatma\n- ana ekrandan YouTube, Spotify ve Play Store'a geçme\n\nAyrıca rakam tuşlarıyla kanal numarası girmeyi, IPTV aramasında çok basmalı Türkçe klavye kullanımını ve YouTube arama alanına kumandayla yazı yazmayı denedim. Böylece ikinci bir kumanda veya kablosuz klavye taşıma ihtiyacı kalmadı.\n\nTest sırasında kategori menüsünün 10 saniye sonra kapanıp aşağı tuşunu kanal değiştirme olarak algıladığını fark ettim; menüde her hareket edildiğinde bekleme süresini yenileyecek şekilde düzelttim. Son testte 12 aşağı hareket boyunca odak kategori listesinde kaldı ve kanal değiştirme tetiklenmedi.\n\n## TV ile haberleşme\n\nTelevizyonum Philips 47PFL7008K/12 olduğu için Philips'in EasyLink/HDMI-CEC yaklaşımını da kullandım. TV kontrol ekranında bağlantı durumu, ses seviyesi ve Ambilight bilgisi görülebiliyor; televizyonun desteklediği durumlarda ses, mute ve Ambilight işlevlerine uygulama içinden erişilebiliyor. Bunun için TV'yi bilgisayara bağlayan özel bir donanım kullanmadım; Mi Stick'in ağ bağlantısından ve TV'nin kendi ağ/CEC yeteneklerinden yararlandım.\n\n## Sonuç: fikirden çalışan ürüne\n\nBu proje sayesinde eski bir televizyonu değiştirmeden, Xiaomi Mi TV Stick üzerinden kişisel bir akıllı TV sistemine dönüştürdüm. Önce stick'i gereksiz uygulamalardan temizledim, ardından yapay zekâ ile birlikte launcher'ı geliştirip canlı TV, radyo, film, dizi ve günlük uygulamaları tek bir ekranda topladım. IPTV.org listesinin otomatik yenilenmesi, eski Philips kumandasının bağlama duyarlı çalışması ve aynı kumandadan Türkçe metin girilebilmesi projenin ayırt edici tarafları oldu.\n\nBu, benim için sadece bir Android uygulaması yazmak değildi. Gerçek donanımı tanımayı, kablosuz ADB ile cihaza bağlanmayı, cihazı sadeleştirmeyi, eski bir kumandayı akıllı TV kumandasına dönüştürmeyi, rakam tuşlarından Türkçe klavye yapmayı ve gerçek yayın sorunlarını test ederek çözmeyi, yapay zekâ destekli uçtan uca bir süreçte gerçekleştirdim. Şimdi TV'yi açtığımda ne izleyeceksem ona daha hızlı ulaşıyor ve bütün sistemi tek kumandayla kullanabiliyorum.\n\n### Verimlilik üzerine\n\nBu proje küçük ve kişisel görünse de aslında daha büyük bir konuya işaret ediyor: yapay zekânın asıl değeri sadece yeni ürünler üretmek değil, var olan kaynakları daha verimli kullanabilmek. Elimde duran 2013 model bir televizyon ve ucuz bir TV Stick'i, sıfırdan yeni bir cihaz almadan, aylarca sürecek bir öğrenme eğrisine girmeden, kısa sürede işlevsel bir ürüne dönüştürebildim. Bu, hem zaman hem donanım hem de üretim kaynağı açısından bir verimlilik kazanımı.\n\nAynı mantık aslında her alana uygulanabilir: elde var olan donanımı, veriyi veya süreci sıfırdan değiştirmek yerine yapay zekâ desteğiyle yeniden değerlendirmek. Yeni bir cihaz üretmek, yeni bir sunucu almak, yeni bir ekip kurmak yerine, mevcut kaynağı akıllı bir yazılım katmanıyla dönüştürmek; hem maliyeti hem de kaynak tüketimini azaltıyor. Benim durumumda bu, çöpe gitmeyi bekleyen bir TV Stick'in elektronik atık olmaktan çıkıp yıllarca daha kullanılabilir hale gelmesi anlamına geldi.\n\nBunun bir başka boyutu da erişilebilirlik. Daha önce bu kapsamda bir Android TV uygulaması geliştirmek, gömülü sistemler, erişilebilirlik servisleri ve donanım entegrasyonu konusunda ciddi bir uzmanlık gerektirirdi. Yapay zekâ, bu teknik eşiği bireysel bir kullanıcının erişebileceği bir seviyeye indirdi. Asıl yenilikçi olan kısım da burada: yapay zekâ, uzman olmayan birinin elindeki eski donanımı, profesyonel bir üretim ekibi olmadan kullanılabilir bir ürüne dönüştürmesine izin veriyor.\n\nSonuç olarak bu proje bana şunu gösterdi: yapay zekâ ile verimlilik, büyük şirketlerin veri merkezlerinde veya devasa projelerde değil, ev kullanıcısının elindeki eski bir televizyonda da karşımıza çıkabiliyor. Daha az kaynakla, daha az atıkla ve daha kısa sürede, gerçekten kullanılabilir bir sonuç üretmek mümkün."
  }
  ],
  projectOverrides: [],
};

function text(value, fallback = '', maxLength = 10_000) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().slice(0, maxLength);
  return normalized || fallback;
}

function date(value, fallback = '') {
  const normalized = text(value, fallback, 40);
  return Number.isNaN(Date.parse(normalized)) ? fallback : normalized;
}

function assetUrl(value, fallback = '') {
  const normalized = text(value, fallback, 2_000);
  if (!normalized || /^\/(?!\/)/.test(normalized)) return normalized;

  try {
    const url = new URL(normalized);
    return ['http:', 'https:'].includes(url.protocol) ? normalized : fallback;
  } catch {
    return fallback;
  }
}

function externalUrl(value) {
  const normalized = assetUrl(value);
  return /^https?:\/\//.test(normalized) ? normalized : '';
}

export function slugifyContent(value) {
  return text(value, '', 160)
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

function normalizeSettings(value) {
  const defaults = defaultSiteContent.settings;
  const email = text(value?.email, defaults.email, 254);
  const secondaryEmail = text(
    value?.secondaryEmail,
    defaults.secondaryEmail,
    254,
  );

  return {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : defaults.email,
    secondaryEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(secondaryEmail)
      ? secondaryEmail
      : defaults.secondaryEmail,
    displayName: text(value?.displayName, defaults.displayName, 120),
    tagline: text(value?.tagline, defaults.tagline, 240),
    aboutText: text(value?.aboutText, defaults.aboutText, 30_000),
    contactText: text(value?.contactText, defaults.contactText, 240),
  };
}

function normalizeBlogPost(value) {
  if (!value || typeof value !== 'object') return null;

  const title = text(value.title, '', 240);
  const body = text(value.body, '', 200_000);
  const slug = slugifyContent(value.slug || title);
  if (!title || !body || !slug) return null;

  return {
    id: text(value.id, `post-${slug}`, 160),
    title,
    slug,
    excerpt: text(value.excerpt, '', 2_000),
    category: text(value.category, 'Notlar', 120),
    publishedAt: date(value.publishedAt),
    coverImage: assetUrl(value.coverImage),
    coverCaption: text(value.coverCaption, '', 500),
    body,
  };
}

function normalizeProject(value) {
  if (!value || typeof value !== 'object') return null;

  const title = text(value.title, '', 240);
  const pathSlug = String(value._path || '')
    .split('/')
    .filter(Boolean)
    .pop();
  const slug = slugifyContent(pathSlug || value.slug || title);
  if (!title || !slug) return null;

  const description = text(value.description, '', 5_000);
  const tags = Array.isArray(value.tags)
    ? value.tags
        .map((tag) => text(tag, '', 80))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  const image = assetUrl(value.image, assetUrl(value.previewImage, '/logo.png'));
  const previewImage = assetUrl(value.previewImage, image);

  return {
    _path: `/project/${slug}`,
    title,
    description,
    tags,
    previewImage,
    image,
    bodyText: text(value.bodyText, description, 100_000),
    live: externalUrl(value.live),
    hidden: value.hidden === true,
    isNew: value.isNew === true,
    createdAt: date(value.createdAt, new Date(0).toISOString()),
  };
}

function uniqueNormalized(values, normalizer, key) {
  const seen = new Set();
  return (Array.isArray(values) ? values : [])
    .slice(0, 500)
    .map(normalizer)
    .filter((item) => {
      if (!item || seen.has(item[key])) return false;
      seen.add(item[key]);
      return true;
    });
}

export function normalizeSiteContent(value) {
  return {
    settings: normalizeSettings(value?.settings),
    blogPosts: uniqueNormalized(value?.blogPosts, normalizeBlogPost, 'slug'),
    projectOverrides: uniqueNormalized(
      value?.projectOverrides,
      normalizeProject,
      '_path',
    ),
  };
}
