import streamlit as st
import pandas as pd
import joblib

# Sayfa ayarları
st.set_page_config(page_title="SafeSpace Radar", layout="wide")
st.title("🛡️ SafeSpace: Kitle Toksisite ve Risk Radarı")
st.markdown("STK'lar ve Markalar için Gerçek Zamanlı Kriz Analiz Paneli")

# Modeli ve Veriyi Yükleme (Sadece bir kere yükler, hızlı çalışır)
@st.cache_resource
def load_model_and_data():
    loaded_vectorizer = joblib.load('cevirmen.pkl')
    loaded_model = joblib.load('yapay_zeka_modeli.pkl')
    # Orijinal veriyi de sonuçları filtrelemek için yüklüyoruz
    df = pd.read_csv("labeled_data.csv")
    df = df[['tweet', 'class']]
    import numpy as np
    markalar = ['#MarkaKrizi', '#BoykotX', '#KampanyaY', '#MusteriSikayeti']
    df['aranan_hashtag'] = np.random.choice(markalar, size=len(df))
    return loaded_vectorizer, loaded_model, df

vectorizer, model, df = load_model_and_data()

# Kullanıcı Arayüzü: Arama Çubuğu
arama = st.selectbox("İncelemek İstediğiniz Kampanyayı/Hashtag'i Seçin:", 
                     ['#MarkaKrizi', '#BoykotX', '#KampanyaY', '#MusteriSikayeti'])

if st.button("Kitleyi Analiz Et"):
    ilgili_tweetler = df[df['aranan_hashtag'] == arama]['tweet']
    
    if len(ilgili_tweetler) > 0:
        with st.spinner("Yapay zeka metinleri analiz ediyor..."):
            yeni_sayilar = vectorizer.transform(ilgili_tweetler)
            tahminler = model.predict(yeni_sayilar)
            
            toplam = len(tahminler)
            nefret = (list(tahminler).count(0) / toplam) * 100
            saldirgan = (list(tahminler).count(1) / toplam) * 100
            temiz = (list(tahminler).count(2) / toplam) * 100
            
            # Sonuçları Görselleştirme
            st.success(f"Analiz Tamamlandı! {toplam} adet etkileşim incelendi.")
            
            col1, col2, col3 = st.columns(3)
            col1.metric("🔴 Radikal / Nefret Söylemi", f"%{nefret:.1f}")
            col2.metric("🟠 Toksik / Saldırgan", f"%{saldirgan:.1f}")
            col3.metric("🟢 Temiz İletişim", f"%{temiz:.1f}")
            
            st.progress(int(nefret + saldirgan))
            if (nefret + saldirgan) > 50:
                st.error("🚨 KRİZ UYARISI: Bu kitlede yüksek oranda radikalleşme ve marka değerine zarar verici söylem tespit edildi!")
    else:
        st.warning("Veri bulunamadı.")