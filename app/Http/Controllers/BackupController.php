<?php

namespace App\Http\Controllers;

use App\Constants\Roles;
use App\Models\Backup;
use App\Models\BackupSetting;
use App\Models\FileStorageSetting;
use App\Services\BackupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BackupController extends Controller
{
    public function __construct(private readonly BackupService $service)
    {
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()->hasRole(Roles::ADMINISTRATOR), 403);
    }

    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $backups = Backup::with('createdBy:id,firstname,lastname')
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Backup $b) => [
                'id'         => $b->id,
                'filename'   => $b->filename,
                'format'     => $b->format,
                'disk'       => $b->disk,
                'size'       => $b->size,
                'status'     => $b->status,
                'error'      => $b->error,
                'scheduled'  => $b->scheduled,
                'created_by' => $b->createdBy?->name,
                'created_at' => $b->created_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Settings/Backups', [
            'backups'        => $backups,
            'settings'       => BackupSetting::allSettings(),
            'storageDriver'  => FileStorageSetting::get('driver', 'local') === 's3' ? 's3' : 'local',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'formats'   => ['required', 'array', 'min:1'],
            'formats.*' => ['in:json,sql'],
        ], [
            'formats.required' => 'Choisissez au moins un format.',
        ]);

        $results = $this->service->run($validated['formats'], $request->user()->id);

        $failed = $results->where('status', 'failed');

        return back()->with(
            $failed->isEmpty() ? 'success' : 'error',
            $failed->isEmpty()
                ? 'Sauvegarde générée avec succès.'
                : 'Échec de la sauvegarde : ' . $failed->first()->error
        );
    }

    public function download(Request $request, Backup $backup)
    {
        $this->authorizeAdmin($request);

        abort_unless($backup->status === 'completed', 404);
        abort_unless(Storage::disk('media')->exists($backup->path), 404);

        return Storage::disk('media')->download($backup->path, $backup->filename);
    }

    public function destroy(Request $request, Backup $backup): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $this->service->delete($backup);

        return back()->with('success', 'Sauvegarde supprimée.');
    }

    public function updateSchedule(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'frequency'   => ['required', 'in:none,daily,weekly'],
            'time'        => ['required', 'date_format:H:i'],
            'day_of_week' => ['required', 'integer', 'between:1,7'],
            'formats'     => ['required', 'array', 'min:1'],
            'formats.*'   => ['in:json,sql'],
            'retention'   => ['required', 'integer', 'min:0', 'max:365'],
        ]);

        BackupSetting::set('frequency', $validated['frequency']);
        BackupSetting::set('time', $validated['time']);
        BackupSetting::set('day_of_week', (string) $validated['day_of_week']);
        BackupSetting::set('formats', implode(',', $validated['formats']));
        BackupSetting::set('retention', (string) $validated['retention']);

        return back()->with('success', 'Planification mise à jour.');
    }
}
