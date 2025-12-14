document.addEventListener('DOMContentLoaded', () => {
    // 🚨 1. Configuration (ATTENTION SÉCURITÉ !)
    // Pour une application PRO, cette clé DOIT être sur un serveur backend.
    const GEMINI_API_KEY = "AIzaSyBPArIqM7bpNRqqXuTDGnrVpyIPLE7ot-I"; 

    // 2. Références DOM
    const imageInput = document.getElementById('image-input');
    const scanButton = document.getElementById('scan-button');
    const preview = document.getElementById('preview');
    const loadingText = document.getElementById('loading-text');
    const resultsContent = document.getElementById('results-content');
    const preventionNote = document.getElementById('prevention-note');
    
    // Simuler le profil utilisateur (CETTE PARTIE DOIT ÊTRE DÉFINIE PAR L'UTILISATEUR DANS VOTRE INTERFACE)
    const userProfile = {
        condition: "Diabète de type 2", 
        allergies: ["Lait", "Noix", "Gluten"]
    };


    // 3. Événements de l'Interface
    
    // Déclencher le sélecteur de fichier/caméra
    scanButton.addEventListener('click', () => {
        imageInput.click();
    });

    // Gérer le fichier sélectionné par l'utilisateur
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // Affichage des états
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
            resultsContent.innerHTML = '<p>Préparation de l\'image...</p>';
            loadingText.style.display = 'block';
            preventionNote.style.display = 'none';

            // Démarrer la conversion et l'envoi
            convertToBase64(file);
        }
    });

    // 4. Conversion et Appel API
    
    // Convertir le fichier image en Base64
    function convertToBase64(file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Le résultat inclut le préfixe (ex: "data:image/jpeg;base64,...")
            const base64Image = reader.result;
            
            // Appeler la fonction d'analyse IA
            sendToGemini(base64Image);
        };
        reader.onerror = (error) => {
            console.error('Erreur de conversion Base64 :', error);
            displayError('Erreur lors de la lecture de l\'image.');
        };
    }
    
    // Envoyer l'image Base64 directement à l'API Gemini
    async function sendToGemini(base64Image) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "VOTRE_CLÉ_API_GEMINI_ICI") {
            displayError('Erreur: Veuillez insérer votre clé API Gemini dans le fichier app.js.');
            return;
        }
        
        resultsContent.innerHTML = '<p>Analyse en cours par l\'IA Gemini...</p>';

        // Supprimer le préfixe Base64 (ex: "data:image/jpeg;base64,")
        const imagePayload = base64Image.split(',')[1]; 
        const mimeType = 'image/jpeg'; 

        // 5. Définition du Prompt pour Gemini (INTÈGRE LES INSTRUCTIONS SYSTÈME)
        
        const fullPrompt = `Tu es un nutritionniste IA professionnel pour une application de santé appelée Misu Bala Alimentation. Ta réponse doit être UNIQUEMENT en HTML pour l'affichage web, formatée avec des titres, listes et mises en gras. Agis comme un assistant d'analyse alimentaire.
            
            Analyse cette photo d'aliment ou de code barre.
            
            **Informations Demandées :**
            1.  **Composants Majaux :** Fournis les principaux composants nutritionnels (protéines, sucres, graisses, fibres, calories estimées).
            2.  **Toxicité :** Indique clairement s'il y a des substances potentiellement toxiques ou des additifs dangereux.
            3.  **Prévention et Recommandations :** Donne des conseils spécifiques et précis pour un utilisateur avec la condition : **${userProfile.condition}**, et des allergies à : **${userProfile.allergies.join(', ')}**.
            
            Ta réponse doit être détaillée, factuelle et commencer directement par la balise <h3>.`;

        const requestBody = {
            contents: [{
                role: "user",
                parts: [
                    { inlineData: { data: imagePayload, mimeType: mimeType } },
                    { text: fullPrompt }
                ]
            }]
            // ❌ L'objet 'config' (et son contenu) EST SUPPRIMÉ ici pour corriger l'erreur ❌
        };

        try {
            // Appel API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            // 6. Traitement de la Réponse Gemini
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
                const geminiResult = data.candidates[0].content.parts[0].text;
                
                // Afficher le résultat HTML direct de Gemini
                displayResults(geminiResult, `Conseils basés sur un profil : ${userProfile.condition}. Consultez un professionnel de la santé.`);
                
            } else if (data.error) {
                // Afficher le message d'erreur s'il est présent
                displayError(`Erreur API : ${data.error.message}`);
            } else {
                displayError('Analyse terminée, mais aucune donnée exploitable reçue. Le modèle a pu bloquer la réponse.');
            }

        } catch (error) {
            console.error('Erreur réseau ou appel API :', error);
            displayError('Échec de la connexion à l\'API Gemini. Vérifiez votre clé ou votre connexion Internet.');
        } finally {
            loadingText.style.display = 'none';
        }
    }

    // 7. Fonctions d'Affichage
    
    function displayResults(analysisHTML, preventionText) {
        resultsContent.innerHTML = analysisHTML;
        
        // Afficher la note de prévention
        document.getElementById('prevention-note').style.display = 'block';
        document.getElementById('prevention-text').textContent = preventionText;
    }
    
    function displayError(message) {
        loadingText.style.display = 'none';
        resultsContent.innerHTML = `<p style="color: red; font-weight: bold;">${message}</p>`;
        document.getElementById('prevention-note').style.display = 'none';
    }
});
