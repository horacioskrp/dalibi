<?php

namespace App\Services;

use App\Models\EmployeeProfile;
use App\Models\PayRun;
use App\Models\Payslip;
use App\Models\SalaryComponent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PayrollService
{
    public function __construct(private readonly AccountingService $accountingService) {}

    /**
     * Crée un cycle de paie brouillon pour un mois/année et génère un bulletin
     * par employé actif (salaire de base + rubriques par défaut).
     */
    public function generate(int $month, int $year, ?string $label = null): PayRun
    {
        // Un seul cycle actif (non annulé) par période.
        $exists = PayRun::where('period_month', $month)
            ->where('period_year', $year)
            ->where('status', '!=', PayRun::CANCELLED)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'period' => ['Un cycle de paie existe déjà pour cette période.'],
            ]);
        }

        return DB::transaction(function () use ($month, $year, $label): PayRun {
            $run = PayRun::create([
                'reference'    => $this->generateReference($month, $year),
                'period_month' => $month,
                'period_year'  => $year,
                'label'        => $label,
                'status'       => PayRun::DRAFT,
                'created_by'   => auth()->id(),
            ]);

            $components = SalaryComponent::where('active', true)
                ->where('is_default', true)
                ->orderBy('sort_order')
                ->get();

            $employees = EmployeeProfile::with('user:id,firstname,lastname')
                ->where('status', 'active')
                ->get();

            foreach ($employees as $employee) {
                $lines = $this->buildLines($employee, $components);
                $this->persistPayslip($run, $employee, $lines);
            }

            $this->refreshTotals($run);

            return $run->fresh(['payslips']);
        });
    }

    /**
     * Recompose les lignes par défaut d'un employé : salaire de base + rubriques.
     *
     * @return array<int, array{code:?string, label:string, type:string, amount:float}>
     */
    private function buildLines(EmployeeProfile $employee, $components): array
    {
        $lines = [[
            'code'   => 'BASE',
            'label'  => 'Salaire de base',
            'type'   => SalaryComponent::EARNING,
            'amount' => (float) $employee->base_salary,
        ]];

        foreach ($components as $c) {
            $lines[] = [
                'code'   => $c->code,
                'label'  => $c->name,
                'type'   => $c->type,
                'amount' => (float) ($c->default_amount ?? 0),
            ];
        }

        return $lines;
    }

    /**
     * Remplace les lignes d'un bulletin (uniquement tant que le cycle est en
     * brouillon) et recalcule les totaux du bulletin et du cycle.
     *
     * @param  array<int, array{code:?string, label:string, type:string, amount:float}>  $lines
     */
    public function updatePayslipLines(Payslip $payslip, array $lines): Payslip
    {
        $run = $payslip->payRun;
        if ($run->status !== PayRun::DRAFT) {
            throw ValidationException::withMessages([
                'payslip' => ['Seul un cycle en brouillon peut être modifié.'],
            ]);
        }

        return DB::transaction(function () use ($payslip, $lines, $run): Payslip {
            [$gross, $deductions, $net] = $this->totals($lines);

            $payload = $payslip->payload;
            $payload['lines'] = $lines;

            $payslip->update([
                'payload'          => $payload,
                'gross'            => $gross,
                'total_deductions' => $deductions,
                'net'              => $net,
            ]);

            $this->refreshTotals($run);

            return $payslip->fresh();
        });
    }

    /** Valide le cycle (brouillon → validé). */
    public function validate(PayRun $run): PayRun
    {
        $this->assertStatus($run, [PayRun::DRAFT]);

        $run->update(['status' => PayRun::VALIDATED, 'validated_at' => now()]);

        return $run->fresh();
    }

    /**
     * Paie le cycle : pour chaque bulletin, écrit une dépense de salaire et
     * débite la caisse choisie. Passe le cycle à « payé ».
     */
    public function pay(PayRun $run, string $cashAccountId): PayRun
    {
        $this->assertStatus($run, [PayRun::VALIDATED]);

        return DB::transaction(function () use ($run, $cashAccountId): PayRun {
            $run->load('payslips');
            $periodLabel = $run->periodLabel();

            foreach ($run->payslips as $payslip) {
                $this->accountingService->recordPayrollTransaction($payslip, $cashAccountId, $periodLabel);
            }

            $run->update([
                'status'          => PayRun::PAID,
                'paid_at'         => now(),
                'cash_account_id' => $cashAccountId,
            ]);

            return $run->fresh();
        });
    }

    /**
     * Annule le cycle. Si déjà payé, recrédite la caisse et supprime les
     * transactions liées.
     */
    public function cancel(PayRun $run): PayRun
    {
        $this->assertStatus($run, [PayRun::DRAFT, PayRun::VALIDATED, PayRun::PAID]);

        return DB::transaction(function () use ($run): PayRun {
            if ($run->status === PayRun::PAID) {
                $run->load('payslips');
                foreach ($run->payslips as $payslip) {
                    $this->accountingService->cancelPayrollTransaction($payslip);
                }
            }

            $run->update(['status' => PayRun::CANCELLED]);

            return $run->fresh();
        });
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    private function persistPayslip(PayRun $run, EmployeeProfile $employee, array $lines): Payslip
    {
        [$gross, $deductions, $net] = $this->totals($lines);

        return Payslip::create([
            'pay_run_id'          => $run->id,
            'employee_profile_id' => $employee->id,
            'reference'           => $run->reference . '-' . Str::upper(Str::random(4)),
            'gross'               => $gross,
            'total_deductions'    => $deductions,
            'net'                 => $net,
            'payload'             => [
                'employee' => [
                    'name'          => $employee->fullName(),
                    'matricule'     => $employee->employee_number,
                    'job_title'     => $employee->job_title,
                    'contract_type' => $employee->contract_type,
                    'cnss_number'   => $employee->cnss_number,
                ],
                'lines' => $lines,
            ],
        ]);
    }

    /** @return array{0:float,1:float,2:float} [gross, deductions, net] */
    private function totals(array $lines): array
    {
        $gross = 0.0;
        $deductions = 0.0;
        foreach ($lines as $line) {
            $amount = (float) ($line['amount'] ?? 0);
            if (($line['type'] ?? '') === SalaryComponent::DEDUCTION) {
                $deductions += $amount;
            } else {
                $gross += $amount;
            }
        }

        return [$gross, $deductions, $gross - $deductions];
    }

    private function refreshTotals(PayRun $run): void
    {
        $sums = $run->payslips()->selectRaw('
            coalesce(sum(gross), 0) as g,
            coalesce(sum(total_deductions), 0) as d,
            coalesce(sum(net), 0) as n
        ')->first();

        $run->update([
            'total_gross'      => (float) $sums->g,
            'total_deductions' => (float) $sums->d,
            'total_net'        => (float) $sums->n,
        ]);
    }

    private function assertStatus(PayRun $run, array $allowed): void
    {
        if (! in_array($run->status, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => ['Action impossible pour un cycle au statut « ' . $run->status . ' ».'],
            ]);
        }
    }

    private function generateReference(int $month, int $year): string
    {
        $base = sprintf('PAIE-%04d-%02d', $year, $month);
        $ref  = $base;
        $i    = 1;
        while (PayRun::where('reference', $ref)->exists()) {
            $ref = $base . '-' . (++$i);
        }

        return $ref;
    }
}
