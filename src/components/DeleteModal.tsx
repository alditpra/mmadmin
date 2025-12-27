import { useState } from 'react';

interface DeleteModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function DeleteModal({ isOpen, title, message, onConfirm, onCancel, isLoading }: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onCancel}>&times;</button>
                </div>
                <div className="modal-body">
                    <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
                        Batal
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Menghapus...' : 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}
