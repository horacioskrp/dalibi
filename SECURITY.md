# Politique de sécurité

La sécurité de Dalibi — qui manipule des **données scolaires sensibles** (élèves mineurs, dossiers, paiements) — est une priorité. Merci de nous aider à protéger les établissements et leurs utilisateurs.

## 📦 Versions prises en charge

Le projet est en développement actif. Les correctifs de sécurité sont appliqués sur :

| Version                 | Prise en charge |
| ----------------------- | --------------- |
| Branche `main`          | ✅              |
| Dernière `release`      | ✅              |
| Versions plus anciennes | ❌              |

Utilisez toujours la dernière version et appliquez les migrations (`php artisan migrate`).

## 🔐 Signaler une vulnérabilité

**Ne créez pas d'issue publique** pour une faille de sécurité.

Privilégiez l'un de ces canaux privés :

1. **GitHub — Private vulnerability reporting** (recommandé) :
   onglet **Security → Report a vulnerability** du dépôt
   <https://github.com/horacioskrp/dalibi/security/advisories/new>
2. **E-mail** : `<hervekudayah@gmail.com>` (chiffrez si possible).

Merci d'inclure :

- une description claire de la vulnérabilité et de son impact ;
- les **étapes de reproduction** (PoC minimal si possible) ;
- les versions, l'environnement et la configuration concernés ;
- toute suggestion de correctif.

## ⏱️ Engagement de traitement

- **Accusé de réception** : sous 72 heures.
- **Évaluation initiale** : sous 7 jours.
- **Correctif** : selon la gravité (CVSS) ; les failles critiques sont traitées en priorité.
- Nous vous tiendrons informé de l'avancement et **créditerons** votre signalement (sauf demande contraire) une fois le correctif publié.

Nous appliquons une **divulgation responsable** : merci de ne pas rendre la faille publique tant qu'un correctif n'est pas disponible.

## 🎯 Périmètre

Sont concernés notamment :

- contournement d'authentification / d'autorisation (rôles & permissions) ;
- accès à des fichiers privés (photos d'élèves, pièces de dossier, archives, sauvegardes) ;
- injection (SQL, commandes), XSS, CSRF, SSRF ;
- exposition de secrets (clés S3, `APP_KEY`, identifiants) ;
- élévation de privilèges, falsification de reçus/documents.

**Hors périmètre** : déni de service par volumétrie, ingénierie sociale, vulnérabilités de dépendances déjà publiquement connues sans exploitation démontrée, et configurations de déploiement non conformes à la documentation.

## 🛡️ Bonnes pratiques de déploiement

- Définir un `APP_KEY` fort et `APP_DEBUG=false` en production.
- Servir l'application en **HTTPS** uniquement.
- Restreindre l'accès à la base de données et au stockage (S3/R2 privé).
- Sauvegarder régulièrement (Paramètres → Sauvegardes) et tester les restaurations.
- Changer les mots de passe par défaut des comptes de démonstration.

Merci de contribuer à la sécurité de Dalibi. 🙏
