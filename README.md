# Dalibi - Système de Gestion Scolaire

Un système de gestion scolaire open-source pour les écoles primaires, collèges et lycées du Togo et d'Afrique.

## 🛠️ Stack technique

- **Backend** : Laravel 12, PHP 8.3+
- **Frontend** : React 19, TypeScript, Tailwind CSS 4
- **Pont** : Inertia.js (SPA sans API REST séparée)
- **Base de données** : PostgreSQL 12+
- **Auth** : Laravel Sanctum + 2FA, Spatie Laravel Permission

## 🎓 Fonctionnalités

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

### Examens & évaluations

- **Modèles d'évaluation** : création d'un template (nom, type, barème, date) une seule fois
- **Déploiement vers les classes** : sélection des classes + date individuelle par matière
- **Planning des examens** : vue par classe avec édition de date en ligne, export PDF imprimable (A4 paysage)
- **Saisie des notes** : grille pleine largeur par classe/matière, tri alphabétique des élèves

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

### Notes et réclamations

- Saisie des notes par trimestre
- Système de réclamations sur les notes
- Suivi des performances et commentaires

### Fichiers & Stockage

- Choix du backend de stockage des fichiers depuis l'interface : **local** (serveur Laravel) ou **cloud S3** (AWS S3, Cloudflare R2, MinIO, compatible S3)
- Bascule local ↔ cloud sans toucher au `.env`, ni redéploiement
- Bouton « Tester la connexion » qui valide l'accès au stockage en temps réel (toast de résultat)
- **Sécurité** : credentials S3 chiffrés au repos (`APP_KEY`), clé d'accès masquée à l'affichage, page réservée aux administrateurs
- Recommandation Cloudflare R2 (S3-compatible, sans frais de bande passante sortante)

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
| `evaluation_templates`| Modèles d'évaluation globaux                                  |
| `evaluations`         | Évaluation planifiée par classe/matière avec date             |
| `marks`               | Notes par élève et évaluation                                  |
| `attendances`         | Séance d'appel (classe / date / session)                       |
| `attendance_records`  | Statut de présence par élève et séance                         |
| `absence_permissions` | Demandes de permission d'absence avec cycle de révision        |
| `grading_configs`     | Configuration du calcul des moyennes                           |
| `fee_categories`      | Catégories de frais scolaires                                  |
| `fee_structures`      | Structures de frais par classe                                 |
| `scholarships`        | Bourses                                                        |
| `student_scholarships`| Bourses attribuées aux élèves                                  |
| `cash_accounts`       | Caisses                                                        |
| `transactions`        | Journal comptable                                              |
| `note_reclamations`   | Réclamations sur les notes                                     |
| `file_storage_settings`| Configuration du stockage des fichiers (local / S3, chiffrée) |

## 🔐 Sécurité

- Authentification email / mot de passe
- Two-Factor Authentication (2FA)
- UUIDs pour toutes les clés primaires
- Gestion des rôles et permissions via Spatie Laravel Permission
- Protection CSRF (Inertia)
- Validation stricte de toutes les entrées
- Credentials de stockage S3 chiffrés au repos (`APP_KEY`)

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
