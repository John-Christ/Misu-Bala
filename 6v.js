(function() {
    let selectedProfile = "Général";

    // Fonction globale pour changer le profil
    window.setProfile = function(profile) {
        selectedProfile = profile;
        const items = document.querySelectorAll('.catalog-item');
        items.forEach(item => item.style.borderColor = '#333');
        event.currentTarget.style.borderColor = 'var(--primary)';
        console.log("Profil activé : " + profile);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const imageInput = document.getElementById('image-input');
        const scanButton = document.getElementById('scan-button');
        const preview = document.getElementById('preview');
        const resultsContent = document.getElementById('results-content');
        const resultsSection = document.getElementById('results-section');
        const loading = document.getElementById('loading-overlay');

        // Gestion du clic sur le bouton principal
        scanButton.addEventListener('click', () => {
            imageInput.click();
            
            // Petit guide si rien ne se passe après 3 secondes
            setTimeout(() => {
                if (!preview.src || preview.style.display === 'none') {
                    resultsSection.classList.remove('hidden');
                    resultsContent.innerHTML = `
                        <p style="font-size: 13px; color: #8b949e; border-left: 2px solid var(--primary); padding-left: 10px;">
                            💡 <strong>Astuce :</strong> Si l'appareil photo ne s'ouvre pas, choisissez "Appareil Photo" dans le menu qui vient d'apparaître sur votre écran.
                        </p>`;
                }
            }, 3000);
        });

        // Gestion de la sélection de l'image
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                // Affichage de l'aperçu
                preview.src = event.target.result;
                preview.style.display = 'block';
                document.querySelector('.placeholder-icon').style.display = 'none';
                
                // Préparation de l'interface
                loading.style.display = 'block';
                resultsSection.classList.add('hidden');
                resultsContent.innerHTML = ""; // Nettoie le guide d'astuce

                const base64Data = event.target.result.split(',')[1];
                
                // Prompt ultra-professionnel
                const prompt = `Tu es une IA nutritionniste de pointe. Analyse cette image pour un profil : ${selectedProfile}. 
                Donne : 1. Nom de l'aliment. 2. Analyse des additifs (E...). 3. Score nutritionnel (A à E). 
                4. Conseil spécifique pour ${selectedProfile}. Réponds en HTML propre.`;

                // Appel au serveur Google Apps Script
                google.script.run
                    .withSuccessHandler((res) => {
                        loading.style.display = 'none';
                        resultsSection.classList.remove('hidden');
                        try {
                            const data = JSON.parse(res);
                            if (data.candidates && data.candidates[0].content) {
                                resultsContent.innerHTML = data.candidates[0].content.parts[0].text;
                            } else {
                                resultsContent.innerHTML = "⚠️ MISU BALA n'a pas pu identifier l'image. Réessayez avec une photo plus claire.";
                            }
                        } catch(e) {
                            resultsContent.innerHTML = "Analyse terminée : " + res;
                        }
                    })
                    .withFailureHandler((err) => {
                        loading.style.display = 'none';
                        resultsSection.classList.remove('hidden');
                        resultsContent.innerHTML = `<p style="color:red">Erreur : ${err.message}</p>`;
                    })
                    .analyzeImage({ image: base64Data, fullPrompt: prompt });
            };
            reader.readAsDataURL(file);
        });
    });
})();
</script>
