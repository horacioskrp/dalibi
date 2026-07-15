<?php

namespace App\Constants;

/**
 * Monnaies d'Afrique de l'Ouest (et voisines) utilisables comme monnaie de
 * l'établissement, pour l'affichage des montants en comptabilité.
 *
 * NB : à ne pas confondre avec le champ « devise » de l'école, qui est son
 * slogan/exergue (ex. « République Togolaise »).
 */
class Currencies
{
    /** Code par défaut (Franc CFA — BCEAO). */
    public const DEFAULT = 'XOF';

    /**
     * @return array<string, array{label: string, symbol: string}>
     */
    public static function all(): array
    {
        return [
            'XOF' => ['label' => 'Franc CFA (BCEAO)', 'symbol' => 'FCFA'],
            'XAF' => ['label' => 'Franc CFA (BEAC)', 'symbol' => 'FCFA'],
            'GHS' => ['label' => 'Cedi ghanéen', 'symbol' => 'GH₵'],
            'NGN' => ['label' => 'Naira nigérian', 'symbol' => '₦'],
            'GNF' => ['label' => 'Franc guinéen', 'symbol' => 'FG'],
            'LRD' => ['label' => 'Dollar libérien', 'symbol' => 'L$'],
            'SLE' => ['label' => 'Leone sierra-léonais', 'symbol' => 'Le'],
            'GMD' => ['label' => 'Dalasi gambien', 'symbol' => 'D'],
            'CVE' => ['label' => 'Escudo cap-verdien', 'symbol' => '$'],
            'MRU' => ['label' => 'Ouguiya mauritanien', 'symbol' => 'UM'],
            'USD' => ['label' => 'Dollar américain', 'symbol' => '$'],
            'EUR' => ['label' => 'Euro', 'symbol' => '€'],
        ];
    }

    /** Symbole d'affichage d'un code monnaie (repli sur le code si inconnu). */
    public static function symbol(?string $code): string
    {
        $code = $code ?: self::DEFAULT;

        return self::all()[$code]['symbol'] ?? $code;
    }

    /** Libellé lisible d'un code monnaie. */
    public static function label(?string $code): string
    {
        $code = $code ?: self::DEFAULT;

        return self::all()[$code]['label'] ?? $code;
    }

    /** Codes valides (pour la validation). */
    public static function codes(): array
    {
        return array_keys(self::all());
    }

    /**
     * Options prêtes pour un <select> côté frontend.
     *
     * @return array<int, array{code: string, label: string, symbol: string}>
     */
    public static function options(): array
    {
        $out = [];
        foreach (self::all() as $code => $def) {
            $out[] = ['code' => $code, 'label' => $def['label'], 'symbol' => $def['symbol']];
        }

        return $out;
    }
}
