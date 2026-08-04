<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #1f2937; font-size: 12px; margin: 24px; }
        /* En-tête officiel partagé (même style que les documents administratifs) */
        {!! $headerCss !!}
        .title { text-align: center; font-size: 16px; font-weight: bold; margin: 10px 0 2px; letter-spacing: 1px; }
        .subtitle { text-align: center; color: #6b7280; margin-bottom: 16px; }
        .meta { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .meta td { padding: 3px 6px; vertical-align: top; }
        .meta .label { color: #6b7280; width: 130px; }
        table.lines { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.lines th, table.lines td { border: 1px solid #e5e7eb; padding: 6px 8px; }
        table.lines th { background: #f3f4f6; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; }
        .amount { text-align: right; white-space: nowrap; }
        .earning { color: #047857; }
        .deduction { color: #b91c1c; }
        .totals { width: 100%; border-collapse: collapse; margin-top: 14px; }
        .totals td { padding: 6px 8px; }
        .totals .k { color: #6b7280; text-align: right; }
        .totals .v { text-align: right; font-weight: bold; width: 140px; }
        .net { background: #111827; color: #fff; }
        .net .k, .net .v { color: #fff; font-size: 14px; }
        .footer { margin-top: 40px; color: #6b7280; font-size: 11px; }
        .sign { margin-top: 36px; width: 100%; }
        .sign td { width: 50%; text-align: center; color: #6b7280; }
    </style>
</head>
<body>
    {!! $watermarkHtml !!}
    {!! $headerHtml !!}

    <div class="title">BULLETIN DE PAIE</div>
    <div class="subtitle">Période : {{ $payRun->periodLabel() }} — Réf. {{ $payslip->reference }}</div>

    @php $emp = $payslip->payload['employee'] ?? []; @endphp
    <table class="meta">
        <tr>
            <td class="label">Employé</td><td><strong>{{ $emp['name'] ?? '—' }}</strong></td>
            <td class="label">Matricule</td><td>{{ $emp['matricule'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="label">Poste</td><td>{{ $emp['job_title'] ?? '—' }}</td>
            <td class="label">N° CNSS</td><td>{{ $emp['cnss_number'] ?? '—' }}</td>
        </tr>
    </table>

    <table class="lines">
        <thead>
            <tr><th>Rubrique</th><th>Type</th><th class="amount">Montant ({{ $currency }})</th></tr>
        </thead>
        <tbody>
            @foreach (($payslip->payload['lines'] ?? []) as $line)
                <tr>
                    <td>{{ $line['label'] ?? '' }}</td>
                    <td>{{ ($line['type'] ?? '') === 'deduction' ? 'Retenue' : 'Gain' }}</td>
                    <td class="amount {{ ($line['type'] ?? '') === 'deduction' ? 'deduction' : 'earning' }}">
                        {{ ($line['type'] ?? '') === 'deduction' ? '− ' : '' }}{{ number_format((float) ($line['amount'] ?? 0), 0, ',', ' ') }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr><td class="k">Total des gains</td><td class="v">{{ number_format($payslip->gross, 0, ',', ' ') }} {{ $currency }}</td></tr>
        <tr><td class="k">Total des retenues</td><td class="v deduction">− {{ number_format($payslip->total_deductions, 0, ',', ' ') }} {{ $currency }}</td></tr>
        <tr class="net"><td class="k">NET À PAYER</td><td class="v">{{ number_format($payslip->net, 0, ',', ' ') }} {{ $currency }}</td></tr>
    </table>

    @php $employer = $payslip->payload['employer_charges'] ?? []; @endphp
    @if (!empty($employer))
        <div style="margin-top:14px; font-size:11px; color:#6b7280;">
            <strong>Charges patronales (non déduites du net) :</strong>
            @foreach ($employer as $c)
                {{ $c['label'] ?? '' }} : {{ number_format((float) ($c['amount'] ?? 0), 0, ',', ' ') }} {{ $currency }}@if(!$loop->last) — @endif
            @endforeach
        </div>
    @endif

    <table class="sign">
        <tr>
            <td>L'employé</td>
            <td>La Direction</td>
        </tr>
    </table>

    <div class="footer">
        Document généré le {{ now()->format('d/m/Y') }} — {{ $school->name ?? '' }}.
    </div>
</body>
</html>
