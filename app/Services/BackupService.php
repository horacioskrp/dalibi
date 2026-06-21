<?php

namespace App\Services;

use App\Models\Backup;
use App\Models\BackupSetting;
use App\Models\FileStorageSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class BackupService
{
    /** Tables transitoires exclues des sauvegardes. */
    private const EXCLUDED = [
        'migrations', 'cache', 'cache_locks', 'sessions',
        'jobs', 'job_batches', 'failed_jobs', 'password_reset_tokens',
    ];

    private const DIRECTORY = 'backups';

    /**
     * Génère une sauvegarde pour chaque format demandé.
     *
     * @param  array<int,string>  $formats  sous-ensemble de ['json', 'sql']
     * @return Collection<int,Backup>
     */
    public function run(array $formats, ?string $userId = null, bool $scheduled = false): Collection
    {
        $formats = array_values(array_intersect($formats, ['json', 'sql'])) ?: ['json'];
        $disk    = $this->disk();
        $results = collect();

        foreach ($formats as $format) {
            $timestamp = now()->format('Y-m-d_His');
            $filename  = "backup_{$timestamp}.{$format}";
            $path      = self::DIRECTORY . '/' . $filename;

            try {
                $content = $format === 'sql' ? $this->buildSql() : $this->buildJson();
                Storage::disk($disk)->put($path, $content);

                $results->push(Backup::create([
                    'filename'   => $filename,
                    'path'       => $path,
                    'disk'       => $this->driverName(),
                    'format'     => $format,
                    'size'       => strlen($content),
                    'status'     => 'completed',
                    'scheduled'  => $scheduled,
                    'created_by' => $userId,
                ]));
            } catch (\Throwable $e) {
                $results->push(Backup::create([
                    'filename'   => $filename,
                    'path'       => $path,
                    'disk'       => $this->driverName(),
                    'format'     => $format,
                    'status'     => 'failed',
                    'error'      => mb_substr($e->getMessage(), 0, 1000),
                    'scheduled'  => $scheduled,
                    'created_by' => $userId,
                ]));
            }
        }

        $this->applyRetention();

        return $results;
    }

    /**
     * Restaure la base à partir d'un fichier de sauvegarde (JSON ou SQL).
     * Une sauvegarde de sécurité (JSON) est générée au préalable.
     *
     * @return array{format:string, tables:int, rows?:int}
     */
    public function restore(UploadedFile $file): array
    {
        $ext      = strtolower($file->getClientOriginalExtension());
        $contents = (string) file_get_contents($file->getRealPath());

        if (! in_array($ext, ['json', 'sql'], true)) {
            throw new \InvalidArgumentException('Format non supporté (JSON ou SQL attendu).');
        }

        // Filet de sécurité : snapshot avant écrasement
        try {
            $this->run(['json']);
        } catch (\Throwable) {
            // On n'empêche pas la restauration si le snapshot échoue
        }

        return $ext === 'sql' ? $this->restoreSql($contents) : $this->restoreJson($contents);
    }

    /** Restaure depuis un export JSON (vide puis réinsère chaque table). */
    private function restoreJson(string $contents): array
    {
        $data = json_decode($contents, true);

        if (! is_array($data) || ! isset($data['tables']) || ! is_array($data['tables'])) {
            throw new \RuntimeException('Fichier JSON de sauvegarde invalide.');
        }

        $rowsTotal = 0;

        try {
            DB::transaction(function () use ($data, &$rowsTotal): void {
                $this->deferForeignKeys();

                foreach ($data['tables'] as $table => $rows) {
                    if (! Schema::hasTable($table)) {
                        continue;
                    }
                    DB::table($table)->delete();

                    foreach (array_chunk($rows, 500) as $chunk) {
                        if (! empty($chunk)) {
                            DB::table($table)->insert($chunk);
                            $rowsTotal += count($chunk);
                        }
                    }
                }
            });
        } finally {
            $this->restoreForeignKeys();
        }

        return ['format' => 'json', 'tables' => count($data['tables']), 'rows' => $rowsTotal];
    }

    /** Restaure depuis un export SQL (vide les tables visées puis rejoue le script). */
    private function restoreSql(string $contents): array
    {
        preg_match_all('/INSERT\s+INTO\s+"([^"]+)"/i', $contents, $matches);
        $tables = array_values(array_unique($matches[1] ?? []));

        try {
            DB::transaction(function () use ($contents, $tables): void {
                $this->deferForeignKeys();

                foreach ($tables as $table) {
                    if (Schema::hasTable($table)) {
                        DB::table($table)->delete();
                    }
                }

                DB::unprepared($contents);
            });
        } finally {
            $this->restoreForeignKeys();
        }

        return ['format' => 'sql', 'tables' => count($tables)];
    }

    /** Désactive / diffère les contraintes de clés étrangères le temps de la restauration. */
    private function deferForeignKeys(): void
    {
        try {
            match (DB::getDriverName()) {
                'sqlite' => DB::statement('PRAGMA defer_foreign_keys = ON'),
                'mysql'  => DB::statement('SET FOREIGN_KEY_CHECKS=0'),
                'pgsql'  => DB::statement("SET session_replication_role = 'replica'"),
                default  => null,
            };
        } catch (\Throwable) {
            // Best effort selon les privilèges du compte SGBD
        }
    }

    private function restoreForeignKeys(): void
    {
        try {
            match (DB::getDriverName()) {
                'mysql'  => DB::statement('SET FOREIGN_KEY_CHECKS=1'),
                'pgsql'  => DB::statement("SET session_replication_role = 'origin'"),
                default  => null,
            };
        } catch (\Throwable) {
            // Best effort
        }
    }

    /** Supprime un enregistrement de sauvegarde et son fichier. */
    public function delete(Backup $backup): void
    {
        if (Storage::disk($this->disk())->exists($backup->path)) {
            Storage::disk($this->disk())->delete($backup->path);
        }

        $backup->delete();
    }

    /** Export JSON de toutes les tables. */
    private function buildJson(): string
    {
        $payload = [
            'generated_at' => now()->toIso8601String(),
            'driver'       => DB::getDriverName(),
            'tables'       => [],
        ];

        foreach ($this->tables() as $table) {
            $payload['tables'][$table] = DB::table($table)->get()
                ->map(fn ($row) => (array) $row)
                ->all();
        }

        return json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /** Export SQL (instructions INSERT, données uniquement). */
    private function buildSql(): string
    {
        $lines = [
            '-- Sauvegarde Dalibi',
            '-- Généré le ' . now()->toDateTimeString(),
            '-- SGBD : ' . DB::getDriverName(),
            '',
        ];

        foreach ($this->tables() as $table) {
            $rows = DB::table($table)->get();
            if ($rows->isEmpty()) {
                continue;
            }

            $columns = array_keys((array) $rows->first());
            $colList = implode(', ', array_map(fn ($c) => '"' . $c . '"', $columns));

            $lines[] = "-- Table : {$table}";
            foreach ($rows as $row) {
                $values = array_map(fn ($v) => $this->quote($v), array_values((array) $row));
                $lines[] = sprintf('INSERT INTO "%s" (%s) VALUES (%s);', $table, $colList, implode(', ', $values));
            }
            $lines[] = '';
        }

        return implode("\n", $lines);
    }

    /** Formate une valeur pour une instruction SQL. */
    private function quote(mixed $value): string
    {
        if ($value === null) {
            return 'NULL';
        }
        if (is_bool($value)) {
            return $value ? 'TRUE' : 'FALSE';
        }
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        return "'" . str_replace("'", "''", (string) $value) . "'";
    }

    /** Liste des tables à sauvegarder (préfixe de schéma retiré, tables transitoires exclues). */
    private function tables(): array
    {
        return collect(Schema::getTableListing())
            ->map(fn ($t) => str_contains($t, '.') ? substr($t, strrpos($t, '.') + 1) : $t)
            ->reject(fn ($t) => in_array($t, self::EXCLUDED, true))
            ->unique()
            ->sort()
            ->values()
            ->all();
    }

    /** Disque de destination : suit la configuration centralisée (local ou S3/R2 distant). */
    private function disk(): string
    {
        return 'media';
    }

    private function driverName(): string
    {
        return FileStorageSetting::get('driver', 'local') === 's3' ? 's3' : 'local';
    }

    /** Conserve uniquement les N dernières sauvegardes (par format). */
    private function applyRetention(): void
    {
        $retention = (int) BackupSetting::get('retention', 10);
        if ($retention <= 0) {
            return;
        }

        foreach (['json', 'sql'] as $format) {
            Backup::where('format', $format)
                ->where('status', 'completed')
                ->orderByDesc('created_at')
                ->skip($retention)
                ->take(PHP_INT_MAX)
                ->get()
                ->each(fn (Backup $b) => $this->delete($b));
        }
    }

    public static function lastBackupAt(): ?Carbon
    {
        return Backup::where('status', 'completed')->latest()->value('created_at');
    }
}
