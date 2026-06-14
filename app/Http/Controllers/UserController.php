<?php

namespace App\Http\Controllers;

use App\Constants\Roles;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
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
            $query->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(firstname) LIKE ?', ["%{$searchTerm}%"])
                    ->orWhereRaw('LOWER(lastname) LIKE ?', ["%{$searchTerm}%"])
                    ->orWhereRaw('LOWER(email) LIKE ?', ["%{$searchTerm}%"])
                    ->orWhereRaw('LOWER(natricule) LIKE ?', ["%{$searchTerm}%"]);
            });
        }

        if ($roleId) {
            $query->whereHas('roles', function ($q) use ($roleId) {
                $q->where('roles.id', $roleId);
            });
        }

        if ($normalizedGender) {
            $query->where(function ($q) use ($normalizedGender) {
                $q->where('gender', $normalizedGender);

                if ($normalizedGender === 'male') {
                    $q->orWhere('gender', 'M');
                }

                if ($normalizedGender === 'female') {
                    $q->orWhere('gender', 'F');
                }

                if ($normalizedGender === 'other') {
                    $q->orWhere('gender', 'O');
                }
            });
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

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Administration/Users/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
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

        // Seul un ADMINISTRATOR peut assigner des rôles
        if ($request->has('roles') && auth()->user()->hasRole(Roles::ADMINISTRATOR)) {
            $roleIds = $request->validated('roles');
            $roles   = Role::whereIn('id', $roleIds)->pluck('name');
            $user->syncRoles($roles);
        }

        return redirect()->route('users.index')
            ->with('message', 'Utilisateur créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load('roles.permissions');

        return Inertia::render('Administration/Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Administration/Users/Edit', [
            'user'  => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
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

        // Seul un ADMINISTRATOR peut modifier les rôles
        if (auth()->user()->hasRole(Roles::ADMINISTRATOR)) {
            if ($request->has('roles')) {
                $roleIds = $request->validated('roles');
                $roles   = Role::whereIn('id', $roleIds)->pluck('name');
                $user->syncRoles($roles);
            } else {
                $user->syncRoles([]);
            }
        }

        return redirect()->route('users.index')
            ->with('message', 'Utilisateur mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')
            ->with('message', 'Utilisateur supprimé avec succès.');
    }
}
