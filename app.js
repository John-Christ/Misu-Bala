// app.js (VERSION LA PLUS SIMPLE ET ROBUSTE)

// ... (constantes, userProfile, et autres fonctions inchangées)

async function sendToGemini(base64Image) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "AIzaSyDgy-DWOj_9JjF9Cly7Njt4k7k9N6XuTKI") {
        displayError('Erreur: Veuillez insérer votre clé dans le fichier py (INTERN).');
        return;
    }
    
    // ... (Logique userProfile, imagePayload et mimeType inchangée)

    // Supprimer le préfixe Base64
    const imagePayload = base64Image.split(',')[1]; 
    const mimeType = 'image/jpeg'; 

    // 5. Définition du Prompt : TOUTES les instructions sont intégrées ici.
    const fullPrompt = `Tu es un nutritionniste IA professionnel pour l'application Misu Bala Alimentation. Ta réponse doit être UNIQUEMENT en HTML, formatée avec des titres, listes et mises en gras.
        
        Analyse cette photo d'aliment ou de code barre.
        
        **Informations Demandées :**
        1.  **Composants Majaux :** Fournis les principaux composants nutritionnels (protéines, sucres, graisses, fibres, calories estimées).
        2.  **Toxicité :** Indique clairement s'il y a des substances potentiellement toxiques ou des additifs dangereux.
        3.  **Prévention et Recommandations :** Donne des conseils spécifiques et précis pour un utilisateur avec la condition : **${userProfile.condition}**, et des allergies à : **${userProfile.allergies.join(', ')}**.
        
        Ta réponse doit être détaillée, factuelle et commencer directement par la balise <h3>.`;

    // 🚨 CORRECTION : Retrait complet des champs 'config' et 'generationConfig' 🚨
    const requestBody = {
        contents: [{
            role: "user",
            parts: [
                { inlineData: { data: imagePayload, mimeType: mimeType } },
                { text: fullPrompt }
            ]
        }]
        // AUCUN autre champ ici. Nous simplifions au maximum.
    };

    try {
        // Appel API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        // 6. Traitement de la Réponse Gemini (inchangé)
        loadingText.style.display = 'none';

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            const geminiResult = data.candidates[0].content.parts[0].text;
            
            displayResults(geminiResult, `Conseils basés sur un profil : ${userProfile.condition}. Consultez un professionnel de la santé pour validation.`);
            
        } else if (data.error) {
            displayError(`Erreur API : ${data.error.message}. Vérifiez votre clé API.`);
        } else {
            displayError('Analyse terminée, mais le modèle n\'a pas renvoyé de texte. Vérifiez l\'image ou le prompt.');
        }

    } catch (error) {
        console.error('Erreur réseau ou appel API :', error);
        displayError('Échec de la connexion réseau. L\'API Gemini n\'est pas joignable.');
    } 
}

// ... (displayResults et displayError inchangées)
// ... (displayResults et displayError inchangées)
