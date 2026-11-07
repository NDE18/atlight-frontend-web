# Notes de version — Lot 1 : compte et authentification

Livrable du cahier des charges (section 8). Version web d'Atlight, lot 1, prête pour la recette sur staging.

## Exigences livrées

| ID      | Exigence                            | Livré                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-01 | Inscription en 4 étapes             | `/register` : Rôle, Identité, Compte, Code ; étape dans l'URL (`?step=`), bouton Précédent du navigateur, glissement de 300 ms (fondu si mouvement réduit), focus sur le titre à chaque étape. Compte créé au clic final de l'étape 3 seulement, étapes 1 à 3 verrouillées ensuite. Règles de saisie du mobile (mot de passe : 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial, confirmation). |
| AUTH-02 | Vérification de l'e-mail par code   | Code à 4 chiffres (une case par chiffre, collage, avance automatique), validité de 10 min affichée, renvoi après 45 s, changement d'adresse sur place, code faux ou expiré expliqué sans blocage. Succès : connexion directe, puis onboarding ou page d'origine (`next`).                                                                                                                                |
| AUTH-03 | Connexion                           | `/login` : message générique si les identifiants sont faux, retour sur `/login?next=` (chemin interne uniquement).                                                                                                                                                                                                                                                                                       |
| AUTH-04 | Mot de passe oublié par code e-mail | `/forgot-password` : e-mail, code (10 min), nouveau mot de passe (règles du mobile), connexion possible aussitôt.                                                                                                                                                                                                                                                                                        |
| AUTH-05 | Session persistante et expiration   | Cookie HttpOnly dont la durée suit l'expiration du JWT ; profil revérifié au chargement de l'espace connecté ; 401 = déconnexion vers `/login?next=`.                                                                                                                                                                                                                                                    |
| AUTH-06 | Déconnexion                         | JWT mis en liste noire, cookie et données locales effacés, rechargement complet sur `/login` ; une page privée restaurée par le retour arrière revérifie la session.                                                                                                                                                                                                                                     |
| AUTH-07 | Onboarding                          | `/onboarding`, mêmes étapes que le mobile : sport, club et pays de résidence, puis invitation de contacts (partage natif ou copie du lien). « Passer » disponible.                                                                                                                                                                                                                                       |
| AUTH-08 | Choix de la langue FR / EN          | Sous chaque écran d'authentification et dans le menu du compte (Système, Français, English) ; mémorisé un an, langue du navigateur par défaut. Tous les libellés viennent des ARB du mobile.                                                                                                                                                                                                             |
| Socle   | Shell responsive                    | Barre latérale ≥ 1100 px, rail de 72 px entre 640 et 1099 px, barre du bas sous 640 px, menu du compte. Les écrans des lots suivants affichent « Bientôt disponible sur le web ».                                                                                                                                                                                                                        |

## Page d'accueil (maquette Accueil2)

L'accueil connecté reprend la maquette `maquettes/Accueil-html/Accueil2.png` : bandeau « Bonjour, … ! » et stories, tendances sportives, zone de publication, fil d'actualité et, à partir de 1280 px de large, la colonne de droite (suggestions de connexion, offre recommandée, événements à venir). Barre latérale, barre du haut (recherche, messages et notifications avec leur nombre de non-lus) et barre du bas suivent la même maquette.

- **Données réelles**, lues dans l'API comme sur le mobile : fil « Pour vous » (`user/publication/feed`), hashtags tendance, stories, suggestions (`recommendation`), offres recommandées, événements à venir, nombres de notifications et de messages non lus (actualisés chaque minute), organismes de l'utilisateur.
- Un bloc sans contenu est masqué (tendances, suggestions, offre, événements) ; une erreur réseau affiche un message et « Réessayer », jamais un bloc vide.
- Les actions des lots suivants (publier, réagir, commenter, reposter, partager, stories, se connecter, voir l'offre ou l'événement, recherche) affichent « Bientôt disponible sur le web ».

Écarts voulus avec la maquette :

- **Illustrations vectorielles** (bandeau, offre, événements) à la place des photos de la maquette ; les photos de profil et des posts viennent de l'API (Cloudinary).
- **« Se connecter »** au lieu de « Suivre » sur les suggestions, comme le mobile.
- Sous le nom de l'auteur d'un post : « Rôle @club », comme le mobile, au lieu de « Rôle · sport ». Pas de couronne Premium : le fil ne transmet pas cette information.
- La barre sous la photo d'un post signale l'offre d'emploi liée (icône mallette) ; la maquette y montre un trophée.
- Photo unique d'un post : bandeau panoramique (22:5) en trois colonnes, comme la maquette ; 16:9 en dessous, comme le mobile.
- Badge « vérifié » vert, comme le mobile.
- **Colonnes plus étroites et police plus petite** que sur la maquette, à la demande du produit : fil de 640 px au plus, colonne de droite de 340 px, l'ensemble centré ; texte des posts en 14 px. La barre du haut suit les mêmes colonnes : recherche au-dessus du fil, icônes et menu du compte calés sur la colonne de droite (cadre commun `src/features/shell/layout.ts`).
- **Barre latérale sans défilement** : hauteurs du logo, des entrées et de la carte utilisateur proportionnelles à la hauteur de l'écran ; la vague du bas rétrécit puis disparaît. Tout tient dès 600 px de haut ; en dessous (zoom fort, téléphone à l'horizontale), elle défile plutôt que de couper des entrées.

## App mobile alignée sur le web (question ouverte n° 11 du cahier)

L'inscription du mobile (atlight-frontend-mobile) suit désormais les mêmes 4 étapes que le web :

- `registration_page.dart` : Rôle (6 cartes avec description, masquée sous 360 px), Identité (prénom, nom, nom d'utilisateur vérifié en direct), Compte (e-mail, mot de passe et confirmation, politique de confidentialité). Le compte n'est créé qu'à la fin de l'étape 3. Saisies conservées dans les deux sens, retour système vers l'étape précédente, glissement de 300 ms (fondu si les animations sont réduites).
- Même traitement des refus que le web : nom d'utilisateur pris entre-temps, retour à l'étape 2 ; e-mail déjà utilisé, message sous le champ. Le format de l'e-mail est désormais vérifié (même motif que le backend).
- Étape 4 : l'écran de vérification existant (`verification_page.dart`) affiche l'indicateur « Étape 4 sur 4 », étapes 1 à 3 verrouillées. Le parcours « mot de passe oublié » ne change pas.
- Nouveau widget `registration_step_indicator.dart`, identique à l'indicateur du web.

## Tests

- Unitaires (Vitest) : 55 tests — règles de saisie, saisie du code, `next`, session, onboarding, composant de vérification, mise en forme du fil (hashtags et mentions, regroupement des stories, réactions, médias).
- E2E (Playwright, bureau et mobile) : 22 tests — inscription complète (avec rechargement à l'étape 4), étape ouverte sans les précédentes, nom pris, connexion, accueil (fil, tendances, non-lus), session après rechargement, déconnexion et retour arrière, mot de passe oublié, langue. Backend simulé (`e2e/fixtures.ts`) : aucun appel ne part vers le vrai backend.
- Mobile (widget Flutter) : `test/registration_page_test.dart`, 3 tests.
- Backend (JUnit) : `PasswordResetCodeUnitTest`, 4 tests.

Pré-recette (comparaison aux maquettes, audit d'accessibilité, performance) et cas de recette : [`cahier-de-recette-lot1.md`](cahier-de-recette-lot1.md).

## Écarts connus

- **Indicateur d'étape** : barres libellées (maquette validée) au lieu des pastilles numérotées du cahier ; mêmes fonctions (étapes terminées cliquables, `aria-current="step"`, « Étape 2 sur 4 : Identité » annoncé).
- **Code à 4 chiffres** (backend) alors que la maquette en montre 6 ; renvoi après 45 s (cahier et mobile) alors que la maquette indique 30 s.
- **Étape « Sport » de la maquette** non reprise dans l'inscription : le sport est demandé à l'onboarding, comme sur le mobile.
- **Politique de confidentialité** : `public/legal/privacy.html`, copie de celle du mobile, en anglais seulement.
- **Analytics** non branchées : elles attendent le bandeau de consentement (question ouverte du cahier).
- **Compte créé mais jamais vérifié** : à la connexion, message « compte pas encore activé », sans moyen de recevoir un nouveau code (le backend ne renvoie pas l'identifiant du compte). Même limite sur le mobile.
- Accueil : fil et colonne de droite affichés en lecture ; les interactions arrivent avec leurs lots (publication et réactions au lot 2, connexions au lot 3, offres et événements au lot 5). Voir « Page d'accueil » ci-dessus.

## Évolutions backend (atlight-backend, rétro-compatibles avec le mobile)

À déployer avant la recette du lot 1. Tant qu'ils ne le sont pas, le web reste compatible avec le backend en production (vérifié le 6 novembre 2026 sur `https://atlight.fr`), avec trois limites :

- « Modifier l'e-mail » est refusé (message « Impossible d'utiliser cette adresse ») : le web envoie, comme le mobile, un mot de passe vide que l'ancien `set_email` rejette, ce qui évite qu'il efface le nom d'utilisateur du compte ;
- un code expiré est signalé comme incorrect ;
- `reset_password` accepte encore une réinitialisation sans code confirmé (faille côté backend).

- `POST /api/user/reset_password` exige un code confirmé (`confirm_for_reset_password`) depuis moins de 10 minutes, puis le consomme ; il ne renvoie plus l'entité `User` (qui contenait le hash du mot de passe) mais `{ id, email }`.
- `POST /api/user/set_email` réparé : change l'adresse d'un compte pas encore confirmé et y envoie un nouveau code, sans toucher au nom d'utilisateur ni rechiffrer le mot de passe. Il ne demande plus de mot de passe (le mobile envoyait une chaîne vide, refusée par la validation).
- `POST /api/registration` avec un `id` ne peut plus modifier un compte existant ; la réponse ne contient plus le mot de passe en clair.
- L'expiration des codes (10 min) est vérifiée ; un renvoi de code repart pour 10 min ; un code d'inscription validé est consommé.
- `confirm_for_registration` renvoie `400 { "error": "INVALID_CODE" | "CODE_EXPIRED" }` ; `confirm_for_reset_password` renvoie `EXPIRED` pour un code expiré. Le mobile traite ces deux cas comme un code incorrect, comme avant.

## Points de sécurité relevés, non traités dans ce lot

- `GET /api/person/{id}` sérialise la relation `user`, hash du mot de passe compris.
- `POST /api/person` ne vérifie pas que la fiche appartient à l'appelant.
- Le limiteur de débit fait confiance au premier `X-Forwarded-For` reçu : un client peut le falsifier pour contourner la limite. Avec des codes à 4 chiffres et sans limite d'essais par code, un code reste devinable. Recommandé : limite d'essais par code côté backend, et IP prise du proxy de confiance.
