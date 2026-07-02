# 🚀 Guide de test Postman - API d'Authentification

Ce guide détaille les étapes pour tester les routes d'inscription (`register`) et de connexion (`login`) de l'API.

## 🛠 Prérequis

Avant de commencer, assure-toi que :
1. Ton serveur de développement est lancé (via la commande `npm run dev` ou `npx tsx src/main.ts`).
2. Ton fichier `.env` est correctement configuré avec tes clés Supabase et ton `JWT_SECRET`.
3. Le serveur écoute bien sur le port 3000 (ex: `http://localhost:3000`).

---

## 1️⃣ Étape 1 : Créer un compte (Register)

Cette étape permet d'insérer un nouvel utilisateur dans la base de données Supabase.

- **Méthode :** `POST`
- **URL :** `http://localhost:3000/api/auth/register`
- **Headers :** `Content-Type: application/json` (Géré automatiquement par Postman si tu choisis le format JSON).

### Configuration du Body dans Postman

1. Sous la barre d'URL, clique sur l'onglet **Body**.
2. Coche la case **raw**.
3. Dans le menu déroulant à droite (qui affiche souvent "Text"), sélectionne **JSON**.
4. Colle le contenu suivant :

```json
{
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean.dupont@test.com",
  "password": "MonSuperMotDePasse123!",
  "birthday": "1995-05-15",
  "phone": "0601020304"
}
```

5. Clique sur **Send**.

✅ **Résultat attendu :** Un code HTTP `201 Created`. La réponse affichera les informations de l'utilisateur généré (avec son nouvel ID UUID) sans le mot de passe en clair.

---

## 2️⃣ Étape 2 : Se connecter (Login)

Cette étape permet de vérifier les identifiants et de récupérer le Token JWT indispensable pour les routes sécurisées.

- **Méthode :** `POST`
- **URL :** `http://localhost:3000/api/auth/login`
- **Headers :** `Content-Type: application/json`

### Configuration du Body dans Postman

1. Va dans l'onglet **Body**, coche **raw**, et sélectionne **JSON**.
2. Colle les identifiants de l'utilisateur que tu viens de créer :

```json
{
  "email": "jean.dupont@test.com",
  "password": "MonSuperMotDePasse123!"
}
```

3. Clique sur **Send**.

✅ **Résultat attendu :** Un code HTTP `200 OK`. La réponse contiendra les infos de l'utilisateur ainsi qu'une clé `token`. Copie ce token, tu en auras besoin pour l'étape suivante !

---

## 🔐 Bonus : Comment utiliser le Token pour les routes protégées

Maintenant que tu as ton token JWT, voici comment configurer Postman pour accéder aux routes sécurisées (comme `GET /api/sales`) :

1. Crée une nouvelle requête (`GET` vers `http://localhost:3000/api/sales`).
2. Va dans l'onglet **Authorization** juste en dessous de la barre d'URL.
3. Dans le menu déroulant **Type**, sélectionne **Bearer Token**.
4. Dans le champ **Token** qui apparaît à droite, colle le token que tu as récupéré à l'étape du Login.
5. Clique sur **Send**. Ton middleware laissera passer la requête !