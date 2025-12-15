// app.js (NOUVELLE VERSION SÉCURISÉE)
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('image-input');
    const scanButton = document.getElementById('scan-button');

    // Assurez-vous que le bouton visible déclenche le clic sur le champ de fichier masqué
    scanButton.addEventListener('click', () => {
        imageInput.click(); // <--- CECI DOIT SE DÉCLENCHER
    });

// 🚨 1. Configuration - LA CLÉ API N'EST PLUS ICI !
// REMPLACEZ PAR L'URL DE DÉPLOIEMENT DE VOTRE WEB APP GAS
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbznV3yxWyzzQS540r-68lHlYGcM_dT2TSByv8OxvwYMOH5RchxD_dBwaEop04QEqBgGdw/exec"; 

// ... (constantes et événements inchangés)



// Envoyer l'image Base64 au BACKEND GAS
async function sendToGemini(base64Image) {
    if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("...")) {
        displayError('Erreur: Veuillez mettre à jour GAS_WEB_APP_URL dans le fichier app.js.');
        return;
    }
    
    resultsContent.innerHTML = '<h3> Analyse en cours par Misu Bala...</h3>';

    // Supprimer le préfixe Base64 pour le rendre plus propre à envoyer
    const imagePayload = base64Image.split(',')[1]; 
    
    const userProfile = { /* ... (définition de votre profil) ... */ };
    
    const fullPrompt = `Tu es un nutritionniste professionnel... (votre prompt complet)`;

    // Corps de la requête envoyé à GAS
    const requestBody = {
        image: imagePayload,
        userProfile: userProfile,
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
        
        loadingText.style.display = 'none';

        // Gérer la réponse (qui est celle que GAS a renvoyée de Gemini)
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            const geminiResult = data.candidates[0].content.parts[0].text;
            
            displayResults(geminiResult, `Conseils basés sur un profil : ${userProfile.condition}. Consultez un professionnel de la santé.`);
            
        } else if (data.error) {
            displayError(`Erreur API : ${data.error.message}`);
        } else if (data.details) {
            // Erreur attrapée par le bloc catch de GAS
            displayError(`Erreur Backend : ${data.details}`);
        } else {
            displayError('Analyse terminée, mais aucune donnée exploitable reçue.');
        }

    } catch (error) {
        console.error('Erreur réseau ou appel API :', error);
        displayError('Échec de la connexion réseau. Le service Apps Script n\'est pas joignable.');
    } 
}
// ... (displayResults et displayError inchangés)


   }); 
