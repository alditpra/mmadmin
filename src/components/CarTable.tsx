import { useState, useEffect } from 'react';
import DeleteModal from './DeleteModal';

interface Car {
    id: string;
    status: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    transmission: string;
    fuel: string;
    color: string;
    bpkb: string;
    description: string;
    features: string;
    image1: string;
    image2?: string;
    image3?: string;
    image4?: string;
    image5?: string;
    video_url?: string;
    featured: boolean;
    badge?: string;
    sold_date?: string;
    date_added?: string;
}

const defaultCar: Partial<Car> = {
    id: '',
    status: 'available',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    transmission: 'Manual',
    fuel: 'Bensin',
    color: '',
    bpkb: '',
    description: '',
    features: '',
    image1: '',
    featured: false,
    badge: '',
};

export default function CarTable() {
    const [cars, setCars] = useState<Car[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingCar, setEditingCar] = useState<Partial<Car> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const res = await fetch('/api/cars');
            const data = await res.json();
            setCars(data);
        } catch (error) {
            console.error('Error fetching cars:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
    };

    const filteredCars = cars.filter(car =>
        car.brand.toLowerCase().includes(search.toLowerCase()) ||
        car.model.toLowerCase().includes(search.toLowerCase()) ||
        car.id.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = async () => {
        if (!editingCar) return;
        setIsSaving(true);

        try {
            const isNew = !editingCar.id || !cars.find(c => c.id === editingCar.id);

            if (isNew) {
                // Generate new ID
                const newId = `CAR${String(cars.length + 1).padStart(3, '0')}`;
                const carData = { ...editingCar, id: newId, date_added: new Date().toISOString().split('T')[0] };

                await fetch('/api/cars', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(carData),
                });
            } else {
                await fetch(`/api/cars/${editingCar.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingCar),
                });
            }

            await fetchCars();
            setEditingCar(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving car:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsSaving(true);

        try {
            await fetch(`/api/cars/${deleteId}`, { method: 'DELETE' });
            await fetchCars();
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting car:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusToggle = async (car: Car) => {
        const newStatus = car.status === 'available' ? 'sold' : 'available';
        const updates: Partial<Car> = { ...car, status: newStatus };

        if (newStatus === 'sold') {
            updates.sold_date = new Date().toLocaleDateString('id-ID');
        } else {
            updates.sold_date = '';
        }

        await fetch(`/api/cars/${car.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        await fetchCars();
    };

    if (isLoading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Mobil ({cars.length})</h3>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            type="text"
                            className="form-input search-input"
                            placeholder="Cari mobil..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={() => { setEditingCar(defaultCar); setIsModalOpen(true); }}>
                            + Tambah Mobil
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Gambar</th>
                                <th>ID</th>
                                <th>Merk & Model</th>
                                <th>Tahun</th>
                                <th>Harga</th>
                                <th>KM</th>
                                <th>Status</th>
                                <th>Badge</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCars.map(car => (
                                <tr key={car.id}>
                                    <td>
                                        {car.image1 ? (
                                            <img src={car.image1} alt={car.model} className="table-image" />
                                        ) : (
                                            <div className="table-image" style={{ background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                No img
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{car.id}</td>
                                    <td>
                                        <strong>{car.brand}</strong><br />
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{car.model}</span>
                                    </td>
                                    <td>{car.year}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{formatPrice(car.price)}</td>
                                    <td>{car.mileage?.toLocaleString()} km</td>
                                    <td>
                                        <button
                                            className={`badge ${car.status === 'available' ? 'badge-success' : 'badge-error'}`}
                                            onClick={() => handleStatusToggle(car)}
                                            style={{ cursor: 'pointer', border: 'none' }}
                                        >
                                            {car.status === 'available' ? 'Tersedia' : 'Terjual'}
                                        </button>
                                    </td>
                                    <td>
                                        {car.badge && <span className="badge badge-warning">{car.badge}</span>}
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCar(car); setIsModalOpen(true); }}>
                                                Edit
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(car.id)}>
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
            {isModalOpen && editingCar && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingCar.id ? 'Edit Mobil' : 'Tambah Mobil Baru'}</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Merk</label>
                                    <input className="form-input" value={editingCar.brand || ''} onChange={e => setEditingCar({ ...editingCar, brand: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Model</label>
                                    <input className="form-input" value={editingCar.model || ''} onChange={e => setEditingCar({ ...editingCar, model: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tahun</label>
                                    <input type="number" className="form-input" value={editingCar.year || ''} onChange={e => setEditingCar({ ...editingCar, year: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Harga (Rp)</label>
                                    <input type="number" className="form-input" value={editingCar.price || ''} onChange={e => setEditingCar({ ...editingCar, price: parseInt(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Kilometer</label>
                                    <input type="number" className="form-input" value={editingCar.mileage || ''} onChange={e => setEditingCar({ ...editingCar, mileage: parseInt(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Warna</label>
                                    <input className="form-input" value={editingCar.color || ''} onChange={e => setEditingCar({ ...editingCar, color: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Transmisi</label>
                                    <select className="form-select" value={editingCar.transmission || 'Manual'} onChange={e => setEditingCar({ ...editingCar, transmission: e.target.value })}>
                                        <option value="Manual">Manual</option>
                                        <option value="Automatic">Automatic</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bahan Bakar</label>
                                    <select className="form-select" value={editingCar.fuel || 'Bensin'} onChange={e => setEditingCar({ ...editingCar, fuel: e.target.value })}>
                                        <option value="Bensin">Bensin</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={editingCar.status || 'available'} onChange={e => setEditingCar({ ...editingCar, status: e.target.value })}>
                                        <option value="available">Tersedia</option>
                                        <option value="sold">Terjual</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">BPKB s/d</label>
                                    <input className="form-input" value={editingCar.bpkb || ''} onChange={e => setEditingCar({ ...editingCar, bpkb: e.target.value })} placeholder="DD/MM/YYYY" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Badge</label>
                                    <input className="form-input" value={editingCar.badge || ''} onChange={e => setEditingCar({ ...editingCar, badge: e.target.value })} placeholder="Harga BU, DP Ringan, dll" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        Featured
                                        <label className="toggle">
                                            <input type="checkbox" checked={editingCar.featured || false} onChange={e => setEditingCar({ ...editingCar, featured: e.target.checked })} />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deskripsi</label>
                                <textarea className="form-textarea" value={editingCar.description || ''} onChange={e => setEditingCar({ ...editingCar, description: e.target.value })} rows={3} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fitur (pisahkan dengan ;)</label>
                                <input className="form-input" value={editingCar.features || ''} onChange={e => setEditingCar({ ...editingCar, features: e.target.value })} placeholder="AC;Power Window;ABS" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Gambar 1 URL</label>
                                    <input className="form-input" value={editingCar.image1 || ''} onChange={e => setEditingCar({ ...editingCar, image1: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Gambar 2 URL</label>
                                    <input className="form-input" value={editingCar.image2 || ''} onChange={e => setEditingCar({ ...editingCar, image2: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Gambar 3 URL</label>
                                    <input className="form-input" value={editingCar.image3 || ''} onChange={e => setEditingCar({ ...editingCar, image3: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Gambar 4 URL</label>
                                    <input className="form-input" value={editingCar.image4 || ''} onChange={e => setEditingCar({ ...editingCar, image4: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Gambar 5 URL</label>
                                    <input className="form-input" value={editingCar.image5 || ''} onChange={e => setEditingCar({ ...editingCar, image5: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Video URL (YouTube)</label>
                                    <input className="form-input" value={editingCar.video_url || ''} onChange={e => setEditingCar({ ...editingCar, video_url: e.target.value })} />
                                </div>
                            </div>
                            {editingCar.image1 && (
                                <div style={{ marginTop: '1rem' }}>
                                    <label className="form-label">Preview:</label>
                                    <img src={editingCar.image1} alt="Preview" style={{ maxWidth: '200px', borderRadius: '0.5rem' }} />
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
                title="Hapus Mobil"
                message="Apakah Anda yakin ingin menghapus mobil ini? Tindakan ini tidak dapat dibatalkan."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                isLoading={isSaving}
            />
        </>
    );
}
