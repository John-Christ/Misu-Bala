// app.js (VERSION SÉCURISÉE FINALE avec Formulaire POST pour éviter les problèmes CORS)

// 🚨 1. Configuration - REMPLACEZ PAR VOTRE VRAIE URL GAS
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbznV3yxWyzzQS540r-68lHlYGcM_dT2TSByv8OxvwYMOH5RchxD_dBwaEop04QEqBgGdw/exec";


document.addEventListener('DOMContentLoaded', () => {
    // 2. Définition des éléments du DOM
    const imageInput = document.getElementById('image-input');
    const scanButton = document.getElementById('scan-button');
    
    // Assurez-vous que ces IDs existent dans votre HTML
    const resultsContent = document.getElementById('results-content'); 
    const loadingText = document.getElementById('loading-text');       
    const profileCondition = document.getElementById('profile-condition'); // Champ du profil
    // ... Ajoutez ici d'autres sélecteurs si nécessaire (allergies, etc.)

    // --- Fonctions d'aide ---
    
    /** Affiche les résultats formatés par Gemini. */
    function displayResults(geminiResult, metadata) {
        if (resultsContent) {
            // Utiliser un parseur Markdown si vous en avez un, sinon afficher tel quel
            resultsContent.innerHTML = `<h4>Résultat de l'analyse :</h4><div class="gemini-response">${geminiResult}</div>`;
            console.log(metadata); 
        }
    }

    /** Affiche les messages d'erreur. */
    function displayError(message) {
        if (resultsContent) {
            resultsContent.innerHTML = `<p class="error-message">⚠️ Erreur : ${message}</p>`;
        }
    }


    // 3. Gestion de la Capture et de l'Envoi
    
    // a. Déclenchement du clic sur le champ de fichier masqué
    if (scanButton && imageInput) {
        scanButton.addEventListener('click', () => {
            imageInput.click(); 
        });
    }

    // b. Lecture du fichier sélectionné
    if (imageInput) {
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
    }


    // 4. Fonction principale d'appel au BACKEND GAS (Méthode Formulaire POST pour éviter CORS)
    async function sendToGemini(base64Image) {
        if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("...")) {
            displayError('Erreur: Veuillez mettre à jour GAS_WEB_APP_URL dans le fichier app.js.');
            return;
        }
        
        // Afficher l'état de chargement
        if (resultsContent) resultsContent.innerHTML = '<h3>🌽 Analyse en cours par Misu Bala...</h3>';
        if (loadingText) loadingText.style.display = 'block';

        // Supprimer le préfixe Base64 (e.g., "data:image/jpeg;base64,")
        const imagePayload = base64Image.split(',')[1]; 
        
        // Définition du profil utilisateur (ASSUREZ-VOUS QUE CES VALEURS SONT BIEN DÉFINIES)
        // Vous pouvez lire les valeurs des champs HTML ici :
        const userProfile = { 
            condition: profileCondition ? profileCondition.value : "Général",
            allergies: "Aucune" // À adapter si vous avez un champ
        };
        
        // Le Prompt complet
        const fullPrompt = `Tu es un nutritionniste professionnel... (votre prompt complet)`;

        // Corps de la requête envoyé à GAS
        const requestData = {
            image: imagePayload,
            userProfile: userProfile,
            fullPrompt: fullPrompt
        };

        // --- Début du Contournement CORS via Formulaire POST ---
        
        // 1. Création d'un formulaire temporaire
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GAS_WEB_APP_URL;
        form.target = 'gas_iframe'; 
        form.style.display = 'none'; // Masquer le formulaire
        
        // 2. Création du champ de données JSON (nommé 'data' pour le backend GAS)
        const jsonInput = document.createElement('input');
        jsonInput.type = 'hidden';
        jsonInput.name = 'data'; 
        jsonInput.value = JSON.stringify(requestData);

        form.appendChild(jsonInput);
        document.body.appendChild(form);
        
        // 3. Ajout d'un iframe invisible pour recevoir la réponse sans recharger la page
        let iframe = document.getElementById('gas_iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.name = 'gas_iframe';
            iframe.id = 'gas_iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        
        // 4. Écouteur pour la réception des données de l'iframe
        // NOTE: La réception des données est complexe avec un iframe.
        // C'est une méthode de dernier recours qui garantit que le POST passe.
        // L'idéal est d'avoir un système de Polling ou de postMessage, mais
        // dans un Web App simple, cela garantit que la requête est envoyée.
        
        // Exemple très basique de gestion du chargement (à améliorer)
        iframe.onload = function() {
            if (loadingText) loadingText.style.display = 'none';
            resultsContent.innerHTML = '<h3>✅ Requête envoyée. Vérifiez la console pour la réponse du backend.</h3>';
            // Le résultat réel de l'API Gemini sera visible dans la console du script Apps Script.
        };

        // 5. Déclenchement de l'envoi du formulaire
        form.submit();
        // --- Fin du Contournement CORS ---
    }
    
    // Le reste du script se termine ici
});
    
    // L'étape de réception des résultats doit être gérée par un autre mécanisme 
    // ou par un script dans l'iframe si vous utilisez un système de communication postMessage.
    // Pour l'instant, on suppose que le backend renvoie le résultat et qu'on le gère ailleurs.
    // Pour un Web App simple, cela suffit à garantir que la requête POST parte sans blocage CORS.
    resultsContent.innerHTML = '<h3>🚀 Requête envoyée. Vérification en cours...</h3>';
}
