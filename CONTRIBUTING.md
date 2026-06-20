# Guide de Contribution à Dalibi

Merci d'avoir l'intention de contribuer à Dalibi! Ce document fournit des directives et des stratégies pour contribuer efficacement au projet.

## Code de Conduite

Tous les contributeurs doivent respecter notre Code de Conduite qui promeut:

- Respect mutuel
- Inclusivité
- Professionnalisme
- Collaboration

## Types de Contributions

### 🐛 Signaler des Bugs

Si vous découvrez un bug:

1. **Vérifiez** que le bug n'a pas déjà été signalé
2. **Utilisez un titre descriptif** pour le problème
3. **Décrivez les étapes exactes** pour reproduire le problème
4. **Fournissez des exemples spécifiques** pour démontrer les étapes
5. **Décrivez le comportement observé** et ce que vous attendiez

### 💡 Suggérer des Améliorations

Les suggestions d'améliorations sont bienvenues:

1. **Utilisez un titre descriptif** pour votre suggestion
2. **Fournissez une description détaillée** de la fonctionnalité proposée
3. **Listez des exemples** et cas d'usage concrets
4. **Mentionnez les implémentations similaires** dans d'autres outils

### 📝 Soumettre une Pull Request

#### Avant de commencer

1. **Fork le dépôt** et clonez votre fork
2. **Créez une branche** pour votre feature/fix: `git checkout -b feature/description`
3. **Assurez-vous** que Node.js et Composer sont installés

#### Lors du développement

1. **Suivez les conventions de codage** du projet
2. **Écrivez des messages de commit lisibles** et informatifs
3. **Commentez votre code** pour les parties complexes
4. **Testez votre code** localement

#### Avant de soumettre votre PR

1. **Vérifiez** votre code avec les linters:

    ```bash
    npm run lint
    ./vendor/bin/pint
    ```

2. **Lancez les tests**:

    ```bash
    php artisan test
    npm run test
    ```

3. **Remplissez le template de PR** avec:
    - Description du changement
    - Type de changement (bugfix, feature, documentation)
    - Tests effectués
    - Checklist de vérification

## Convention de Commits (Conventional Commits)

Tous les messages de commit **doivent** suivre ce format :

```
<type>(<portée>): <description courte à l'impératif>

[corps optionnel : explique le pourquoi, les détails]
```

### Types autorisés

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Refactorisation sans changement de comportement |
| `style` | Mise en forme / UI (aucune logique modifiée) |
| `test` | Ajout ou correction de tests |
| `docs` | Documentation |
| `chore` | Maintenance, configuration, dépendances |

### Portée (`scope`)

Le module concerné : `eleves`, `effectifs`, `presences`, `notes`, `examens`,
`bulletins`, `documents`, `comptabilite`, `parametres`, `ecole`, etc.

### Exemples

```
feat(effectifs): listes par annee/classe + statut academique
fix(ecole): edition avec upload via POST + _method=put
refactor(notes): Grade base sur academic_period_id au lieu de term
test(roster): couverture du marquage d'abandon
docs(readme): mise a jour des fonctionnalites
```

> ⚠️ **Aucune empreinte d'outil ou d'IA** dans les messages de commit (pas de
> `Co-Authored-By` généré). Le commit reflète l'auteur humain de la contribution.

### Commentaires de code

- Documentent **le pourquoi**, pas le « quoi » évident.
- Rédigés en **français**, comme le reste du code métier.
- Toute décision technique non triviale (contournement, contrainte, sécurité) est commentée.

  ```php
  // PUT multipart non parsé par PHP : on passe par POST + _method=put.
  ```

## Processus de Pull Request

1. **Formatage du code**: Assurez-vous que le code suit les standards PSR-12 pour PHP et ESLint pour JavaScript
2. **Tests**: Toutes les PR doivent inclure les tests appropriés
3. **Documentation**: Mettez à jour les docs si nécessaire
4. **Révision**: Un mainteneur examinera votre PR
5. **Merge**: Une fois approuvée et testée, votre PR sera fusionnée

## Conventions de Codage

### PHP

- Suivez [PSR-12](https://www.php-fig.org/psr/psr-12/)
- Utilisez type hints quand possible
- Documentez avec PHPDoc

```php
/**
 * Description de la fonction
 */
public function exemplo(Type $param): ReturnType
{
    // Code
}
```

### JavaScript/React

- Utilisez ESLint pour la vérification
- Préférez const à let/var
- Utilisez des noms de composants en PascalCase

```javascript
const ComponentName = ({ prop1, prop2 }) => {
    return <div></div>;
};
```

### Migrations de Base de Données

- Utilisez des noms descriptifs
- Incluez les rollbacks
- N'incluez pas la logique complexe

```php
Schema::create('table_name', function (Blueprint $table) {
    $table->uuid('id')->primary();
    // ...
});
```

## Architecture du Projet

### Dossiers Clés

- `app/Models/` - Modèles Eloquent
- `app/Http/Controllers/` - Contrôleurs
- `database/migrations/` - Migrations
- `resources/js/` - Composants React
- `routes/` - Définitions des routes
- `tests/` - Tests automatisés

### Nommage

- Classes: `PascalCase` (ex: `UserController`)
- Méthodes: `camelCase` (ex: `getUserById()`)
- Constantes: `UPPER_CASE` (ex: `DEFAULT_ROLE`)
- Variables: `camelCase` (ex: `firstName`)

## Documentation

### Documenter une Feature

1. Mise à jour du README si necessary
2. Ajouter des commentaires de code
3. Mettre à jour la documentation existante
4. Pour les APIs, docencer les endpoints

### Format de Documentation

```markdown
## Fonctionnalité

### Description

Explication claire

### Utilisation

Exemple de code

### Paramètres

- param1 (type): description
```

## Tests

### Standards de Test

- Écrivez des tests pour chaque nouvelle fonctionnalité
- Minimum 80% de coverage
- Testez les cas normaux et les cas limites

```php
public function test_user_can_create_student()
{
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post('/students', [...]);

    $response->assertRedirect();
}
```

## Versions et Releases

### Versioning Sémantique (SemVer)

- Format: MAJOR.MINOR.PATCH
- Major: changements incompatibles
- Minor: nouvelles fonctionnalités
- Patch: corrections de bugs

## Questions?

- 📧 Email: support@ecoliotogo.tg
- 📝 Ouvrez une issue
- 💬 Rejoignez notre communauté

---

Merci de contribuer à rendre Dalibi meilleur! 🙏
