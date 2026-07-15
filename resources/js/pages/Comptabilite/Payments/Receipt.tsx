import { Head } from '@inertiajs/react';
import { useMoney } from '@/helpers/money';
import Barcode from 'react-barcode';

type PaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CHEQUE';

interface School       { name: string; code: string; }
interface Student      { firstname: string; lastname: string; matricule?: string | null; }
interface Classroom    { name: string; code: string; }
interface AcademicYear { year: string; }

interface Enrollment {
    enrollment_code: string;
    school?: School | null;
    student?: Student | null;
    classroom?: Classroom | null;
    academic_year?: AcademicYear | null;
}

interface InvoiceItem  { label: string; type: 'FEE' | 'DISCOUNT'; amount: number; }

interface Invoice {
    invoice_number: string;
    subtotal: number;
    discount_amount: number;
    total: number;
    amount_paid: number;
    amount_remaining: number;
    enrollment: Enrollment;
    items: InvoiceItem[];
}

interface ReceiptRef { receipt_number: string; verification_code?: string | null; }

interface CreatedBy { firstname?: string | null; lastname?: string | null; email?: string | null; }

interface Payment {
    id: string;
    amount: number;
    payment_method: PaymentMethod;
    reference_number?: string | null;
    paid_by?: string | null;
    paid_at: string;
    notes?: string | null;
    receipt?: ReceiptRef | null;
    invoice: Invoice;
    created_by?: CreatedBy | null;
}

interface Props { payment: Payment; }


const methodLabel: Record<PaymentMethod, string> = {
    CASH: 'Espèces',
    MOBILE_MONEY: 'Mobile Money',
    BANK_TRANSFER: 'Virement bancaire',
    CHEQUE: 'Chèque',
};

export default function PaymentReceipt({ payment }: Readonly<Props>) {
    const fmt = useMoney();
    const { invoice } = payment;
    const { enrollment } = invoice;

    const agentName = payment.created_by
        ? [payment.created_by.firstname, payment.created_by.lastname].filter(Boolean).join(' ') || payment.created_by.email
        : null;

    return (
        <>
            <Head title={`Reçu ${payment.receipt?.receipt_number ?? ''}`} />

            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 print:bg-white print:p-0">
                <div className="bg-white w-full max-w-lg shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none">

                    {/* En-tête */}
                    <div className="bg-blue-700 text-white px-8 py-6 text-center">
                        <h1 className="text-xl font-bold uppercase tracking-wider">Reçu de paiement</h1>
                        <p className="text-blue-200 text-sm mt-1">{enrollment.school?.name ?? 'École'}</p>
                        <p className="text-2xl font-extrabold mt-3">{payment.receipt?.receipt_number ?? '—'}</p>
                    </div>

                    {/* Corps */}
                    <div className="px-8 py-6 space-y-6">

                        {/* Élève & inscription */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-400 text-xs uppercase">Élève</p>
                                <p className="font-semibold text-gray-800">
                                    {enrollment.student
                                        ? `${enrollment.student.firstname} ${enrollment.student.lastname}`
                                        : '—'}
                                </p>
                                {enrollment.student?.matricule && (
                                    <p className="text-gray-500 text-xs">{enrollment.student.matricule}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase">Classe</p>
                                <p className="font-semibold text-gray-800">
                                    {enrollment.classroom?.name ?? '—'} {enrollment.classroom?.code ? `(${enrollment.classroom.code})` : ''}
                                </p>
                                <p className="text-gray-500 text-xs">{enrollment.academic_year?.year ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase">N° inscription</p>
                                <p className="font-semibold text-gray-800">{enrollment.enrollment_code}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase">Facture</p>
                                <p className="font-semibold text-gray-800">{invoice.invoice_number}</p>
                            </div>
                        </div>

                        {/* Paiement */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Désignation</th>
                                        <th className="px-4 py-2 text-right">Montant</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoice.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2 text-gray-700">{item.label}</td>
                                            <td className={`px-4 py-2 text-right font-medium ${item.type === 'DISCOUNT' ? 'text-green-600' : 'text-gray-800'}`}>
                                                {item.type === 'DISCOUNT' ? '- ' : ''}{fmt(item.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 text-sm font-semibold border-t border-gray-200">
                                    <tr>
                                        <td className="px-4 py-2 text-gray-600">Total facture</td>
                                        <td className="px-4 py-2 text-right text-gray-900">{fmt(invoice.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Montant payé */}
                        <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 text-center">
                            <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Montant encaissé ce jour</p>
                            <p className="text-3xl font-extrabold text-green-700">{fmt(payment.amount)}</p>
                            <p className="text-sm text-green-600 mt-1">{methodLabel[payment.payment_method]}</p>
                            {payment.reference_number && (
                                <p className="text-xs text-green-500 mt-0.5">Réf : {payment.reference_number}</p>
                            )}
                        </div>

                        {/* Solde */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
                                <p className="text-xs text-gray-400 uppercase">Total payé</p>
                                <p className="font-bold text-gray-800">{fmt(invoice.amount_paid)}</p>
                            </div>
                            <div className={`rounded-lg px-4 py-3 text-center ${invoice.amount_remaining > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                                <p className="text-xs text-gray-400 uppercase">Reste à payer</p>
                                <p className={`font-bold ${invoice.amount_remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {fmt(invoice.amount_remaining)}
                                </p>
                            </div>
                        </div>

                        {/* Infos paiement */}
                        <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex justify-between">
                                <span>Date de paiement :</span>
                                <span className="font-medium text-gray-700">{new Date(payment.paid_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                            {payment.paid_by && (
                                <div className="flex justify-between">
                                    <span>Payé par :</span>
                                    <span className="font-medium text-gray-700">{payment.paid_by}</span>
                                </div>
                            )}
                            {agentName && (
                                <div className="flex justify-between">
                                    <span>Agent :</span>
                                    <span className="font-medium text-gray-700">{agentName}</span>
                                </div>
                            )}
                        </div>
                        {/* Code-barres anti-falsification */}
                        {payment.receipt?.verification_code && (
                            <div className="border-t border-dashed border-gray-200 pt-4 flex flex-col items-center">
                                <Barcode
                                    value={payment.receipt.verification_code}
                                    format="CODE128"
                                    height={48}
                                    width={1.4}
                                    fontSize={12}
                                    margin={0}
                                />
                                <p className="text-[10px] text-gray-400 mt-1 text-center">
                                    Code de vérification — scannez pour authentifier ce reçu
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pied */}
                    <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 flex items-center justify-between">
                        <p className="text-xs text-gray-400">Généré le {new Date().toLocaleString('fr-FR')}</p>
                        <button
                            onClick={() => window.print()}
                            className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition print:hidden"
                        >
                            Imprimer
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
