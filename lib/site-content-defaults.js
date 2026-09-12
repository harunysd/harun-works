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
    "id": "post-yapay-zeka-ile-eski-tv-mi-yenilikci-bir-akilli-tv-sistemine-donusturdum",
    "title": "Yapay Zekâ ile Eski TV’mi Yenilikçi Bir Akıllı TV Sistemine Dönüştürdüm",
    "slug": "yapay-zeka-ile-eski-tv-mi-yenilikci-bir-akilli-tv-sistemine-donusturdum",
    "excerpt": "Eski bir televizyonu ve Xiaomi Mi TV Stick’i yapay zekâ desteğiyle kişisel bir akıllı TV platformuna dönüştürdüm. 2013 model Philips kumandasıyla HDMI-CEC üzerinden çalışan, T9 Türkçe klavye destekli, canlı TV ve IPTV rehberli özel bir deneyim.",
    "category": "Sistem",
    "publishedAt": "2026-09-12",
    "coverImage": "/img/blog/oem-tv-launcher/cover.png",
    "coverCaption": "Philips Ambilight TV ve Mi Stick ile çalışan kişisel akıllı TV ortamı",
    "body": "## Kısa özet\n\nBu proje, yapay zekâ destekli geliştirme sayesinde eski bir televizyonu ve mevcut kumandasını yeniden değerlendiren kişisel bir TV platformudur. Televizyonun HDMI girişine bağlı Xiaomi Mi TV Stick'i küçük bir Android bilgisayar gibi kullandım; yapay zekâ ile birlikte geliştirilen uygulama da bu cihazın ana ekranı, canlı TV uygulaması, radyo oynatıcısı ve film-dizi menüsü olarak çalışıyor.\n\nSonuçta televizyonu açtığımda karşıma reklam ve gereksiz önerilerle dolu standart bir menü yerine, kendi kullanım alışkanlıklarıma göre şekillenen tek bir ekran geliyor. Bu kapsamda sonuç, benim ezbere tek başıma yazdığım bir uygulama değildir. Yapay zekâ olmasaydı bu projeyi bu kapsamda gerçekleştiremezdim; fikir, donanım, ürün kararları ve gerçek cihaz testleri benden, teknik üretim ve problem çözme gücü ise yapay zekâdan geldi.\n\n## Kullandığım gerçek cihazlar\n\n| Parça | Bilgi |\n| :--- | :--- |\n| Televizyon | Philips 47PFL7008K/12, 47 inç, Ambilight ve EasyLink/HDMI-CEC destekli |\n| Android cihaz | Xiaomi Mi TV Stick |\n| Stick sistem modeli | `MiTV-AYFR0` — cihaz kodu: `soul` |\n| Bağlantı | Televizyona HDMI, internete Wi-Fi |\n| Görüntü | 1920 × 1080 çözünürlükte test edildi |\n\nBurada önemli nokta şu: Televizyonu sökmedim veya televizyonun işletim sistemini değiştirmedim. Televizyon görüntüyü gösteriyor, akıllı özellikleri ve hazırladığım menüyü Mi Stick çalıştırıyor.\n\n## Başlangıçta ne vardı?\n\nBaşlangıçta Mi Stick üzerinde normal Android TV uygulamaları, Xiaomi'nin kendi TV menüleri ve bir IPTV yayın listesi vardı. Ancak hazır menüde reklamlar, öneriler ve kullanılmayan uygulamalar bulunuyordu. Yayın listesinde de aynı kanalın SD, HD, FHD, VIP veya Avrupa sürümleri ayrı ayrı görünüyordu.\n\nBu yapı teknik olarak çalışsa da günlük kullanımda yorucuydu. Bir kanalı bulmak için uzun listelerde dolaşmak, farklı uygulamalar arasında geçiş yapmak ve çalışmayan yayın bağlantılarını tekrar tekrar denemek gerekiyordu.\n\nBenim hedefim, bütün bu dağınık yapıyı tek bir ana ekranda toplamak oldu.\n\n## Önce Mi Stick'i temizledim\n\nUygulamayı geliştirmeden önce cihazı sadeleştirdim. Bunun için root işlemi yapmadan, kablosuz ADB üzerinden Android'in paket yönetimi komutlarını kullandım. Önce cihazın mevcut durumunu kaydettim; sonra temizlikten sonraki durumu tekrar alarak karşılaştırdım.\n\nTemizlikte özellikle şunları ayıkladım:\n\n- Xiaomi'nin reklam ve tanıtım odaklı PatchWall, Mi Channel ve Mi TV Plus bileşenleri,\n\n- stok Google TV launcher'ı ve ana ekrandaki öneri akışları,\n\n- kullanılmayan üçüncü taraf IPTV, tarayıcı, oyun ve yayın uygulamaları,\n\n- TV'de ihtiyacım olmayan ekran koruyucu, takvim, yazdırma ve bazı arka plan servisleri.\n\nYaklaşık 40'ın üzerinde uygulama/servis için işlem yaptım. Play Store, YouTube, Spotify ve sistemin çalışması için gerekli temel Android bileşenlerini korudum. Ayrıca hangi paketin neden temizlendiğini ve geri alınabileceğini gösteren bir liste ile geri yükleme betiği bıraktım.\n\nBu temizlikten sonra Mi Stick'in ana ekranı daha sakin hale geldi ve kendi uygulamamı cihazın TV ana ekranı olarak kullanmak mümkün oldu.\n\n## Bu proje nasıl üretildi? Yapay zekâ olmadan mümkün olmayacak teknik ortaklık\n\nBu çalışma, yapay zekâ destekli kodlama veya “vibe coding” yaklaşımının gerçek donanım üzerinde uygulanmış bir örneğidir. Bunu özellikle açık söylemek istiyorum: Bu proje benim bütün kodu ezbere tek başıma yazdığım bir çalışma değildir. Yapay zekâ olmasaydı, bu kapsamda bir Android TV uygulamasını; launcher, IPTV oynatma, kumanda yönlendirme, T9 klavye, erişilebilirlik servisi ve cihaz temizliğiyle birlikte geliştiremezdim. Projenin teknik kapsamı, yapay zekânın benim için erişilebilir hale getirdiği bir üretim alanı açtı.\n\nBen fikri, hedef kullanıcı deneyimini ve donanım bağlamını ortaya koydum: eski Philips kumandası kullanılacak, ana ekran sade olacak, kanallar Türkçe ve kolay bulunabilir olacak, IPTV.org listesindeki güncellemeler otomatik alınacak, çalışmayan yayınlarda uygulama mümkün olduğunca dayanıklı davranacaktı. Antigravity/Codex'i fikirden koda, dosya üretimine, mimari kararları somutlaştırmaya, hata çözümüne ve test sonuçlarını yorumlamaya kadar aktif kullandım. Yani yapay zekâ burada yalnızca birkaç kod satırını hızlandıran bir araç değil; uygulamanın teknik olarak kurulmasını mümkün kılan geliştirme ortağıydı.\n\nBenim katkım yalnızca başlangıç fikri değildi: cihazı hazırladım, gerçek kumandayla denedim, TV ekranındaki davranışları gözlemledim, neyin yanlış olduğunu tarif ettim, düzeltmeleri tekrar tekrar doğruladım ve hangi özelliklerin gerçekten işe yaradığını seçtim. Yapay zekâ teknik uygulama ortağım oldu; ben ise ürün yönünü, kabul ölçütlerini ve gerçek kullanım testini yönettim. Bu iş bölümü, “ben bütün kodu biliyordum ve yazdım” iddiası değil; AI ile birlikte fikirden çalışan ürüne giden gerçek bir üretim sürecidir.\n\nYenilik de burada ortaya çıkıyor: yapay zekânın teknik üretim kapasitesini, 2013 model bir Philips TV'nin eski kumandası ve temizlenmiş bir Mi Stick ile çalışan gerçek bir ev ürününe dönüştürmek. Bu, AI’ın tek başına ürettiği soyut bir demo değil; benim yönlendirdiğim, gerçek cihazda denediğim ve birlikte yinelediğimiz bir sistemdir.\n\n## Neden yenilikçi?\n\nBu projenin yeniliği yalnızca bir IPTV arayüzü yapmak değil. Üç farklı dünyayı tek bir deneyimde birleştiriyor:\n\n- 2013 yılına ait Philips TV kumandasını, bağlama göre çalışan Android TV kumandasına dönüştürüyor.\n\n- Hazır IPTV listesini sabit bir dosya olarak bırakmayıp IPTV.org/Xtream kaynağından otomatik olarak yeniliyor; Türkçe televizyon kanalları, radyolar ve listedeki diğer içerikler güncellendikçe uygulama bunları yeniden alıyor.\n\n- Yapay zekâ ile üretilen yazılımı, temizlenmiş düşük maliyetli bir Mi TV Stick üzerinde gerçek TV kullanımına uyarlıyor.\n\nBu nedenle ortaya çıkan şey yalnızca “AI kod yazdı” sonucu değildir. Asıl çalışma, AI ile üretilebilen kodu gerçek bir ev cihazının kısıtları, eski bir kumanda ve sürekli değişen yayın verisiyle birleştirip kullanılabilir hale getirmektir.\n\n## Projenin can alıcı noktası: Mi Stick'in tuşsuz kumandasına mahkûm kalmamak\n\nXiaomi Mi TV Stick veya benzeri akıllı TV cihazlarının kutusundan çıkan standart kumandalar son derece kısıtlıdır; üzerinde yalnızca yön tuşları, OK, geri, ses ve birkaç uygulama kısayolu bulunur. Üzerinde ne rakam tuşları (0–9) vardır ne de geleneksel televizyonların vazgeçilmezi olan Kanal İleri / Geri (CH+ / CH-) tuşları. Bu yüzden sıradan bir kullanıcı bir kanalı açmak için dakikalarca menülerde gezinmek veya ekrandaki sanal klavyede harf harf ilerlemek zorunda kalır.\n\nBen bu kısıtlamaya razı olmak yerine, televizyonun kendi 2013 model Philips kumandasını HDMI-CEC üzerinden sistemin ana kumandasına dönüştürdüm. Televizyondan gelen fiziksel tuş sinyallerini Android erişilebilirlik ve tuş yönlendirme katmanında yakalayarak klasik televizyon reflekslerini geri kazandım:\n\n- Doğrudan Rakamla Kanal Açma: Kumandadan örneğin 1, 24 veya 62119 tuşlayarak, menülerde hiç kaybolmadan ilgili kanala anında geçebiliyorum.\n\n- Gerçek Kanal Değiştirme (Zapping): Fiziksel kanal yukarı/aşağı tuşlarıyla, klasik televizyonlardaki gibi hızlı zapping yapılabiliyor.\n\n- Rakam Tuşlarından T9 Türkçe Klavye: Arama kutusu açıldığında aynı 0–9 tuşları, eski cep telefonlarındaki gibi çoklu basmalı (T9) klavyeye dönüşüyor. Ekran klavyesiyle boğuşmadan kumandadan Türkçe karakterler (ç, ğ, ı, ö, ş, ü) dahil hızlıca arama yapılabiliyor. Hatta geliştirdiğim erişilebilirlik servisi sayesinde bu yöntem YouTube'un kendi arama ekranında bile sorunsuz çalışıyor.\n\n- Bağlama Duyarlı Akıllı Yönlendirme: Aynı yön tuşları; canlı TV izlerken kanal zapping ve rehber açmaya, film-dizi izlerken oynatma ve bilgi paneline, menüdeyken ise liste gezinmesine otomatik olarak uyarlanıyor.\n\nBöylece tek bir ek kumanda veya harici kablosuz klavye satın almadan, 13 yıllık eski bir kumandayla modern bir akıllı televizyondan bile daha pratik ve alışılmış bir TV deneyimi elde ettim.\n\n## Uygulamayı nasıl geliştirdim?\n\nUygulamayı Android Studio ve Gradle tabanlı bir Android projesi olarak hazırladım. Arayüz tarafında Java ve XML kullandım. Kanal listelerinin düzenlenmesi için AndroidX RecyclerView, görüntü ve ses oynatma için Android Media3/ExoPlayer, internet istekleri için OkHttp, veri düzenleme için Gson ve kanal logoları için Glide kullandım.\n\nUygulamanın ana ekran olarak seçilebilmesi için Android TV'nin HOME ve LEANBACK özelliklerini kullandım. Böylece Mi Stick'in kumandasındaki yön tuşlarıyla her ekranda doğal bir TV kullanımı elde ettim.\n\nKablosuz geliştirme sırasında temel akış şu şekildeydi:\n\n> 1. **Mi Stick'i Wi-Fi üzerinden bul**  \n> 2. \u0007db connect <Mi Stick yerel IP adresi>:5555  \n> 3. **APK'yı yükle ve uygulamayı çalıştır**  \n> 4. **TV karşısında kumanda ile test et**  \n> 5. **Logları ve ekranı kontrol edip düzelt**\n\nBu yöntem sayesinde her denemede USB kablosu takıp çıkarmam gerekmedi. Uygulamayı bilgisayardan televizyona kablosuz olarak gönderip sonucu doğrudan TV ekranında gördüm.\n\n## Uygulamada yaptığım bölümler\n\n### Kişisel ana ekran\n\nAna ekranda TV, filmler, diziler, radyolar, YouTube, Play Store ve Spotify bölümleri bulunuyor. Seçili olan bölüm belirgin renkle gösteriliyor. Koyu arka plan, büyük yazılar ve sade simgeler televizyon izleme mesafesine göre tasarlandı.\n\n![Kişisel TV ana ekranı ve uygulama menüsü](/img/blog/oem-tv-launcher/home-menu.png)\n\nAlt menünün sırasını da kullanım şeklime göre düzenledim. Böylece en sık kullandığım bölümlere birkaç kumanda tuşuyla ulaşabiliyorum.\n\n### Canlı TV ve Akıllı Liste\n\nYayın listesini olduğu gibi göstermek yerine kanalları temizleyip kategorilere ayırdım. Akıllı Liste, Tüm Kanallar, Yedek TV, Ulusal, Haber, Spor, Belgesel, Çocuk, Sinema, Müzik, Dini ve Yerel gibi bölümler oluşturdum.\n\nAkıllı Liste'de aynı kanalın farklı kalite ve sağlayıcı kayıtlarını tek bir anlaşılır sıra içinde topladım. Kanal numarası, logo ve kanal adı aynı satırda görünüyor.\n\n![Canlı TV kanal rehberi](/img/blog/oem-tv-launcher/channel-guide.png)\n\nKumandada aşağı-yukarı tuşlarıyla geziniyor, OK ile kanalı açıyor, geri tuşuyla menüden çıkıyorum. Sık izlediğim kanalları favoriye ekleyebiliyor ve favoriler içinde ayrıca sıralayabiliyorum.\n\n### Film ve dizi bölümü\n\nCanlı yayınların yanında film ve diziler için ayrı menüler ekledim. Film posterleri, dizi bilgileri, sezonlar ve bölümler aynı uygulamanın içinde açılıyor. Böylece TV izlemekten filme veya diziye geçmek için uygulama değiştirmiyorum.\n\nFilm veya dizi kartının üzerine gelindiğinde başlık için çevrim içi metadata aranıyor. Uygulama temizlenmiş başlığı Cinemeta'nın Stremio API'sinde arıyor; sonuçtan IMDb kimliğini ve imdbRating alanını alarak ekranda IMDb puanını, özetini, yılı, türlerini ve uygun arka plan görselini gösterebiliyor. Sonuçlar bellekte önbelleğe alındığı için aynı başlık tekrar seçildiğinde ekran daha hızlı güncelleniyor.\n\nBurada önemli bir teknik ayrım var: Uygulama IMDb sayfasını kazımıyor veya puan uydurmuyor; puanı Cinemeta'nın IMDb bağlantılı metadata alanından alıyor. Film ve dizi için ayrı arama uçları kullanılıyor. Dizi aramasında film kataloğuna düşerek yanlış eşleşme olmaması için başlık temizleme, sonuç başlığı karşılaştırması ve içerik türü ayrımı uygulanıyor. Bu yaklaşım, örneğin “Kurtlar Vadisi” gibi dizilerde başka bir yapımın puanının gösterilmesi riskini azaltıyor.\n\n### Radyo oynatıcısı\n\nRadyo bölümünde istasyon adı, logo, yayın bilgisi ve hareketli bir ses görselleştirmesi bulunuyor. Radyo istasyonlarını da listeleyip sıralayabiliyorum.\n\n![Çalışan sistemden alınmış güncel radyo listesi ve oynatıcısı](/img/blog/oem-tv-launcher/radio-player.png)\n\nBu bölüm sayesinde televizyonu sadece görüntü izlemek için değil, müzik veya radyo dinlemek için de kullanabiliyorum.\n\n### YouTube ve diğer uygulamalar\n\nMi Stick üzerinde zaten bulunan YouTube, Spotify ve Play Store'u kaldırmak yerine kendi ana ekranıma bağladım. Böylece kişisel TV menüm ile hazır Android TV uygulamaları birlikte çalışıyor.\n\n## IPTV.org listesinin otomatik güncellenmesi ve canlı yayın dayanıklılığı\n\nUygulama ikinci bir IPTV sağlayıcısına bağlı değildir. Bunun yerine tek IPTV.org/Xtream listesinin kategori ve kanal verilerini otomatik olarak yeniler. Uygulama açılırken önce son başarılı veriyi önbellekten gösterebilir; ardından ağ üzerinden güncel kategori ve canlı yayın listesini alıp önbelleği yeniler. Böylece kaynak listeye yeni Türkçe kanallar, radyolar veya başka içerikler eklendiğinde uygulamanın kanal ekranı da manuel olarak APK değiştirmeden güncellenebilir.\n\nAynı kanalın listede bulunan farklı kalite veya kayıtlarını ise ayrı bir sağlayıcı gibi sunmuyorum. Bunlar aynı kaynağın alternatif yayın kayıtlarıdır ve ilk yayın açılmazsa aynı kanalın başka bir kaydı denenebilir.\n\nGerçek cihazda denediğimde bazı kanalların geç açıldığını, bazılarında siyah ekran kaldığını ve bazı bağlantıların hiç veri göndermediğini gördüm. Bu nedenle oynatıcıyı sadece “linki aç” seviyesinde bırakmadım.\n\nUygulama, yayın bağlantısını açarken daha kontrollü bekliyor. Bağlantı yanıt vermiyorsa aynı kanalın listede bulunan alternatif kaydını deneyebiliyor. Kanal değiştirirken önceki oynatmayı temizleyip yeni kanalı daha sağlıklı başlatıyor. Doğrudan TS akışını önceliklendiriyor; sağlayıcının m3u8 rotası uygun yanıt vermediğinde alternatif akış biçimine geçebiliyor. Ses ve görüntünün zamanlamasını da Mi Stick'in donanım oynatıcısına uygun hale getirdim.\n\nBu testlerde CNN Türk, Haber Global, TGRT, KRT, TELE1 ve Flash Haber gibi farklı yayınları arka arkaya açtım. Bir yayın kaynağı cevap vermediğinde uygulamanın yedek kaynağa geçebildiğini gördüm.\n\n## Kumanda ve gerçek kullanım testleri\n\nUygulamanın dokunmatik ekran için değil, elimdeki eski TV kumandası için tasarlanması benim için en önemli gereksinimdi. Yeni bir akıllı kumandaya geçmeden, 2013 model kumandanın bütün kullanılabilir tuşlarını değerlendirdim. Bu yüzden özellikle şu akışları gerçek cihaz üzerinde test ettim:\n\n- Sol tuşla canlı TV rehberini açma,\n\n- kategori listesinden uzun süre aşağı doğru gezinme,\n\n- kategori ile kanal listesi arasında sağ-sol geçiş,\n\n- OK ile kanal açma,\n\n- kanal numarasını doğrudan tuşlama,\n\n- geri tuşuyla ekranları kapatma,\n\n- ana ekrandan YouTube, Spotify ve Play Store'a geçme.\n\nBuna ek olarak rakam tuşlarıyla kanal numarası girmeyi, IPTV aramasında çok basmalı Türkçe klavye kullanımını ve YouTube arama alanına kumandayla yazı yazmayı denedim. Böylece Mi Stick'i kullanırken ikinci bir kumanda veya kablosuz klavye taşıma ihtiyacı kalmadı.\n\nTest sırasında kategori menüsünün 10 saniye sonra kapanıp aşağı tuşunu kanal değiştirme olarak algıladığını fark ettim. Bunun sebebini bulup menüde her hareket edildiğinde bekleme süresini yenileyecek şekilde düzelttim. Son testte 12 aşağı hareket boyunca odak kategori listesinde kaldı ve kanal değiştirme tetiklenmedi.\n\n### TV ile haberleşme\n\nTelevizyonum Philips 47PFL7008K/12 olduğu için projede Philips'in EasyLink/HDMI-CEC yaklaşımını da dikkate aldım. TV kontrol ekranında bağlantı durumu, ses seviyesi ve Ambilight bilgisi görülebiliyor. Televizyonun desteklediği durumlarda ses, mute ve Ambilight gibi işlevlere uygulama içinden ulaşılabiliyor.\n\nBu özellikleri hazırlarken TV'yi bilgisayara bağlayan özel bir donanım kullanmadım; Mi Stick'in ağ bağlantısı ve TV'nin kendi ağ/CEC yeteneklerinden yararlandım.\n\n## Sonuç: fikirden çalışan ürüne\n\nBu proje sayesinde eski veya sıradan bir televizyonu değiştirmeden, Xiaomi Mi TV Stick üzerinden kişisel bir akıllı TV sistemine dönüştürdüm. Önce stick'i gereksiz uygulamalardan temizledim; ardından yapay zekâ ile birlikte launcher'ı geliştirip canlı TV, radyo, film, dizi ve günlük uygulamaları tek bir ekranda topladım. IPTV.org listesinin otomatik yenilenmesi, eski Philips kumandasının bağlama duyarlı çalışması ve aynı kumandadan Türkçe metin girilebilmesi projenin ayırt edici taraflarını oluşturdu.\n\nBu çalışma benim için sadece bir Android uygulaması yazmak değildi. Yapay zekâ olmasaydı bu kapsamda tek başıma gerçekleştiremeyeceğim teknik bir sistemi, kendi fikrim ve gerçek kullanım geri bildirimlerimle birlikte adım adım ürüne dönüştürdüm. Gerçek donanımı tanımayı, kablosuz ADB ile cihaza bağlanmayı, cihazı sadeleştirmeyi, eski bir 2013 kumandayı akıllı TV kumandasına dönüştürmeyi, rakam tuşlarından Türkçe klavye yapmayı, TV kumandasıyla kullanılabilir bir arayüz tasarlamayı ve gerçek yayın sorunlarını test ederek çözmeyi AI destekli uçtan uca bir geliştirme süreci içinde gerçekleştirdim.\n\nSon durumda TV'yi açtığımda, ne izleyeceksem ona daha hızlı ulaşabiliyor ve bütün sistemi tek kumandayla kullanabiliyorum. Benim açımdan projenin değeri, yapay zekâyı soyut bir kod üreticisi olarak bırakmayıp eski bir TV, eski bir kumanda ve değişken IPTV verisiyle çalışan yenilikçi bir ev ürününe bağlamış olmamdır. Bu proje, AI olmasaydı benim için erişilebilir olmayacak bir teknik kapsamın, doğru fikir ve gerçek dünya testleriyle nasıl çalışan bir ürüne dönüşebileceğini gösteriyor."
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
