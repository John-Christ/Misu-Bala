// app.js (VERSION CORRIGÉE)

// ... (constantes et autres fonctions inchangées)

async function sendToGemini(base64Image) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "VOTRE_CLÉ_API_GEMINI_ICI") {
        displayError('Erreur: Veuillez insérer votre clé API Gemini dans le fichier app.js.');
        return;
    }
    
    // ... (Logique userProfile, imagePayload et mimeType inchangée)

    // Construction du prompt complet (inchangée)
    const fullPrompt = `...`; 
    
    // 🚨 CORRECTION DE LA STRUCTURE DE LA REQUÊTE JSON 🚨
    const requestBody = {
        contents: [{
            role: "user",
            parts: [
                { inlineData: { data: imagePayload, mimeType: mimeType } },
                { text: fullPrompt }
            ]
        }],
        // Le champ de configuration doit être 'config' ou 'generationConfig' selon la bibliothèque/l'API. 
        // Pour les appels directs REST v1beta, il s'agit souvent de `generationConfig` ou simplement d'inclure les options directement dans le corps principal.
        // Tentons d'utiliser le nom `generationConfig` comme attendu par la plupart des SDK REST.
        generationConfig: {
            temperature: 0.2,
            // Pour l'instruction système, on peut la mettre dans le prompt pour les appels REST directs si elle pose problème séparément
        }
        // Note: Nous retirons systemInstruction du champ de configuration car il cause souvent des erreurs 
        // dans les appels REST directs et est mieux géré dans le prompt principal.
    };

    try {
        // ... (Appel fetch inchangé)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        // ... (Le reste du traitement de la réponse est inchangé)
        
    } catch (error) {
        // ...
    } finally {
        // ...
    }
}
