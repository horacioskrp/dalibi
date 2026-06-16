<?php

namespace App\Http\Controllers;

use App\Constants\Roles;
use App\Models\FileStorageSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FileStorageController extends Controller
{
    public function index(): Response
    {
        $settings = FileStorageSetting::allSettings();

        return Inertia::render('settings/FileStorage', [
            'settings' => [
                'driver'      => $settings['driver']      ?? 'local',
                's3_key'      => $settings['s3_key']      ?? '',
                's3_secret'   => $settings['s3_secret']   ? '••••••••' : '',
                's3_region'   => $settings['s3_region']   ?? '',
                's3_bucket'   => $settings['s3_bucket']   ?? '',
                's3_endpoint' => $settings['s3_endpoint'] ?? '',
                's3_url'      => $settings['s3_url']      ?? '',
            ],
            'hasSecret' => !empty($settings['s3_secret']),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()->hasAnyRole([Roles::ADMINISTRATOR]), 403);

        $driver = $request->validate(['driver' => ['required', 'in:local,s3']])['driver'];

        FileStorageSetting::set('driver', $driver);

        if ($driver === 's3') {
            $validated = $request->validate([
                's3_key'      => ['required', 'string'],
                's3_secret'   => ['nullable', 'string'],
                's3_region'   => ['required', 'string'],
                's3_bucket'   => ['required', 'string'],
                's3_endpoint' => ['nullable', 'url'],
                's3_url'      => ['nullable', 'url'],
            ]);

            FileStorageSetting::set('s3_key',      $validated['s3_key']);
            FileStorageSetting::set('s3_region',   $validated['s3_region']);
            FileStorageSetting::set('s3_bucket',   $validated['s3_bucket']);
            FileStorageSetting::set('s3_endpoint', $validated['s3_endpoint'] ?? null);
            FileStorageSetting::set('s3_url',      $validated['s3_url'] ?? null);

            // Ne pas écraser le secret si le champ est vide (masqué)
            if (!empty($validated['s3_secret'])) {
                FileStorageSetting::set('s3_secret', $validated['s3_secret']);
            }
        }

        // Invalider tout le cache de config
        Cache::flush();

        return back()->with('message', 'Configuration de stockage mise à jour.');
    }

    public function test(Request $request): \Illuminate\Http\JsonResponse
    {
        abort_unless($request->user()->hasAnyRole([Roles::ADMINISTRATOR]), 403);

        try {
            $driver = FileStorageSetting::get('driver', 'local');

            if ($driver === 's3') {
                $disk = Storage::build(FileStorageSetting::s3Config());
            } else {
                $disk = Storage::disk('public');
            }

            $testFile = 'dalibi-storage-test-' . time() . '.txt';
            $disk->put($testFile, 'ok');
            $disk->delete($testFile);

            return response()->json(['success' => true, 'driver' => $driver]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 422);
        }
    }
}
