import { Building2, ImageIcon, Mail, MapPin, MapPinned, Phone, Save, ShieldCheck, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface SchoolFormData {
    name: string;
    code: string;
    logo: string;
    email: string;
    phone: string;
    address: string;
    region: string;
    city: string;
    po_box: string;
    active: boolean;
}

interface SchoolFormProps {
    mode: 'create' | 'edit';
    data: SchoolFormData;
    errors: Record<string, string>;
    processing: boolean;
    onCancel: () => void;
    onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
    setData: <K extends keyof SchoolFormData>(key: K, value: SchoolFormData[K]) => void;
}

export function SchoolForm({ mode, data, errors, processing, onCancel, onSubmit, setData }: Readonly<SchoolFormProps>) {
    let submitLabel = 'Mettre à jour';

    if (processing && mode === 'create') {
        submitLabel = 'Création...';
    } else if (processing) {
        submitLabel = 'Mise à jour...';
    } else if (mode === 'create') {
        submitLabel = 'Créer l\'école';
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-2xl p-5 bg-linear-to-br from-blue-50/60 to-white ring-1 ring-blue-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Identité de l'école</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">Nom *</label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            disabled={processing}
                            className={errors.name ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                            placeholder="Ex: Lycée Jean Jaurès"
                        />
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-900 mb-2">Code *</label>
                        <Input
                            id="code"
                            value={data.code}
                            onChange={(event) => setData('code', event.target.value)}
                            disabled={processing}
                            className={errors.code ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-blue-500'}
                            placeholder="Ex: LJJ001"
                        />
                        {errors.code && <p className="text-sm text-red-600 mt-1">{errors.code}</p>}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl p-5 bg-linear-to-br from-violet-50/60 to-white ring-1 ring-violet-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Logo et contact</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="logo" className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                            <ImageIcon className="w-4 h-4 text-violet-600" />
                            URL du logo
                        </label>
                        <Input
                            id="logo"
                            value={data.logo}
                            onChange={(event) => setData('logo', event.target.value)}
                            disabled={processing}
                            className={errors.logo ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-violet-500'}
                            placeholder="https://..."
                        />
                        {errors.logo && <p className="text-sm text-red-600 mt-1">{errors.logo}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                            <Mail className="w-4 h-4 text-violet-600" />
                            E-mail
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            disabled={processing}
                            className={errors.email ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-violet-500'}
                            placeholder="contact@ecole.com"
                        />
                        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                            <Phone className="w-4 h-4 text-violet-600" />
                            Téléphone
                        </label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(event) => setData('phone', event.target.value)}
                            disabled={processing}
                            className={errors.phone ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-violet-500'}
                            placeholder="+228 XX XX XX XX"
                        />
                        {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl p-5 bg-linear-to-br from-emerald-50/60 to-white ring-1 ring-emerald-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <MapPinned className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Localisation</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="region" className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            Région
                        </label>
                        <Input
                            id="region"
                            value={data.region}
                            onChange={(event) => setData('region', event.target.value)}
                            disabled={processing}
                            className={errors.region ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-emerald-500'}
                        />
                        {errors.region && <p className="text-sm text-red-600 mt-1">{errors.region}</p>}
                    </div>

                    <div>
                        <label htmlFor="city" className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            Ville
                        </label>
                        <Input
                            id="city"
                            value={data.city}
                            onChange={(event) => setData('city', event.target.value)}
                            disabled={processing}
                            className={errors.city ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-emerald-500'}
                        />
                        {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="po_box" className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                            <WalletCards className="w-4 h-4 text-emerald-600" />
                            Boîte postale
                        </label>
                        <Input
                            id="po_box"
                            value={data.po_box}
                            onChange={(event) => setData('po_box', event.target.value)}
                            disabled={processing}
                            className={errors.po_box ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-emerald-500'}
                            placeholder="BP 123"
                        />
                        {errors.po_box && <p className="text-sm text-red-600 mt-1">{errors.po_box}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">Adresse complète</label>
                        <Textarea
                            id="address"
                            rows={3}
                            value={data.address}
                            onChange={(event) => setData('address', event.target.value)}
                            disabled={processing}
                            className={errors.address ? 'border-red-500 bg-red-50/40' : 'border-gray-200 bg-white focus-visible:ring-emerald-500'}
                        />
                        {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl p-5 bg-linear-to-br from-amber-50/60 to-white ring-1 ring-amber-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2 ring-1 ring-amber-100">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Statut</h3>
                </div>

                <div className="flex items-center gap-3">
                    <Checkbox
                        id="active"
                        checked={data.active}
                        onCheckedChange={(checked) => setData('active', checked === true)}
                    />
                    <label htmlFor="active" className="text-sm font-medium text-gray-700">École active</label>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={processing} className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50">
                    Annuler
                </Button>
                <Button type="submit" disabled={processing} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Save className="w-4 h-4" />
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
