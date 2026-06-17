<?php

namespace App\Http\Controllers;

use App\Constants\Roles;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\School;
use App\Models\Subject;
use App\Models\TimetableSlot;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimetableController extends Controller
{
    private const MANAGE_ROLES = [Roles::ADMINISTRATOR, Roles::DIRECTOR, Roles::SECRETARIAT];

    public function index(Request $request): Response
    {
        $classId = $request->string('class_id')->toString();

        $classrooms = Classroom::orderBy('name')->get(['id', 'name', 'code']);
        $subjects   = Subject::orderBy('name')->get(['id', 'name']);
        $teachers   = User::role(Roles::TEACHER)
            ->orderBy('lastname')->orderBy('firstname')
            ->get(['id', 'firstname', 'lastname'])
            ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]);

        $slots = collect();
        if ($classId) {
            $slots = TimetableSlot::with(['subject:id,name', 'teacher:id,firstname,lastname'])
                ->where('class_id', $classId)
                ->orderBy('day_of_week')
                ->orderBy('start_time')
                ->get()
                ->map(fn ($s) => [
                    'id'           => $s->id,
                    'day_of_week'  => $s->day_of_week,
                    'start_time'   => substr($s->start_time, 0, 5),
                    'end_time'     => substr($s->end_time, 0, 5),
                    'subject_id'   => $s->subject_id,
                    'subject_name' => $s->subject?->name,
                    'teacher_id'   => $s->teacher_id,
                    'teacher_name' => $s->teacher?->name,
                    'room'         => $s->room,
                ]);
        }

        return Inertia::render('Timetable/Index', [
            'classrooms' => $classrooms,
            'subjects'   => $subjects,
            'teachers'   => $teachers,
            'slots'      => $slots,
            'days'       => TimetableSlot::DAYS,
            'filters'    => ['class_id' => $classId],
            'canManage'  => $request->user()->hasAnyRole(self::MANAGE_ROLES),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->hasAnyRole(self::MANAGE_ROLES), 403);

        $data = $this->validateSlot($request);
        $data['school_id']        = School::query()->value('id');
        $data['academic_year_id'] = AcademicYear::where('active', true)->value('id');

        TimetableSlot::create($data);

        return back()->with('message', 'Créneau ajouté.');
    }

    public function update(Request $request, TimetableSlot $timetableSlot): RedirectResponse
    {
        abort_unless($request->user()->hasAnyRole(self::MANAGE_ROLES), 403);

        $timetableSlot->update($this->validateSlot($request));

        return back()->with('message', 'Créneau mis à jour.');
    }

    public function destroy(Request $request, TimetableSlot $timetableSlot): RedirectResponse
    {
        abort_unless($request->user()->hasAnyRole(self::MANAGE_ROLES), 403);

        $timetableSlot->delete();

        return back()->with('message', 'Créneau supprimé.');
    }

    private function validateSlot(Request $request): array
    {
        return $request->validate([
            'class_id'    => ['required', 'uuid', 'exists:classes,id'],
            'day_of_week' => ['required', 'integer', 'min:1', 'max:6'],
            'start_time'  => ['required', 'date_format:H:i'],
            'end_time'    => ['required', 'date_format:H:i', 'after:start_time'],
            'subject_id'  => ['nullable', 'uuid', 'exists:subjects,id'],
            'teacher_id'  => ['nullable', 'uuid', 'exists:users,id'],
            'room'        => ['nullable', 'string', 'max:50'],
        ], [
            'end_time.after' => 'L\'heure de fin doit être après l\'heure de début.',
        ]);
    }
}
