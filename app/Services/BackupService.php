<?php

namespace App\Services;

use App\Models\Backup;
use App\Models\BackupSetting;
use App\Models\FileStorageSetting;
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
