/** Découpage administratif du Togo : régions et préfectures (source : administration togolaise). */
export const TOGO_REGIONS: { name: string; prefectures: string[] }[] = [
    { name: 'Maritime', prefectures: ['Golfe', 'Agoè-Nyivé', 'Zio', 'Avé', 'Vo', 'Yoto', 'Lacs', 'Bas-Mono'] },
    { name: 'Plateaux', prefectures: ['Ogou', 'Anié', 'Est-Mono', 'Moyen-Mono', 'Haho', 'Wawa', 'Amou', 'Kloto', 'Agou', 'Danyi', 'Kpélé', 'Akébou'] },
    { name: 'Centrale', prefectures: ['Tchaoudjo', 'Tchamba', 'Sotouboua', 'Blitta', 'Mô'] },
    { name: 'Kara', prefectures: ['Kozah', 'Assoli', 'Bassar', 'Binah', 'Dankpen', 'Doufelgou', 'Kéran'] },
    { name: 'Savanes', prefectures: ['Tône', 'Cinkassé', 'Kpendjal', 'Kpendjal-Ouest', 'Oti', 'Oti-Sud', 'Tandjoaré'] },
];

export const prefecturesOf = (region: string): string[] =>
    TOGO_REGIONS.find((r) => r.name === region)?.prefectures ?? [];
