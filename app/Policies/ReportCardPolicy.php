<?php

namespace App\Policies;

use App\Models\ReportCard;
use App\Models\User;

class ReportCardPolicy
{
    public function view(User $user, ReportCard $reportCard): bool
    {
        return $user->can('view_bulletins');
    }

    public function update(User $user, ReportCard $reportCard): bool
    {
        return $user->can('validate_bulletins');
    }

    public function download(User $user, ReportCard $reportCard): bool
    {
        return $user->can('download_bulletins');
    }
}
