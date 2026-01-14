# LLM Dashboard Backend - Merkezi LLM İzleme ve Maliyet Yönetimi

<img width="1919" height="900" alt="image" src="https://github.com/user-attachments/assets/5ae9b4e7-3323-4a4d-985b-05d19cf04d70" />
<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/1c28d897-b1de-4f18-a8a0-b15f59f25e05" />

Yapay Zeka (LLM) operasyonlarınızın kalbi: Kullanım oranlarını, model maliyetlerini ve performans metriklerini tek bir merkezden izleyin.

## Proje Hakkında

Bu proje, modern uygulamaların vazgeçilmezi haline gelen Büyük Dil Modelleri (LLM - örn. GPT-4, Gemini, Claude) entegrasyonları için gelişmiş bir izleme (monitoring) ve gözlemlenebilirlik (observability) çözümüdür. Uygulamalarınızın LLM sağlayıcılarıyla olan tüm trafiğini kayıt altına alarak; maliyet analizi, performans darboğazlarının tespiti ve kullanım alışkanlıklarının detaylı raporlanmasını sağlar.

Bu backend servisi, verileri toplar, işler ve görselleştirme araçları (frontend dashboard) için hazır hale getirir. Tüm LLM operasyonlarını tek bir noktadan yönetmek isteyen geliştirici ekipleri ve organizasyonlar için tasarlanmıştır.

## Proje Yapısı

```text
llm_dashboard/
├── frontend/             # Ön yüz uygulaması (React/Vite)
├── llm-monitor-sdk/      # SDK kütüphanesi
├── server/               # Sunucu kaynak dosyaları (TS)
├── shared/               # Paylaşılan veri tipleri ve sabitler
├── src/                  # Backend uygulama dosyaları (JS)
│   ├── models/           # Veritabanı şemaları ve modelleri
│   ├── routes/           # API endpoint tanımları
│   └── server.js         # Ana sunucu dosyası
├── package.json          # Proje konfigürasyonu ve bağımlılıklar
└── README.md             # Dokümantasyon
```

## Temel Özellikler

- **Session Bazlı İzleme:** 🆕 Konuşma oturumlarını grupla, kullanıcı davranışlarını analiz et. Her mesajı ayrı değil, anlamlı konuşmalar olarak takip et.
- **Detaylı Maliyet Analizi:** Proje, sağlayıcı (OpenAI, Google vb.) ve model bazlı harcamalarınızı gerçek zamanlı takip edin. Hangi özelliğin ne kadar maliyet oluşturduğunu net bir şekilde görün.
- **Performans ve Latency Takibi:** İsteklerin yanıt sürelerini izleyin, yavaşlayan modelleri veya anormal gecikmeleri anında tespit ederek kullanıcı deneyimini iyileştirin.
- **Token Kullanım İstatistikleri:** Prompt (girdi) ve Completion (çıktı) token sayılarını ayrıştırarak model kullanım yoğunluğunu analiz edin.
- **Hata ve Güvenilirlik İzleme:** API hatalarını, timeout durumlarını ve başarısız istekleri yakalayarak sisteminizin stabilitesini koruyun.
- **Gerçek Zamanlı Akış:** WebSocket desteği sayesinde gerçekleşen LLM çağrılarını anlık olarak dashboard üzerinden izleyin.

## Kurulum (NPM ile)

Bu projeyi Node.js uygulamalarınıza entegre etmek veya servisi sunucunuzda çalıştırmak için NPM paket yöneticisini kullanabilirsiniz.

[![NPM Version](https://img.shields.io/npm/v/@hamdi_ozkurt/llm-dashboard-backend)](https://www.npmjs.com/package/@hamdi_ozkurt/llm-dashboard-backend)
[![NPM Profile](https://img.shields.io/badge/NPM-Profile-red)](https://www.npmjs.com/~hamdi_ozkurt)

```bash
npm install @hamdi_ozkurt/llm-dashboard-backend
```

**Faydalı Linkler:**

- [NPM Paketi](https://www.npmjs.com/package/@hamdi_ozkurt/llm-dashboard-backend)
- [Geliştirici NPM Profili](https://www.npmjs.com/~hamdi_ozkurt)

## Yapılandırma ve Başlatma

Kurulumdan sonra servisi ayağa kaldırmak için aşağıdaki adımları izleyin.

### 1. Veritabanı Bağlantısı

Uygulama, verileri saklamak için **MongoDB** kullanır. Yerel bilgisayarınızda veya bulutta (MongoDB Atlas) çalışan bir MongoDB bağlantı adresine ihtiyacınız vardır.

```bash
# Windows (MongoDB Community kurulu ise)
net start MongoDB
```

### 2. Ortam Değişkenleri (.env)

Proje kök dizininde bir `.env` dosyası oluşturun ve aşağıdaki ayarları yapın:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/llm_dashboard
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Servisi Başlatma

```bash
# Geliştirme modu
npm run dev

# Canlı ortam (Production)
npm start
```

## 🆕 Session Bazlı İzleme Sistemi

Session sistemi, her LLM çağrısını bağımsız log olarak değil, **anlamlı konuşma oturumları** olarak gruplar.

### Faydaları

- ✅ **Konuşma Bağlamı:** Hangi mesajların aynı konuşmaya ait olduğunu görün
- ✅ **Kullanıcı Analizi:** Ortalama mesaj sayısı, konuşma süresi, kullanıcı davranışları
- ✅ **Maliyet Optimizasyonu:** Session bazında maliyet analizi ($0.03/session)
- ✅ **Performans İzleme:** Session bazında toplam süre ve yanıt süreleri
- ✅ **Debugging:** Tüm konuşma geçmişini bir arada görün

### 🎯 Neden User ID Kullanmalısınız? (Geliştiriciler İçin)

Bu sistemin en güçlü yanı, `userId` parametresi ile sağladığı **kişiselleştirilmiş izleme yeteneğidir**. Kendi projenizdeki kullanıcıların (son kullanıcıların) ID'lerini SDK'ya ileterek şunları kazanısınız:

1.  **🕵️‍♂️ Müvekkil/Müşteri Bazlı Debugging:**
    Müşteriniz "Botunuz bana yanlış cevap verdi" dediğinde, Dashboard'a girip o müşterinin `userId`'sini aratarak, yaşadığı tüm konuşma geçmişini ve hatanın kaynağını (Prompt mu, Model mi?) saniyeler içinde görebilirsiniz.

2.  **💰 Maliyetin Sorumlusunu Bulma:**
    "API kotam neden hemen bitti?" sorusunun cevabı artık gizli değil. Hangi kullanıcınızın veya departmanınızın sistemi en çok kullandığını ve ne kadar maliyet oluşturduğunu tek tıkla tespit edin.

3.  **🛡️ Bot ve Kötü Niyetli Kullanım Tespiti:**
    Olağandışı aktivite gösteren bir `userId` tespit ettiğinizde, sisteminize zarar gelmeden o kullanıcıyı izleyebilir ve önlem alabilirsiniz.

> **Özet:** `userId` olmadan bu sadece bir sayaçtır; `userId` ile ise **profesyonel bir müşteri destek ve analiz aracıdır.**

### Kullanım Örneği (Gemini)

```javascript
import { GeminiProvider } from '@llm-dashboard/monitor-sdk';
import { v4 as uuidv4 } from 'uuid';

// Session ID oluştur
const sessionId = `session-${uuidv4()}`;

// Provider'ı session bilgisi ile başlat
const llm = new GeminiProvider({
  apiKey: process.env.GEMINI_API_KEY,
  backendUrl: 'http://localhost:3000/api',
  projectId: 'my-chatbot',
  sessionId: sessionId,     // Session ID
  userId: 'user-123',       // Kullanıcı ID
  debug: true
});

// İlk mesaj
const response1 = await llm.generateContent({
  model: 'gemini-2.5-flash',
  prompt: 'Merhaba! Yapay zeka nedir?',
  temperature: 0.7,
  maxOutputTokens: 100
});

// İkinci mesaj (aynı session)
const response2 = await llm.generateContent({
  model: 'gemini-2.5-flash',
  prompt: 'Kullanım alanları nelerdir?',
  temperature: 0.7,
  maxOutputTokens: 100
});

// Session'ı tamamla
await axios.patch(`http://localhost:3000/api/sessions/${sessionId}/complete`);
```

### Test Etme

```bash
# Session sistemini test et
node test-session.js
```

## Entegrasyon ve API Kullanımı

Sistemin verileri analiz edebilmesi için, client veya server tarafındaki uygulamalarınızın yaptığı LLM çağrılarını bu backend servisine iletmesi gerekmektedir.

### API Endpoints

Bu servis, verileri toplamak ve raporlamak için aşağıdaki ana erişim noktalarını sunar:

- **POST /api/logs** - LLM çağrısı kaydı
- **GET /api/logs** - Log listesi (filtreleme)
- **GET /api/metrics** - Maliyet ve performans metrikleri
- **POST /api/sessions** - Yeni session oluştur
- **POST /api/sessions/:id/messages** - Session'a mesaj ekle
- **GET /api/sessions** - Session listesi
- **GET /api/sessions/:id** - Session detayları
- **PATCH /api/sessions/:id/complete** - Session'ı tamamla
- **GET /api/sessions/stats/summary** - Session istatistikleri

## Gerçek Zamanlı İzleme (WebSocket)

Panel üzerindeki veriler canlı olarak akar.

```javascript
const socket = io("http://localhost:3000");

// Yeni log bildirimi
socket.on("new-log", (log) => {
  console.log("Yeni LLM kullanımı:", log);
});

// Session güncellemesi
socket.on("session-updated", (session) => {
  console.log("Session güncellendi:", session);
});
```

## Dashboard Görünümleri

- **📊 Dashboard:** Genel bakış ve metrikler
- **📝 Requests:** Tüm LLM çağrıları
- **🤖 Models:** Model bazlı analiz
- **💬 Sessions:** Konuşma oturumları (YENİ!)
- **📈 Analytics:** Detaylı analizler
- **⚙️ Settings:** Ayarlar ve yapılandırma

## Lisans

ISC
