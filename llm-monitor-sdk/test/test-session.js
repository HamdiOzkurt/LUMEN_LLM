
import { GeminiProvider } from '../src/index.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '../.env' });

async function testSessionSystem() {
    console.log('🚀 Gelişmiş Session Testi Başlıyor (React Debugging Senaryosu)...\n');

    // 1. Session ID ve User ID oluştur
    const sessionId = `session-${uuidv4()}`;
    const userId = 'hamdi_ozkurt';

    console.log(`📝 Session ID: ${sessionId}`);
    console.log(`👤 User ID: ${userId}\n`);

    // 2. Session'ı backend'de oluştur
    try {
        const sessionResponse = await axios.post('http://localhost:5000/api/sessions', {
            sessionId: sessionId,
            userId: userId,
            projectId: 'lumen-frontend',
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            metadata: {
                testMode: true,
                description: 'React useEffect debugging session',
                environment: 'development'
            }
        });
        console.log('✅ Session oluşturuldu:', sessionResponse.data.session.sessionId);
    } catch (error) {
        console.error('❌ Session oluşturma hatası:', error.message);
        console.error('💡 Backend çalışıyor mu? (Port 5000)');
        return;
    }

    // 3. Provider Başlat
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('❌ API Key eksik!');
        return;
    }

    const llm = new GeminiProvider({
        apiKey: apiKey,
        backendUrl: 'http://localhost:5000/api',
        projectId: 'lumen-frontend',
        sessionId: sessionId,
        userId: userId,
        debug: true
    });

    // ---------------------------------------------------------
    // SENARYO: React useEffect Double Invocation Sorunu
    // ---------------------------------------------------------

    // ADIM 1: Sorun Tanımı (Kullanıcı)
    try {
        console.log('\n👤 Adım 1: Kullanıcı sorunu anlatıyor...');
        const prompt1 = `React'te basit bir useEffect yazdım ama console.log iki kere çalışıyor. 
Component sadece bir kere render oluyor gibi görünüyor ama log iki tane. Neden olabilir? Kodum şöyle:

\`\`\`javascript
useEffect(() => {
  console.log('Mounted');
}, []);
\`\`\``;

        await llm.generateContent({
            model: 'gemini-2.5-flash',
            prompt: prompt1,
            maxOutputTokens: 2048
        });
        console.log('✅ Adım 1 tamamlandı.');
    } catch (error) { console.error('Hata:', error.message); }

    // ADIM 2: Çözüm Detaylandırma (Kullanıcı)
    try {
        await new Promise(r => setTimeout(r, 2000));
        console.log('\n👤 Adım 2: Kullanıcı çözüm istiyor...');

        await llm.generateContent({
            model: 'gemini-2.5-flash',
            prompt: "Peki bunu production'da da yaşar mıyım? Yoksa sadece development ortamına mı özel? Strict Mode'u nasıl kapatırım?",
            maxOutputTokens: 2048
        });
        console.log('✅ Adım 2 tamamlandı.');
    } catch (error) { console.error('Hata:', error.message); }

    // ADIM 3: Teşekkür ve Kapanış (Kullanıcı)
    try {
        await new Promise(r => setTimeout(r, 2000));
        console.log('\n👤 Adım 3: Kapanış...');

        await llm.generateContent({
            model: 'gemini-2.5-flash',
            prompt: "Anladım, teşekkürler! Strict Mode kalsın o zaman, side effectleri temizlemeyi öğrenmem daha iyi olur.",
            maxOutputTokens: 1000
        });
        console.log('✅ Adım 3 tamamlandı.');
    } catch (error) { console.error('Hata:', error.message); }

    // 4. Session'ı tamamla
    try {
        await axios.patch(`http://localhost:5000/api/sessions/${sessionId}/complete`);
        console.log('\n✅ Session başarıyla kaydedildi ve kapatıldı!');
    } catch (error) {
        console.error('❌ Tamamlama hatası:', error.message);
    }

    console.log('\n🌐 Dashboard URL: http://localhost:3000/sessions');
}

// Test'i çalıştır
testSessionSystem().catch(console.error);
