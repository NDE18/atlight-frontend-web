# Cahier de recette — Lot 1 : compte et authentification

Livrable du cahier des charges (section 8). Chaque cas est relié à une exigence (AUTH-01 à AUTH-08, socle, section 6). La recette est déroulée par le produit sur staging (cahier, section 10), en FR et en EN, sur bureau et sur téléphone, et comparée à l'app mobile sur le même compte de test.

## Préparation

- **Environnement** : staging, backend avec les évolutions du lot 1 déployées (voir `notes-de-version-lot1.md`).
- **Comptes de test** : un compte confirmé par rôle (FAN, ATHLETE, COACH, MANAGER, AGENT, JOURNALIST), un compte créé mais jamais vérifié, une boîte e-mail consultable pour recevoir les codes.
- **Navigateurs** : Chrome, Edge, Firefox et Safari (2 dernières versions) sur bureau ; Safari iOS 16+ ; Chrome Android. App mobile : Android et iOS.
- **Largeurs** : 360, 768, 1280 et 1920 px.
- **Notation** : `OK`, `KO` (avec le numéro d'anomalie), `NT` (non testé). Gravité des anomalies : bloquante, majeure, mineure (cahier, section 10).

## Cas de test

« Auto » indique un test automatisé qui couvre le cas : E2E Playwright (`e2e/`), unitaire Vitest (`src/**/*.test.ts*`), widget Flutter (`test/registration_page_test.dart` du mobile), JUnit (backend).

### AUTH-01 — Inscription en 4 étapes

| Cas    | Étapes                                                                                                       | Résultat attendu                                                                                                                                                         | Auto                   |
| ------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| R01-01 | `/register` : choisir un rôle, remplir Identité puis Compte, « Créer mon compte ». Observer l'onglet Réseau. | Aucun appel de création avant le clic final de l'étape 3. Le compte est créé, le code envoyé par e-mail, l'étape 4 s'affiche.                                            | E2E                    |
| R01-02 | Étape 1 : « Suivant » sans rôle, puis choisir un rôle.                                                       | Six cartes (icône, libellé, description) ; sélection unique, carte bordée et teintée en vert. Sans rôle : bouton grisé, message « Choisissez un rôle pour continuer ».   | Widget (mobile)        |
| R01-03 | Sous 360 px de large, afficher l'étape 1.                                                                    | Descriptions des cartes masquées, libellés des étapes toujours visibles.                                                                                                 | —                      |
| R01-04 | Étape 2 : laisser les champs vides, « Suivant ». Saisir un nom d'utilisateur libre, puis un nom pris.        | Erreurs sous chaque champ. Disponibilité vérifiée en direct (« Nom d'utilisateur disponible ») ; nom pris : message et proposition cliquable.                            | E2E, widget            |
| R01-05 | Étape 3 : e-mail invalide, mot de passe faible, confirmation différente, case non cochée.                    | Erreur sur chaque champ ; règles du mot de passe identiques au mobile (8 caractères, 1 majuscule, 1 caractère spécial, 1 chiffre, champs identiques), cochées en direct. | Unitaire               |
| R01-06 | Indicateur d'étape, avec un lecteur d'écran (NVDA, VoiceOver).                                               | « Étape 2 sur 4 : Identité » annoncé ; l'étape en cours porte `aria-current="step"`.                                                                                     | —                      |
| R01-07 | Cliquer sur une étape terminée, puis sur une étape à venir.                                                  | Retour sur l'étape terminée ; l'étape à venir n'est pas cliquable.                                                                                                       | —                      |
| R01-08 | Passer d'une étape à l'autre, avec et sans « réduire les animations » (système).                             | Glissement d'environ 300 ms (gauche en avançant, droite en revenant) ; simple fondu avec mouvement réduit.                                                               | —                      |
| R01-09 | Étape 3 : « Retour », changer de rôle à l'étape 1, revenir aux étapes 2 et 3.                                | Toutes les saisies sont conservées, y compris après changement de rôle.                                                                                                  | E2E, widget            |
| R01-10 | Étape 3 : bouton Précédent du navigateur, puis Suivant.                                                      | L'URL suit l'étape (`?step=`), saisies conservées.                                                                                                                       | E2E                    |
| R01-11 | Ouvrir directement `/register?step=3` dans un nouvel onglet.                                                 | Renvoi à l'étape 1.                                                                                                                                                      | E2E                    |
| R01-12 | Clavier seul : Tab, Espace, Entrée sur chaque étape.                                                         | Entrée déclenche le bouton principal ; à chaque changement d'étape, le focus va sur le titre du volet.                                                                   | E2E (focus du titre)   |
| R01-13 | Recharger à l'étape 2 ou 3 ; puis recharger à l'étape 4.                                                     | Étapes 1 à 3 : retour à l'étape 1. Étape 4 : on y reste (identifiant, prénom et e-mail en sessionStorage).                                                               | E2E (étape 4)          |
| R01-14 | Après la création du compte : Retour, Précédent du navigateur, clic sur les étapes 1 à 3.                    | Étapes 1 à 3 verrouillées : on reste à l'étape 4.                                                                                                                        | —                      |
| R01-15 | Étape 3 avec un e-mail déjà utilisé.                                                                         | On reste à l'étape 3, message « Cette adresse e-mail est déjà utilisée » sous le champ e-mail.                                                                           | —                      |
| R01-16 | Nom d'utilisateur pris entre l'étape 2 et la création (le créer depuis un autre appareil).                   | Retour à l'étape 2 avec le message sous le champ.                                                                                                                        | —                      |
| R01-17 | Couper le réseau, « Créer mon compte ».                                                                      | Message au-dessus du bouton, saisies conservées, nouvel essai possible.                                                                                                  | —                      |
| R01-18 | DevTools > Application pendant l'inscription.                                                                | Le mot de passe n'apparaît ni dans localStorage ni dans sessionStorage.                                                                                                  | —                      |
| R01-19 | **App mobile** (Android, iOS) : refaire R01-01, R01-02, R01-04, R01-09, R01-15.                              | Mêmes 4 étapes et même ordre que le web : Rôle, Identité, Compte (création du compte), Code. Le retour système revient à l'étape précédente.                             | Widget (étapes 1 et 2) |

### AUTH-02 — Vérification de l'e-mail par code

| Cas    | Étapes                                                                                      | Résultat attendu                                                                                                                                | Auto              |
| ------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| R02-01 | Saisir le code reçu chiffre par chiffre ; utiliser Retour arrière ; coller un code complet. | Le focus avance seul, Retour arrière revient à la case précédente, le collage remplit les 4 cases ; validation automatique au 4e chiffre.       | Unitaire, E2E     |
| R02-02 | Saisir un code faux.                                                                        | « Ce code est incorrect. », cases vidées, focus sur la première ; un nouvel essai reste possible.                                               | Unitaire, E2E     |
| R02-03 | Attendre plus de 10 minutes, saisir le code.                                                | « Ce code a expiré. » et bouton « Recevoir un nouveau code » ; le compte n'est pas bloqué.                                                      | Unitaire (simulé) |
| R02-04 | « Renvoyer le code ».                                                                       | Actif après un compte à rebours de 45 s affiché en clair ; confirmation « Nouveau code envoyé à … » ; e-mail reçu ; validité de nouveau 10 min. | Unitaire (45 s)   |
| R02-05 | « Modifier l'e-mail » : nouvelle adresse valide, puis adresse déjà utilisée.                | Nouveau code envoyé à la nouvelle adresse, rappel d'adresse mis à jour ; adresse prise : message clair.                                         | —                 |
| R02-06 | Saisir le bon code.                                                                         | Connexion sans ressaisir le mot de passe, puis onboarding ; avec `?next=` (parcours P1) : retour à la page d'origine.                           | E2E               |
| R02-07 | **App mobile** : écran de vérification après l'inscription.                                 | Indicateur « Étape 4 sur 4 », étapes 1 à 3 cochées et non cliquables.                                                                           | —                 |

### AUTH-03 — Connexion

| Cas    | Étapes                                             | Résultat attendu                                                                       | Auto     |
| ------ | -------------------------------------------------- | -------------------------------------------------------------------------------------- | -------- |
| R03-01 | Nom d'utilisateur ou mot de passe faux.            | Message générique « Nom d'utilisateur ou mot de passe incorrect. » (sans dire lequel). | E2E      |
| R03-02 | Ouvrir une page privée sans session, se connecter. | Redirection vers `/login?next=…`, puis retour sur la page demandée.                    | E2E      |
| R03-03 | Se connecter avec le compte jamais vérifié.        | Message « Votre compte n'est pas encore activé… ».                                     | —        |
| R03-04 | Plus de 10 tentatives en une minute.               | Message « Trop de tentatives. Réessayez dans une minute. »                             | —        |
| R03-05 | `/login?next=https://exemple.com`, se connecter.   | Aucune redirection vers un site externe : arrivée sur l'accueil ou l'onboarding.       | Unitaire |

### AUTH-04 — Mot de passe oublié par code e-mail

| Cas    | Étapes                                                                                                      | Résultat attendu                                                                      | Auto            |
| ------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------- |
| R04-01 | « Mot de passe oublié ? » : e-mail, code reçu, nouveau mot de passe ; se connecter avec.                    | Code valable 10 min, nouveau mot de passe appliqué, connexion possible immédiatement. | E2E (simulé)    |
| R04-02 | E-mail sans compte.                                                                                         | « Aucun compte n'est associé à cette adresse e-mail. »                                | E2E             |
| R04-03 | Code faux, code expiré, renvoi du code.                                                                     | Mêmes messages et même comportement que R02-02 à R02-04.                              | Unitaire        |
| R04-04 | Sécurité : appeler `POST /api/user/reset_password` directement avec un e-mail, sans avoir confirmé de code. | Refusé (corps vide), mot de passe inchangé.                                           | JUnit (backend) |

### AUTH-05 — Session persistante et expiration

| Cas    | Étapes                                                                           | Résultat attendu                                               | Auto               |
| ------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------ |
| R05-01 | Se connecter, fermer le navigateur, le rouvrir sur l'accueil.                    | Toujours connecté.                                             | E2E (rechargement) |
| R05-02 | Session expirée ou jeton révoqué (déconnexion depuis un autre onglet), naviguer. | Déconnexion propre vers `/login?next=…`, sans écran blanc.     | —                  |
| R05-03 | Console : `document.cookie`.                                                     | Le jeton (`atlight_token`) n'y apparaît pas (cookie HttpOnly). | —                  |

### AUTH-06 — Déconnexion

| Cas    | Étapes                                                      | Résultat attendu                                                                                    | Auto |
| ------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---- |
| R06-01 | Menu du compte > Déconnexion, puis Précédent du navigateur. | Retour sur `/login` ; cookie, localStorage et sessionStorage effacés ; aucun contenu privé affiché. | E2E  |
| R06-02 | Réutiliser l'ancien jeton (outil d'API).                    | 401 : jeton mis en liste noire par le backend.                                                      | —    |

### AUTH-07 — Onboarding

| Cas    | Étapes                                                                   | Résultat attendu                                                                            | Auto          |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------- |
| R07-01 | Juste après l'inscription : sport, club, pays de résidence, « Suivant ». | Mêmes étapes et même ordre que le mobile ; le sport s'affiche ensuite sur le profil mobile. | E2E (arrivée) |
| R07-02 | « Inviter des amis ».                                                    | Partage natif sur téléphone ; sur bureau, lien copié et message « Lien copié ».             | —             |
| R07-03 | « Terminé » ou « Passer », puis se reconnecter.                          | L'onboarding ne réapparaît plus sur ce navigateur.                                          | Unitaire      |

### AUTH-08 — Langue FR / EN

| Cas    | Étapes                                                                | Résultat attendu                                          | Auto              |
| ------ | --------------------------------------------------------------------- | --------------------------------------------------------- | ----------------- |
| R08-01 | Navigateur en anglais, première visite.                               | Interface en anglais.                                     | E2E               |
| R08-02 | Choisir une langue (sous les formulaires ou dans le menu), recharger. | Langue mémorisée.                                         | E2E               |
| R08-03 | Menu > Langue > « Langue du système ».                                | Retour à la langue du navigateur.                         | —                 |
| R08-04 | Parcourir tous les écrans du lot en EN.                               | Aucun texte français restant (aucun libellé codé en dur). | CI (`i18n:check`) |

### Socle — Shell responsive

| Cas   | Étapes                                                                                        | Résultat attendu                                                                                                                                                              | Auto                 |
| ----- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| RS-01 | Accueil connecté à 360, 768, 1280 et 1920 px de large, puis 600, 657, 789 et 1024 px de haut. | Barre latérale ≥ 1100 px, rail de 72 px de 640 à 1099 px, barre du bas sous 640 px ; aucun défilement horizontal ; barre latérale entière sans défilement dès 600 px de haut. | —                    |
| RS-02 | Menu du compte : ouvrir, Échap, clic à côté.                                                  | Panneau à droite sur bureau, tiroir à gauche sur téléphone ; fermeture et retour du focus sur l'avatar.                                                                       | —                    |
| RS-03 | Entrées des lots suivants (Réseau, Mercato, Publier, Messages…).                              | Message « Bientôt disponible sur le web. »                                                                                                                                    | —                    |
| RS-04 | Tab dès le chargement de l'accueil.                                                           | Lien « Aller au contenu » visible.                                                                                                                                            | —                    |
| RS-05 | Accueil connecté à 1536 × 1024, comparé à Accueil2.                                           | Même disposition que la maquette ; prénom, fil, tendances, stories et colonne de droite lus dans l'API.                                                                       | E2E (fil, tendances) |
| RS-06 | Recevoir une notification et un message, l'accueil ouvert.                                    | Pastilles de la barre latérale et du haut à jour en une minute au plus ; annoncées « 3 non lus » au lecteur d'écran.                                                          | E2E (nombres)        |
| RS-07 | Couper le réseau puis recharger l'accueil.                                                    | Message d'erreur et « Réessayer » dans le fil et les blocs concernés ; aucun bloc vide.                                                                                       | —                    |
| RS-08 | Compte sans tendance, suggestion, offre ni événement.                                         | Blocs correspondants masqués ; le fil vide affiche son message.                                                                                                               | —                    |

### Exigences non fonctionnelles (section 6) vérifiées sur ce lot

| Cas   | Contrôle                                                                                                | Attendu                                       |
| ----- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| RN-01 | Accessibilité : axe (WCAG 2.1 A/AA) et Lighthouse sur chaque écran ; parcours au clavier.               | 0 erreur critique ; Lighthouse ≥ 90           |
| RN-02 | Performance : JavaScript initial de l'espace connecté (build de production).                            | ≤ 250 Ko compressés                           |
| RN-03 | Performance : LCP et CLS des écrans d'authentification (profil mobile 4G).                              | LCP ≤ 2,5 s, CLS ≤ 0,1                        |
| RN-04 | Sécurité : cookie HttpOnly, aucune violation de CSP dans la console, aucune clé secrète dans le bundle. | Conforme                                      |
| RN-05 | Fiabilité : couper le réseau sur chaque formulaire.                                                     | Message et nouvel essai, jamais d'écran blanc |

## Grille de résultats

À remplir par le produit, en FR et en EN pour chaque cellule. Les cellules pré-remplies viennent de la pré-recette automatisée du 6 novembre 2026 (Chromium, bureau 1440 px et téléphone émulé Pixel 7, backend simulé) : elles ne remplacent pas la recette sur staging.

| Cas                             | Chrome bureau        | Edge | Firefox | Safari | Safari iOS | Chrome Android | App Android | App iOS |
| ------------------------------- | -------------------- | ---- | ------- | ------ | ---------- | -------------- | ----------- | ------- |
| R01-01, R01-09 à R01-11, R01-13 | OK (auto)            |      |         |        |            | OK (émulé)     |             |         |
| R01-02 à R01-08, R01-12         |                      |      |         |        |            |                |             |         |
| R01-14 à R01-18                 |                      |      |         |        |            |                |             |         |
| R01-19                          | —                    | —    | —       | —      | —          | —              |             |         |
| R02-01, R02-02, R02-06          | OK (auto)            |      |         |        |            | OK (émulé)     |             |         |
| R02-03 à R02-05                 |                      |      |         |        |            |                |             |         |
| R02-07                          | —                    | —    | —       | —      | —          | —              |             |         |
| R03-01, R03-02                  | OK (auto)            |      |         |        |            | OK (émulé)     |             |         |
| R03-03 à R03-05                 |                      |      |         |        |            |                |             |         |
| R04-01, R04-02                  | OK (auto)            |      |         |        |            | OK (émulé)     |             |         |
| R04-03, R04-04                  |                      |      |         |        |            |                |             |         |
| R05-01                          | OK (auto)            |      |         |        |            | OK (émulé)     |             |         |
| R05-02, R05-03                  |                      |      |         |        |            |                |             |         |
| R06-01                          | OK (auto)            |      |         |        |            | OK (émulé)     |             |         |
| R06-02                          |                      |      |         |        |            |                |             |         |
| R07-01                          | OK (auto)            |      |         |        |            | OK (émulé)     |             |         |
| R07-02, R07-03                  |                      |      |         |        |            |                |             |         |
| R08-01, R08-02                  | OK (auto)            |      |         |        |            | OK (émulé)     |             |         |
| R08-03, R08-04                  |                      |      |         |        |            |                |             |         |
| RS-01 à RS-04                   |                      |      |         |        |            |                |             |         |
| RN-01 à RN-03                   | OK (voir ci-dessous) |      |         |        |            | OK (émulé)     |             |         |
| RN-04, RN-05                    |                      |      |         |        |            |                |             |         |

## Pré-recette du 6 novembre 2026 (équipe web)

**Tests automatisés** : 55 tests unitaires (Vitest), 22 tests E2E (Playwright, bureau et téléphone), 3 tests widget Flutter (inscription mobile), 4 tests JUnit (réinitialisation du mot de passe). Tous verts.

**Comparaison visuelle aux maquettes** (captures à 1440 × 900 et 390 × 844) : Connexion, Création de compte, Vérification de l'e-mail, Mot de passe oublié sont conformes, aux écarts voulus près, listés dans les notes de version : 4 cases de code au lieu de 6, étape Sport reportée à l'onboarding, descriptions des rôles et libellés des étapes demandés par le cahier. Accueil refait sur Accueil2 (capture à 1536 × 1024, plus 900 et 390 px de large) : disposition conforme ; illustrations vectorielles et « Se connecter » à la place des photos et de « Suivre », colonnes resserrées et police réduite (voir les notes de version). Barre latérale mesurée sans défilement de 600 à 1024 px de haut.

**Accessibilité** : axe-core 4.14 (WCAG 2.1 A/AA et bonnes pratiques) sur 28 états d'écran, bureau et téléphone, plus l'accueil refait à 1536, 900 et 390 px : 0 violation. Lighthouse accessibilité : 100 sur Connexion, Inscription et Mot de passe oublié. Restent à faire en recette : le parcours complet au clavier et au lecteur d'écran.

**Performance** (build de production, Lighthouse profil mobile, throttling appliqué) :

| Écran               | Performance | Accessibilité | Bonnes pratiques | LCP   | CLS |
| ------------------- | ----------- | ------------- | ---------------- | ----- | --- |
| Connexion           | 86          | 100           | 100              | 2,1 s | 0   |
| Inscription         | 77          | 100           | 100              | 2,3 s | 0   |
| Mot de passe oublié | 81          | 100           | 100              | 2,2 s | 0   |

JavaScript initial (gzip) : accueil 232 Ko, onboarding 239 Ko (budget de l'espace connecté : 250 Ko) ; écrans d'authentification 265 à 274 Ko. Le temps de blocage (TBT 450 à 770 ms) vient surtout de React et de Sentry.

**Anomalies trouvées et corrigées pendant la pré-recette** :

| Anomalie                                                                                  | Gravité | Correction                                                       |
| ----------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| Bouton principal écrasé (30 px au lieu de 54 px) hors des rangées à deux boutons          | Mineure | Hauteur fixe rétablie (`form-controls.tsx`)                      |
| Inscription : retour éphémère à l'étape 1 après la validation du code, navigation bloquée | Majeure | Données de l'étape 4 effacées après l'affichage du succès        |
| Inscription non rendue côté serveur : LCP de 4,4 s                                        | Mineure | Étape 1 rendue par le serveur (LCP 2,3 s)                        |
| Animations d'entrée depuis une opacité nulle au premier affichage                         | Mineure | Animées seulement lors des changements                           |
| Violation de CSP à chaque chargement (zod sonde `eval`)                                   | Mineure | Mode `jitless` de zod                                            |
| JavaScript initial de l'espace connecté à 253 Ko (zod chargé par le shell)                | Mineure | URL de partage lue sans zod ; règles de saisie sans zod (222 Ko) |
| Bouton avatar : initiales visibles absentes du nom accessible (WCAG 2.5.3)                | Mineure | Initiales en contenu CSS décoratif                               |
| Barre latérale : libellés des entrées sans page centrés                                   | Mineure | Texte aligné à gauche                                            |
| App mobile : « Déjà un compte ? Connexion » déborde avec une grande taille de texte       | Mineure | Retour à la ligne (`Wrap`)                                       |
| Typographie : « ? » ou « : » rejeté en début de ligne                                     | Mineure | Espaces insécables dans les libellés FR du lot                   |
