// app.js (VERSION SÉCURISÉE FINALE)

// 🚨 1. Configuration - REMPLACEZ PAR VOTRE VRAIE URL GAS
// Si vous lisez ceci, mettez ici l'URL de déploiement de votre Web App GAS
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbznV3yxWyzzQS540r-68lHlYGcM_dT2TSByv8OxvwYMOH5RchxD_dBwaEop04QEqBgGdw/exec";



document.addEventListener('DOMContentLoaded', () => {
    // 2. Définition des éléments du DOM
    const imageInput = document.getElementById('image-input');
    const scanButton = document.getElementById('scan-button');
    
    // --- Placeholders pour les éléments d'affichage ---
    // Ces variables sont nécessaires pour les fonctions ci-dessous
    const resultsContent = document.getElementById('results-content'); // Conteneur pour les résultats
    const loadingText = document.getElementById('loading-text');       // Texte de chargement/erreur

    // 3. Fonctions d'aide (à définir si elles manquent)
    
    /** Affiche les résultats formatés par Gemini. */
    function displayResults(geminiResult, metadata) {
        if (resultsContent) {
            resultsContent.innerHTML = `<h4>Résultat de l'analyse :</h4>${geminiResult}`;
            // Mettre la métadonnée ou autre information dans un conteneur séparé
            console.log(metadata); 
        }
    }

    /** Affiche les messages d'erreur. */
    function displayError(message) {
        if (resultsContent) {
            resultsContent.innerHTML = `<p class="error-message">⚠️ Erreur : ${message}</p>`;
        }
    }


    // 4. Gestion de la Capture et de l'Envoi
    
    // a. Déclenchement du clic sur le champ de fichier masqué
    scanButton.addEventListener('click', () => {
        imageInput.click(); 
    });

    // b. Lecture du fichier sélectionné
    imageInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Image = e.target.result; // Contient "data:image/jpeg;base64,..."
                await sendToGemini(base64Image);
            };
            reader.readAsDataURL(file);
        }
    });


    // 5. Fonction principale d'appel au BACKEND GAS
    async function sendToGemini(base64Image) {
        if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("...")) {
            displayError('Erreur: Veuillez mettre à jour GAS_WEB_APP_URL dans le fichier app.js.');
            return;
        }
        
        // Afficher l'état de chargement
        resultsContent.innerHTML = '<h3>🌽 Analyse en cours par Misu Bala...</h3>';
        if (loadingText) loadingText.style.display = 'block';

        // Supprimer le préfixe Base64 (e.g., "data:image/jpeg;base64,") pour le backend
        const imagePayload = base64Image.split(',')[1]; 
        
        // Définition du profil utilisateur (ASSUREZ-VOUS QUE CES VALEURS SONT BIEN DÉFINIES)
        const userProfile = { 
            condition: "Diabète", // Exemple
            allergies: "Aucune"   // Exemple
        };
        
        // Le Prompt complet
        const fullPrompt = `Tu es un nutritionniste professionnel... (votre prompt complet)`;

        // Corps de la requête envoyé à GAS
        const requestBody = {
            image: imagePayload,
            userProfile: userProfile, // Non utilisé dans Code.gs mais peut être utile plus tard
            fullPrompt: fullPrompt
        };

        try {
            // Appel au Web App GAS
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            // Masquer l'état de chargement
            if (loadingText) loadingText.style.display = 'none';

            // Gérer la réponse (qui est celle que GAS a renvoyée de Gemini)
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
                const geminiResult = data.candidates[0].content.parts[0].text;
                
                displayResults(geminiResult, `Conseils basés sur un profil : ${userProfile.condition}. Consultez un professionnel de la santé.`);
                
            } else if (data.error) {
                // Erreur renvoyée par l'API Gemini (via GAS)
                displayError(`Erreur API : ${data.error.message}`);
            } else if (data.details) {
                // Erreur attrapée par le bloc catch du Code.gs
                displayError(`Erreur Backend (GAS) : ${data.details}`);
            } else {
                displayError('Analyse terminée, mais aucune donnée exploitable reçue.');
            }

        } catch (error) {
            console.error('Erreur réseau ou appel API :', error);
            displayError('Échec de la connexion réseau. Le service Apps Script n\'est pas joignable. Vérifiez la console pour les erreurs CORS ou de réseau.');
        } 
    }

}); // <-- FIN du document.addEventListener('DOMContentLoaded')
