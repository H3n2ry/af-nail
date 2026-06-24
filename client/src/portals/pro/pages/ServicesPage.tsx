import React, { useState, useEffect } from 'react';
import { ServiceCard } from '../../../components/ServiceCard';
import { Modal } from '../../../components/Modal';
import { serviceApi, Service } from '../../../lib/api';

type ServiceForm = {
  name: string;
  description: string;
  price_cents: string;
  duration_minutes: string;
  is_combo: boolean;
};

const emptyForm: ServiceForm = { name: '', description: '', price_cents: '', duration_minutes: '60', is_combo: false };

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const { services } = await serviceApi.mine();
      setServices(services);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description ?? '',
      price_cents: (service.price_cents / 100).toFixed(2),
      duration_minutes: service.duration_minutes.toString(),
      is_combo: !!service.is_combo,
    });
    setError('');
    setShowForm(true);
  }

  async function handleToggle(service: Service) {
    await serviceApi.update(service.id, { is_active: !service.is_active });
    await load();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const price = Math.round(parseFloat(form.price_cents.replace(',', '.')) * 100);
      if (isNaN(price) || price <= 0) throw new Error('Preço inválido');
      const duration = parseInt(form.duration_minutes);
      if (isNaN(duration) || duration < 30) throw new Error('Duração mínima de 30 minutos');

      if (editing) {
        await serviceApi.update(editing.id, {
          name: form.name,
          description: form.description || undefined,
          price_cents: price,
          duration_minutes: duration,
          is_combo: form.is_combo,
        });
      } else {
        await serviceApi.create({
          name: form.name,
          description: form.description || undefined,
          price_cents: price,
          duration_minutes: duration,
          is_combo: form.is_combo,
        });
      }
      await load();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  const active = services.filter(s => s.is_active);
  const inactive = services.filter(s => !s.is_active);

  return (
    <div className="page-container pt-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Serviços</h2>
        <button onClick={openCreate} className="btn-primary text-sm px-4 py-2 min-h-[40px]">
          + Novo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <span className="text-5xl">💅</span>
          <p className="text-neutral-500">Nenhum serviço cadastrado</p>
          <button onClick={openCreate} className="btn-primary">Criar primeiro serviço</button>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Ativos ({active.length})</h3>
              <div className="space-y-3">
                {active.map(s => (
                  <ServiceCard key={s.id} service={s} showToggle onToggle={() => handleToggle(s)} onEdit={() => openEdit(s)} />
                ))}
              </div>
            </section>
          )}
          {inactive.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Inativos ({inactive.length})</h3>
              <div className="space-y-3">
                {inactive.map(s => (
                  <ServiceCard key={s.id} service={s} showToggle onToggle={() => handleToggle(s)} onEdit={() => openEdit(s)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Serviço' : 'Novo Serviço'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nome do serviço *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Esmaltação em Gel" className="input" required />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Detalhes do serviço..." rows={2} className="input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Preço (R$) *</label>
              <input type="text" value={form.price_cents} onChange={e => setForm(f => ({ ...f, price_cents: e.target.value }))}
                placeholder="85,00" className="input font-mono" required />
            </div>
            <div>
              <label className="label">Duração (min)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                min="30" step="30" className="input" required />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_combo} onChange={e => {
              const checked = e.target.checked;
              setForm(f => {
                const cur = parseInt(f.duration_minutes) || 60;
                const next = checked ? cur * 2 : Math.max(30, Math.round(cur / 2));
                return { ...f, is_combo: checked, duration_minutes: String(next) };
              });
            }}
              className="w-4 h-4 accent-primary" />
            <div>
              <span className="font-medium text-neutral-900 text-sm">Combo pé + mão</span>
              <p className="text-xs text-neutral-500">Ocupa 2 slots consecutivos (120 min)</p>
            </div>
          </label>

          {error && <p className="text-sm text-error bg-error/10 rounded-md px-3 py-2">{error}</p>}

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar serviço'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
