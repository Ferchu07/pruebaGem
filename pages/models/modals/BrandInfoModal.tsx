import React, { useCallback } from 'react';
import { Modal, Button } from 'rizzui';
import { ReactComponent as VerIcon } from '../../../assets/Iconos/Interfaz/ver.svg';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch';
import { BrandService } from '../../../services/brand/brandService';
import { BrandApiResponse } from '../../../type/entities/brand-type';
import { menuRoutes } from '../../../router/menu';

interface BrandInfoModalProps {
    brandId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const BrandInfoModal: React.FC<BrandInfoModalProps> = ({
    brandId,
    isOpen,
    onClose
}) => {

    const navigate = useNavigate();
    const service = new BrandService();

    const [data, loading] = useFetch(useCallback(async () => {
        if (!brandId) return null;
        const response = await service.getBrandById(brandId);
        return response.getResponseData() as BrandApiResponse;
    }, [brandId]));

    const handleRedirect = () => {
        if (!brandId) return;
        onClose();
        navigate(
            `${menuRoutes.brands.path}/${brandId}/profile/${menuRoutes.brands.profile.info}`
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            containerClassName="border-2 border-black"    
        >
            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                            Información de la marca
                        </h4>
                        <p className="text-sm text-gray-500">
                            Vista rápida de los datos principales
                        </p>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRedirect}
                        className="flex items-center gap-2"
                    >
                        <VerIcon className="w-4 h-4" />
                        Ver perfil completo
                    </Button>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="py-10 text-center text-gray-500">
                        Cargando información...
                    </div>
                ) : (
                    <div className="space-y-6">

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                                Nombre
                            </p>
                            <p className="text-lg font-medium text-gray-900">
                                {data?.name ?? '-'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                                Descripción
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                {data?.description || 'Sin descripción disponible'}
                            </p>
                        </div>

                    </div>
                )}

            </div>
        </Modal>
    );
}

export default BrandInfoModal;