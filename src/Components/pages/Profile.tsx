import { useEffect, useMemo, useState } from 'react';
import { ProfileService, type ProfilePayload, type ProfileResponse } from '../../services/profile';
import { useToast } from '../../contexts/ToastContext';

export default function Profile() {
  const { showInfo } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [server, setServer] = useState<ProfileResponse | null>(null);

  const [form, setForm] = useState<ProfilePayload>({
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await ProfileService.get();
        setServer(data);
        setForm({
          email: data.user.email ?? '',
          first_name: data.user.first_name ?? '',
          last_name: data.user.last_name ?? '',
          bio: data.bio ?? '',
        });
      } catch (e: any) {
        showInfo('No se pudo cargar tu perfil', e?.message || 'Intenta de nuevo');
      } finally {
        setLoading(false);
      }
    })();
  }, [showInfo]);

  const dirty = useMemo(() => {
    if (!server) return false;
    return (
      form.email !== (server.user.email ?? '') ||
      form.first_name !== (server.user.first_name ?? '') ||
      form.last_name !== (server.user.last_name ?? '') ||
      form.bio !== (server.bio ?? '')
    );
  }, [form, server]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    try {
      const updated = await ProfileService.update(form);
      setServer(updated);
      setForm({
        email: updated.user.email ?? '',
        first_name: updated.user.first_name ?? '',
        last_name: updated.user.last_name ?? '',
        bio: updated.bio ?? '',
      });

      // Mantener la navbar mostrando nombres correctos:
      // guardamos sólo el "user" plano en user_data (Navbar lo lee como {first_name, last_name, ...})
      localStorage.setItem('user_data', JSON.stringify(updated.user));

      showInfo('Perfil actualizado', 'Tus cambios se guardaron correctamente.');
    } catch (e: any) {
      showInfo('No se pudo actualizar', e?.message || 'Revisa los campos e intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    if (!server) return;
    setForm({
      email: server.user.email ?? '',
      first_name: server.user.first_name ?? '',
      last_name: server.user.last_name ?? '',
      bio: server.bio ?? '',
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse p-6 rounded-2xl border bg-[var(--card-bg-color)]" />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-6 rounded-2xl border bg-[var(--card-bg-color)]">
          <p className="text-[var(--text-muted)]">No pudimos cargar tu perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="p-6 rounded-2xl border shadow-sm bg-[var(--card-bg-color)]">
        <h1 className="text-2xl font-semibold mb-6">Mi perfil</h1>

        <form onSubmit={onSubmit} className="grid gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1">Nombre</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-[var(--accent-color)] bg-white"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1">Apellido</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-[var(--accent-color)] bg-white"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className="w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-[var(--accent-color)] bg-white"
              placeholder="correo@dominio.com"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Biografía</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={onChange}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-[var(--accent-color)] bg-white"
              placeholder="Cuéntanos sobre ti"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 rounded-lg bg-[var(--card-bg-color)] text-[var(--accent-color)] hover:bg-[var(--card-border-color)] transition shadow-sm disabled:opacity-50"
              disabled={!dirty || saving}
            >
              Restablecer
            </button>
            <button
              type="submit"
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-color)] text-[var(--text-on-primary)] font-medium hover:bg-[var(--primary-color)] transition shadow-sm disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
