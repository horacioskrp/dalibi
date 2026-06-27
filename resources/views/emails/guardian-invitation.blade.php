<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color:#1a1a1a; max-width:560px; margin:0 auto; padding:24px;">
    <h2 style="color:#1d4ed8;">{{ $isReset ? 'Réinitialisation du mot de passe' : 'Bienvenue sur le portail' }}</h2>

    <p>Bonjour {{ $guardian->fullName() }},</p>

    @if ($isReset)
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en définir un nouveau.</p>
    @else
        <p>Un accès au portail de l'établissement a été créé pour vous. Cliquez sur le bouton ci-dessous pour définir votre mot de passe et activer votre compte.</p>
    @endif

    <p style="text-align:center; margin:28px 0;">
        <a href="{{ $url }}" style="background:#1d4ed8; color:#fff; text-decoration:none; padding:12px 22px; border-radius:8px; display:inline-block;">
            {{ $isReset ? 'Réinitialiser mon mot de passe' : 'Activer mon compte' }}
        </a>
    </p>

    <p style="font-size:13px; color:#555;">Ce lien expire dans 7 jours. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
</body>
</html>
