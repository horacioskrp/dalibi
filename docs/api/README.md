# API du portail (parents & élèves)

Spécification : [`openapi.yaml`](./openapi.yaml) (OpenAPI 3.1).

## Visualiser la documentation

- **Swagger UI / Redoc en ligne** : ouvrez [editor.swagger.io](https://editor.swagger.io) puis `File → Import file` → `openapi.yaml`.
- **Redocly** : `npx @redocly/cli preview-docs docs/api/openapi.yaml`
- **Postman / Insomnia** : importez `openapi.yaml` pour générer une collection prête à l'emploi.

## Base & authentification

- Base : `{APP_URL}/api/v1`
- Auth : token **Bearer** (Laravel Sanctum). En-tête `Authorization: Bearer <token>`.

### Flux

1. `POST /auth/login` (`login` = e-mail du tuteur, ou e-mail/matricule de l'élève) → renvoie un `token`.
2. Réutilisez ce token sur les routes protégées.
3. `POST /auth/logout` révoque le token courant.

### Activation / mot de passe oublié (tuteurs)

1. Le secrétariat crée le compte tuteur et envoie l'invitation (e-mail avec lien signé).
2. Le lien ouvre l'écran « définir mon mot de passe » qui appelle `POST /auth/reset-password` (`email`, `token`, `password`).
3. Oubli ultérieur : `POST /auth/forgot-password` (réponse générique, anti-énumération).

> Les comptes **élèves** sont activés par le personnel (mot de passe défini côté établissement) ; l'élève se connecte avec son **matricule**.

## Sécurité

- Données **strictement scopées** : un tuteur n'accède qu'à ses enfants (sinon `404`), un élève qu'à lui-même (sinon `403`).
- Tokens en **lecture seule** (ability `read`).
- `login`, `forgot-password`, `reset-password` sont **throttlés**.
