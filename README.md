# Dalibi - Système de Gestion Scolaire

Un système de gestion scolaire open-source pour les écoles primaires, collèges et lycées du Togo et d'Afrique.

## 🛠️ Stack technique

- **Backend** : Laravel 12, PHP 8.3+
- **Frontend** : React 19, TypeScript, Tailwind CSS 4
- **Pont** : Inertia.js (SPA sans API REST séparée)
- **Base de données** : PostgreSQL 12+
- **Auth** : Laravel Sanctum + 2FA, Spatie Laravel Permission

## 🎓 Fonctionnalités

### Tableau de bord

- Vue d'ensemble avec indicateurs clés (effectifs, inscriptions, encaissements)
- Évolution des paiements par mois et derniers paiements
- Filtrage par année académique, contenu adapté au rôle de l'utilisateur

### Gestion des établissements

- Support multi-écoles (primaire, collège, lycée)
- Paramétrage par établissement : nom, code, devise, terme (ex. « République Togolaise »)
- Upload du logo de l'école (image, avec prévisualisation)
- Années académiques et périodes (trimestres)
- Types de classes et niveaux configurables

### Gestion des utilisateurs & rôles

- **Rôles** : Administrateur, Directeur, Enseignant, Comptable, Secrétariat
- Authentification email/mot de passe
- Two-Factor Authentication (2FA)
- Affectation des enseignants aux classes et matières

### Gestion académique

- Création et gestion des classes
- Inscription des élèves avec statut (actif/transféré/retiré)
- Gestion des matières et attribution aux classes
- Calcul des moyennes configurable par établissement (coefficients, seuils)
- **Système trimestre / semestre configurable par type de classe** (le primaire en trimestres, le lycée en semestres dans le même établissement)

### Gestion des élèves

- Fiche élève complète avec photo de profil (stockage privé)
- **Import CSV** en masse (création groupée d'élèves)
- **Promotion en masse** des élèves vers la classe supérieure
- **Réaffectation** d'un élève vers une autre classe
- Statistiques par élève et effectifs / statut académique
- **Effectifs / listes de classe** avec export PDF
- **Dossier de pièces par élève** : tout fichier lié à l'élève (extrait de naissance, passeport, etc.) est rangé dans son dossier privé `students/{id}`, avec ajout dynamique (nom + fichier), téléchargement authentifié et suppression

### Emploi du temps

- Grille hebdomadaire par classe (jour / créneau horaire)
- Création, modification et suppression des créneaux (matière, enseignant)
- Export PDF de l'emploi du temps d'une classe

### Examens & évaluations

- **Modèles d'évaluation** : création d'un template (nom, type, barème, date) une seule fois
- **Déploiement vers les classes** : sélection des classes + date individuelle par matière
- **Planning des examens** : vue par classe avec heure et édition de date en ligne, report / modification / suppression, export PDF imprimable (A4 paysage)
- **Saisie des notes** : grille pleine largeur par classe/matière, tri alphabétique des élèves
- **Modèles d'évaluation par type de classe** pour plus de cohérence
- **Examens officiels** (CEPD, BEPC, Baccalauréat) : liste filtrable (type, session, statut, recherche), rattachée à l'année académique active, gestion des inscriptions et des résultats (admis)

### Documents officiels

- **Modèles de documents** PDF personnalisables (éditeur de contenu riche)
- Génération de documents par élève (certificats, attestations…) avec en-tête (logo de l'école embarqué)
- **Code-barres de vérification** unique sur les documents pour éviter la falsification
- Traçabilité des documents délivrés par élève

### Gestion des présences

- **Saisie de l'appel** : grille par classe / date / session (journée, matin, après-midi)
- **Statuts** : Présent, Absent, Retard (avec minutes), Excusé
- Actions groupées "Tous présents / Tous absents"
- Affichage automatique du badge permission quand un élève a une permission approuvée couvrant la date
- Enregistrement idempotent (la même saisie peut être soumise plusieurs fois sans doublon)

### Demandes de permission d'absence

- Création d'une demande (élève, période, motif : médical / familial / autre, justification)
- Révision par Directeur ou Administrateur (approbation / rejet + commentaire)
- **Auto-excusement** : à l'approbation, toutes les absences enregistrées sur la période sont automatiquement marquées comme excusées
- Cards de statistiques (total / en attente / approuvées / rejetées)
- Suppression bloquée pour les permissions approuvées

### Statistiques des présences

- Tableau de bord par classe et période
- Taux d'absence par élève avec barre colorée (vert < 10 %, orange < 20 %, rouge ≥ 20 %)
- Résumé journalier (présents / absents / retards / excusés par séance)

### Comptabilité

- Journal des transactions
- Situation financière par classe
- Gestion des caisses
- Frais scolaires avec catégories, structures et bourses étudiantes

### Structures de frais & inscriptions

- **Structuration des frais** par catégorie, classe et année — création toujours rattachée à l'**année académique active**
- **Tranches de paiement** (échéancier) avec **contrôle serveur** : le total des tranches ne peut jamais dépasser le montant de la structure
- **Réplication d'une année** : copie de toutes les structures (et leurs tranches) d'une année source vers l'année active, sans doublons
- Inscriptions et paiements des écolages avec cycle de facturation (émise / partiellement payée / payée)
- **Reçus de paiement** : numérotation séquentielle (REC-AAAA-0001), **code-barres** avec code de vérification unique anti-falsification, page de vérification réservée à la comptabilité ; garde-fou anti trop-perçu

### Notes et réclamations

- Saisie des notes par trimestre
- Système de réclamations sur les notes
- Suivi des performances et commentaires

### Fichiers & Stockage

- Choix du backend de stockage des fichiers depuis l'interface : **local** (serveur Laravel) ou **cloud S3** (AWS S3, Cloudflare R2, MinIO, compatible S3)
- Bascule local ↔ cloud sans toucher au `.env`, ni redéploiement
- **Configuration centralisée et propagée à tous les uploads** de l'app via un disque logique `media` (toujours défini, y compris en console / file d'attente)
- **Disque privé `secure`** pour les fichiers sensibles (photos d'élèves, pièces du dossier) : stockés hors du dossier public, servis uniquement via des routes authentifiées
- Bouton « Tester la connexion » qui valide l'accès au stockage en temps réel (toast de résultat)
- **Sécurité** : credentials S3 chiffrés au repos (`APP_KEY`), clé d'accès masquée à l'affichage, page réservée aux administrateurs
- Recommandation Cloudflare R2 (S3-compatible, sans frais de bande passante sortante)

### Sauvegardes de la base de données

- Sauvegarde de la base depuis l'interface (Paramètres → Sauvegardes), aux formats **JSON** et **SQL**
- Stockage sur le **dépôt distant** configuré (S3 / Cloudflare R2) ou en local — via la même configuration centralisée que les uploads
- **Planification** des sauvegardes automatiques : quotidienne ou hebdomadaire, heure et jour configurables
- **Rétention** automatique (nombre de sauvegardes conservées par format)
- Historique des sauvegardes (taille, statut, origine manuelle/planifiée), téléchargement et suppression
- Commande CLI : `php artisan backup:run --formats=json,sql`
- Page réservée aux administrateurs

## 📋 Prérequis

- PHP 8.3+
- PostgreSQL 12+
- Composer
- Node.js & npm

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/horacioskrp/dalibi.git
cd dalibi
```

### 2. Installer les dépendances

```bash
composer install
npm install
```

### 3. Configuration de l'environnement

```bash
cp .env.example .env
php artisan key:generate
```

Mettre à jour le fichier `.env` :

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ecolio
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
```

### 4. Base de données

```bash
php artisan migrate
php artisan db:seed --class=SchoolDemoSeeder  # optionnel
```

### 4 bis. Lien de stockage des fichiers

```bash
php artisan storage:link   # requis pour servir les fichiers uploadés (logos…)
```

### 5. Lancer le serveur

```bash
# Développement
npm run dev
php artisan serve

# Production
npm run build
```

L'application est accessible sur `http://localhost:8000`.

### 6. Planificateur (sauvegardes automatiques)

Pour activer les sauvegardes planifiées, ajoutez le planificateur Laravel au cron du serveur :

```cron
* * * * * cd /chemin/vers/dalibi && php artisan schedule:run >> /dev/null 2>&1
```

## 👥 Utilisateurs par défaut (seeder)

| Rôle       | Email                       | Mot de passe |
| ---------- | --------------------------- | ------------ |
| Admin      | admin@ecoliotogo.tg         | password     |
| Enseignant | sophie.martin@ecoliotogo.tg | password     |
| Comptable  | claire@ecoliotogo.tg        | password     |
| Secrétaire | isabelle@ecoliotogo.tg      | password     |

> **Sécurité** : Changez ces mots de passe en production.

## 🏗️ Structure de la base de données

| Table                 | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `schools`             | Établissements scolaires                                       |
| `academic_years`      | Années académiques par école                                   |
| `academic_periods`    | Périodes / trimestres                                          |
| `classes`             | Classes ou sections                                            |
| `classroom_types`     | Types de classes                                               |
| `levels`              | Niveaux scolaires                                              |
| `students`            | Élèves avec matricule unique                                   |
| `enrollments`         | Inscriptions élève ↔ classe ↔ année                           |
| `subjects`            | Matières                                                       |
| `class_subjects`      | Attribution matières/enseignants aux classes                   |
| `evaluation_types`    | Types d'évaluation (devoir, examen…)                          |
| `evaluation_templates`| Modèles d'évaluation par type de classe                       |
| `evaluations`         | Évaluation planifiée par classe/matière avec date et heure    |
| `marks`               | Notes par élève et évaluation                                  |
| `official_exams`      | Examens officiels (CEPD/BEPC/BAC) rattachés à l'année active   |
| `official_exam_registrations` | Inscriptions et résultats aux examens officiels        |
| `student_documents`   | Pièces du dossier privé de l'élève (fichiers uploadés)         |
| `document_templates`  | Modèles de documents PDF personnalisables                      |
| `attendances`         | Séance d'appel (classe / date / session)                       |
| `attendance_records`  | Statut de présence par élève et séance                         |
| `absence_permissions` | Demandes de permission d'absence avec cycle de révision        |
| `grading_configs`     | Configuration du calcul des moyennes                           |
| `fee_categories`      | Catégories de frais scolaires                                  |
| `fee_structures`      | Structures de frais par classe et année                        |
| `installments`        | Tranches de paiement d'une structure de frais                  |
| `scholarships`        | Bourses                                                        |
| `student_scholarships`| Bourses attribuées aux élèves                                  |
| `cash_accounts`       | Caisses                                                        |
| `transactions`        | Journal comptable                                              |
| `invoices` / `invoice_items` | Factures d'écolage et leurs lignes                      |
| `payments`            | Paiements enregistrés                                          |
| `receipts`            | Reçus de paiement avec code de vérification                    |
| `timetable_slots`     | Créneaux de l'emploi du temps par classe                       |
| `document_issuances`  | Traçabilité des documents délivrés par élève                   |
| `note_reclamations`   | Réclamations sur les notes                                     |
| `file_storage_settings`| Configuration du stockage des fichiers (local / S3, chiffrée) |
| `backups`             | Historique des sauvegardes de base de données (JSON / SQL)     |
| `backup_settings`     | Planification et options des sauvegardes                       |

## 🔐 Sécurité

- Authentification email / mot de passe
- Two-Factor Authentication (2FA)
- UUIDs pour toutes les clés primaires
- Gestion des rôles et permissions via Spatie Laravel Permission
- Protection CSRF (Inertia)
- Validation stricte de toutes les entrées
- Credentials de stockage S3 chiffrés au repos (`APP_KEY`)
- **Fichiers sensibles privés** (photos d'élèves, pièces du dossier) hors du dossier public, servis via routes authentifiées
- Upload d'images restreint (pas de SVG → pas de XSS stocké) et génération PDF verrouillée (dompdf sans accès distant)
- Code-barres de vérification anti-falsification sur reçus et documents

## 📦 Structure du projet

```
dalibi/
├── app/
│   ├── Models/          # Modèles Eloquent
│   ├── Http/Controllers/# Contrôleurs
│   └── Constants/       # Constantes (rôles…)
├── database/
│   ├── migrations/      # Migrations
│   └── seeders/         # Seeders
├── resources/
│   ├── js/
│   │   ├── pages/       # Pages React (Inertia)
│   │   ├── components/  # Composants UI réutilisables
│   │   ├── helpers/     # route.ts, etc.
│   │   └── types/       # Types TypeScript & menu
│   └── views/
│       └── exports/     # Vues Blade pour export PDF (planning)
└── routes/web.php       # Toutes les routes
```

## 🗺️ Roadmap

- [ ] Portail des parents
- [ ] Application mobile
- [ ] Bulletins électroniques (PDF)
- [ ] Système de communication école-parents
- [ ] Calendrier académique interactif
- [ ] Rapports et statistiques avancées
- [ ] Intégration avec le système éducatif togolais

## 🧪 Tests

```bash
php artisan test
```

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commiter (`git commit -m 'feat: description'`)
4. Pusher (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

## 👨‍💻 Développé par

**Horacio Skrp** — [GitHub](https://github.com/horacioskrp)

---

**Note** : Ce logiciel est en développement actif. Signalez les bugs via les [GitHub Issues](https://github.com/horacioskrp/dalibi/issues).
