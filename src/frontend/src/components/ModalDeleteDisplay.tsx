// components/ModalEditDisplay.tsx
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const ModalEditDisplay: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null; // ModalEditDisplay wird nicht gerendert, wenn isOpen false ist

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">Display löschen</h2>
                {children} {/* Hier wird der übergebene Inhalt (Formular) gerendert */}
                <div className="mt-4">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditDisplay;
