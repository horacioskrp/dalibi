<?php

namespace App\Policies;

use App\Constants\Roles;
use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Student $student): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR, Roles::SECRETARIAT]);
    }

    public function update(User $user, Student $student): bool
    {
        return $user->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR, Roles::SECRETARIAT]);
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR]);
    }

    public function bulkStatus(User $user): bool
    {
        return $user->hasAnyRole([Roles::ADMINISTRATOR, Roles::DIRECTOR, Roles::SECRETARIAT]);
    }
}
