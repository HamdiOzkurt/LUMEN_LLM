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
```

### 3. Servisi Başlatma

```bash
# Geliştirme modu
npm run dev

# Canlı ortam (Production)
npm start
```

## Entegrasyon ve API Kullanımı

Sistemin verileri analiz edebilmesi için, client veya server tarafındaki uygulamalarınızın yaptığı LLM çağrılarını bu backend servisine iletmesi gerekmektedir.

### API Endpoints (Özet)

Bu servis, verileri toplamak ve raporlamak için aşağıdaki ana erişim noktalarını sunar:

- **Veri Girişi (POST /api/logs):** Uygulamanızın yaptığı her LLM işlemini (OpenAI call, Gemini call vb.) buraya gönderirsiniz.
- **Raporlama (GET /api/metrics):** Maliyet, token kullanımı ve zaman serisi verilerini çeker.

## Gerçek Zamanlı İzleme (WebSocket)

Panel üzerindeki veriler canlı olarak akar.

```javascript
const socket = io("http://localhost:3000");
socket.on("new-log", (log) => {
  console.log("Yeni LLM kullanımı tespit edildi:", log);
});
```

## Lisans

ISC
