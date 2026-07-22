<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        // Togo en tête, puis CEDEAO et quelques pays courants. Idempotent (clé = code).
        $countries = [
            ['Togo', 'TG'], ['Bénin', 'BJ'], ['Burkina Faso', 'BF'], ['Côte d\'Ivoire', 'CI'],
            ['Ghana', 'GH'], ['Nigéria', 'NG'], ['Niger', 'NE'], ['Mali', 'ML'],
            ['Sénégal', 'SN'], ['Guinée', 'GN'], ['Guinée-Bissau', 'GW'], ['Sierra Leone', 'SL'],
            ['Libéria', 'LR'], ['Gambie', 'GM'], ['Cap-Vert', 'CV'],
            ['Cameroun', 'CM'], ['Gabon', 'GA'], ['Congo', 'CG'],
            ['République démocratique du Congo', 'CD'], ['Tchad', 'TD'], ['Centrafrique', 'CF'],
            ['France', 'FR'], ['Belgique', 'BE'], ['Canada', 'CA'], ['États-Unis', 'US'],
        ];

        foreach ($countries as [$name, $code]) {
            Country::updateOrCreate(['code' => $code], ['name' => $name]);
        }
    }
}
