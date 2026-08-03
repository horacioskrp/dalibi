<?php

namespace App\Http\Controllers\Paie;

use App\Http\Controllers\Controller;
use App\Models\Payslip;
use App\Models\School;
use App\Services\DocumentRenderer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class PayslipController extends Controller
{
    /** Télécharge le bulletin de paie en PDF, avec l'en-tête de l'école. */
    public function pdf(Payslip $payslip)
    {
        $payslip->load('payRun');
        $school = School::query()->first() ?? new School();

        $headerHtml = app(DocumentRenderer::class)->headerHtml($school, [
            'document_title' => 'BULLETIN DE PAIE',
        ]);

        $html = view('payroll.payslip', [
            'payslip'    => $payslip,
            'payRun'     => $payslip->payRun,
            'school'     => $school,
            'headerHtml' => $headerHtml,
            'currency'   => $school->currencySymbol(),
        ])->render();

        $name = $payslip->payload['employee']['name'] ?? 'employe';
        $filename = Str::slug('bulletin-paie-' . $name . '-' . $payslip->payRun->reference) . '.pdf';

        return Pdf::loadHTML($html)->setPaper('a4', 'portrait')->download($filename);
    }
}
