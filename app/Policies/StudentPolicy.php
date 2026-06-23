<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view_students');
    }

    public function view(User $user, Student $student): bool
    {
        return $user->can('view_students');
    }

    public function create(User $user): bool
    {
        return $user->can('create_students');
    }

    public function update(User $user, Student $student): bool
    {
        return $user->can('edit_students');
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->can('delete_students');
    }

    public function bulkStatus(User $user): bool
    {
        return $user->can('edit_students');
    }
}
