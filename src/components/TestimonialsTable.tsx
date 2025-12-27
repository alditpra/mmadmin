import { useState, useEffect } from 'react';
import DeleteModal from './DeleteModal';

interface Testimonial {
    id: string;
    type: 'screenshot' | 'photo' | 'video';
    media: string;
    name: string;
    car: string;
    quote: string;
    rating: number;
}

const defaultTestimonial: Partial<Testimonial> = {
    id: '',
    type: 'photo',
    media: '',
    name: '',
    car: '',
    quote: '',
    rating: 5,
};

export default function TestimonialsTable() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch('/api/testimonials');
            const data = await res.json();
            setTestimonials(data);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getYouTubeThumbnail = (url: string) => {
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\s]+)/);
        if (videoIdMatch) {
            return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
        }
        return '';
    };

    const handleSave = async () => {
        if (!editingItem) return;
        setIsSaving(true);

        try {
            const isNew = !editingItem.id || !testimonials.find(t => t.id === editingItem.id);

            if (isNew) {
                const newId = String(testimonials.length + 1);
                await fetch('/api/testimonials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...editingItem, id: newId }),
                });
            } else {
                await fetch(`/api/testimonials/${editingItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingItem),
                });
            }

            await fetchTestimonials();
            setEditingItem(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving testimonial:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsSaving(true);

        try {
            await fetch(`/api/testimonials/${deleteId}`, { method: 'DELETE' });
            await fetchTestimonials();
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting testimonial:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Testimonials ({testimonials.length})</h3>
                    <button className="btn btn-primary" onClick={() => { setEditingItem(defaultTestimonial); setIsModalOpen(true); }}>
                        + Tambah Testimoni
                    </button>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Media</th>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Nama</th>
                                <th>Mobil</th>
                                <th>Quote</th>
                                <th>Rating</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        {item.type === 'video' ? (
                                            <img
                                                src={getYouTubeThumbnail(item.media)}
                                                alt="Video thumbnail"
                                                className="table-image"
                                                style={{ position: 'relative' }}
                                            />
                                        ) : (
                                            <img src={item.media} alt={item.name} className="table-image" />
                                        )}
                                    </td>
                                    <td>{item.id}</td>
                                    <td>
                                        <span className={`badge ${item.type === 'video' ? 'badge-warning' : 'badge-success'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.car}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.quote || '-'}
                                    </td>
                                    <td>{'⭐'.repeat(item.rating)}</td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn btn-secondary btn-sm" onClick={() => { setEditingItem(item); setIsModalOpen(true); }}>
                                                Edit
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(item.id)}>
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit/Add Modal */}
            {isModalOpen && editingItem && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingItem.id ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Tipe</label>
                                <select
                                    className="form-select"
                                    value={editingItem.type || 'photo'}
                                    onChange={e => setEditingItem({ ...editingItem, type: e.target.value as Testimonial['type'] })}
                                >
                                    <option value="screenshot">Screenshot</option>
                                    <option value="photo">Photo</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    {editingItem.type === 'video' ? 'YouTube URL' : 'Image URL'}
                                </label>
                                <input
                                    className="form-input"
                                    value={editingItem.media || ''}
                                    onChange={e => setEditingItem({ ...editingItem, media: e.target.value })}
                                    placeholder={editingItem.type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Nama</label>
                                    <input
                                        className="form-input"
                                        value={editingItem.name || ''}
                                        onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mobil</label>
                                    <input
                                        className="form-input"
                                        value={editingItem.car || ''}
                                        onChange={e => setEditingItem({ ...editingItem, car: e.target.value })}
                                        placeholder="Toyota Avanza 2020"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Quote</label>
                                <textarea
                                    className="form-textarea"
                                    value={editingItem.quote || ''}
                                    onChange={e => setEditingItem({ ...editingItem, quote: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rating (1-5)</label>
                                <select
                                    className="form-select"
                                    value={editingItem.rating || 5}
                                    onChange={e => setEditingItem({ ...editingItem, rating: parseInt(e.target.value) })}
                                >
                                    {[5, 4, 3, 2, 1].map(n => (
                                        <option key={n} value={n}>{'⭐'.repeat(n)} ({n})</option>
                                    ))}
                                </select>
                            </div>
                            {editingItem.media && (
                                <div style={{ marginTop: '1rem' }}>
                                    <label className="form-label">Preview:</label>
                                    <img
                                        src={editingItem.type === 'video' ? getYouTubeThumbnail(editingItem.media) : editingItem.media}
                                        alt="Preview"
                                        style={{ maxWidth: '200px', borderRadius: '0.5rem' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteModal
                isOpen={!!deleteId}
                title="Hapus Testimoni"
                message="Apakah Anda yakin ingin menghapus testimoni ini?"
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                isLoading={isSaving}
            />
        </>
    );
}
