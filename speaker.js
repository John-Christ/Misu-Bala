 // VOICE FUNCTION
        function speak() {
            let text = resultsContent.innerText.replace(/[*#`]/g, '').trim();
         //   text.lang = 'fr-FR';
            if (!text) return;

            // Try Native Android Voice first
            if (window.Android && window.Android.speak) {
                window.Android.speak(text);
            
          //  const utterance = new SpeechSynthesisUtterance(text);
            // On récupère toutes les voix disponibles sur le téléphone
           //const voices = window.Android.getVoices();
            
            // On cherche spécifiquement une voix française (fr-FR ou fr-CA)
          //  const frenchVoice = voices.find(voice => voice.lang.includes('fr, en'));

           // utterance.voice = frenchVoice;

          //  utterance.lang = 'fr-FR';
           // utterance.pitch = 1.0;
         //   utterance.rate = 1.0;

          //  window.frenchVoice.speak();



            } else {
                // Fallback for Web
                window.speechSynthesis.cancel();
                const msg = new SpeechSynthesisUtterance(text);
                msg.lang = 'fr-FR';
                window.speechSynthesis.speak(msg);
            }
        }
