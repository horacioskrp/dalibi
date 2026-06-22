<?php

namespace App\Http\Controllers\Administration;
use App\Http\Controllers\Controller;

use App\Constants\Roles;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(): Response
    {
        $query  = User::query()->with('roles');
        $roles  = Role::select('id', 'name')->orderBy('name')->get();

        $search = request('search');
        $roleId = request('role');
        $gender = request('gender');

        $normalizedGender = match ($gender) {
            'M'     => 'male',
            'F'     => 'female',
            'O'     => 'other',
            default => $gender,
        };

        if ($search) {
            $searchTerm = strtolower($search);
            $query->where(function ($q) use ($searchTerm): void {
                $q->whereRaw('LOWER(firstname) LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(lastname)  LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(email)     LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(natricule) LIKE ?', ["%{$searchTerm}%"]);
            });
        }

        if ($roleId) {
            $query->whereHas('roles', fn ($q) => $q->where('roles.id', $roleId));
        }

        if ($normalizedGender) {
            $query->where('gender', $normalizedGender);
        }

        $perPage = in_array((int) request('per_page'), [10, 25, 50, 100], true)
            ? (int) request('per_page') : 25;

        $users = $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();

        return Inertia::render('Administration/Users/Index', [
            'users'   => $users,
            'roles'   => $roles,
            'perPage' => $perPage,
            'filters' => [
                'search'   => $search,
                'role'     => $roleId,
                'gender'   => $normalizedGender,
                'per_page' => request('per_page'),
            ],
        ]);
    }

    public function create(): Response
    {
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Administration/Users/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'firstname'  => $request->validated('firstname'),
            'lastname'   => $request->validated('lastname'),
            'email'      => $request->validated('email'),
            'password'   => Hash::make($request->validated('password')),
            'gender'     => $request->validated('gender'),
            'birth_date' => $request->validated('birth_date'),
            'telephone'  => $request->validated('telephone'),
            'address'    => $request->validated('address'),
            'profile'    => $request->validated('profile'),
        ]);

        if ($request->has('roles') && auth()->user()->hasRole(Roles::ADMINISTRATOR)) {
            $roleIds = $request->validated('roles');
            $roles   = Role::whereIn('id', $roleIds)->pluck('name');
            $user->syncRoles($roles);
        }

        return redirect()->route('users.index')
            ->with('message', 'Utilisateur créé avec succès.');
    }

    public function show(User $user): Response
    {
        $user->load('roles.permissions');

        return Inertia::render('Administration/Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load('roles');
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Administration/Users/Edit', [
            'user'  => $user,
            'roles' => $roles,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = [
            'firstname'  => $request->validated('firstname'),
            'lastname'   => $request->validated('lastname'),
            'email'      => $request->validated('email'),
            'gender'     => $request->validated('gender'),
            'birth_date' => $request->validated('birth_date'),
            'telephone'  => $request->validated('telephone'),
            'address'    => $request->validated('address'),
            'profile'    => $request->validated('profile'),
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->validated('password'));
        }

        $user->update($data);

        if (auth()->user()->hasRole(Roles::ADMINISTRATOR)) {
            $roleIds = $request->has('roles') ? ($request->validated('roles') ?? []) : [];
            $roles   = Role::whereIn('id', $roleIds)->pluck('name');
            $user->syncRoles($roles);
        }

        return redirect()->route('users.index')
            ->with('message', 'Utilisateur mis à jour avec succès.');
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_unless(
            auth()->user()->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR]),
            403
        );

        if ($user->id === auth()->id()) {
            return back()->withErrors(['delete' => 'Vous ne pouvez pas supprimer votre propre compte.']);
        }

        if ($user->hasRole(Roles::ADMINISTRATOR) && ! auth()->user()->hasRole(Roles::ADMINISTRATOR)) {
            return back()->withErrors(['delete' => 'Seul un administrateur peut supprimer un compte administrateur.']);
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('message', 'Utilisateur supprimé avec succès.');
    }
}
