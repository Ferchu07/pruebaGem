import React, { FC, useCallback, useState } from "react";
import { Modal, Button, FileInput } from "rizzui";
import { toast } from "sonner";
import useFetch from "../../../hooks/useFetch";
import { Loader } from "../../../components/loader/SpinnerLogo";
import { BrandService } from "../../../services/brand/brandService";
import { BrandApiResponse } from "../../../type/entities/brand-type";
import BrandForm from "../BrandForm";
import AsyncImg from "../../../components/extras/AsyncImg";
import PlaceholderImage from "../../../components/extras/PlaceholderImage";
import DeletePopover from "../../../components/buttons/DeletePopover";
import { ReactComponent as CloseIcon } from '../../../assets/Iconos/Interfaz/close_02.svg';

interface BrandEditModalProps {
    brandId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

const BrandEditModal: FC<BrandEditModalProps> = ({
    brandId,
    isOpen,
    onClose,
    onUpdated
}) => {

    // STATES

    const [submitting, setSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);

    // HOOKS 

    const service = new BrandService();

    // FUNCTIONS

    // --------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE UNA MARCA POR SU ID
     * @EN GETS A BRAND BY ITS ID
     */
    // --------------------------------------------------------------------------------------
    const [data, loading, , refetch] = useFetch(useCallback(async () => {
        if (!brandId) return null;
        const response = await service.getBrandById(brandId);
        return response.getResponseData() as BrandApiResponse;
    }, [brandId]));
    // --------------------------------------------------------------------------------------       

    // --------------------------------------------------------------------------------------
    /**
     * @ES SUBE UNA NUEVA IMAGEN PARA LA MARCA
     * @EN UPLOADS A NEW IMAGE FOR THE BRAND
     */
    // --------------------------------------------------------------------------------------
    const handleImageUpload = async (event: React.ChangeEvent<any>) => {
        const file = event.target.files[0];
        if (!file || !brandId) return;

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            const response = await service.editBrandImg(brandId, file);
            const responseData = response.getResponseData();

            if (responseData.success) {
                toast.success("Imagen actualizada correctamente");
                refetch(); // refresca datos sin recargar
            } else {
                toast.error(responseData.message);
                setSelectedImage(null);
            }
        } catch (error: any) {
            toast.error("Formato de imagen incorrecto");
            setSelectedImage(null);
        }
    };
    // --------------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------------
    /**
     * @ES ELIMINA LA IMAGEN ASOCIADA A LA MARCA
     * @EN DELETES THE IMAGE ASSOCIATED WITH THE BRAND
     */
    // --------------------------------------------------------------------------------------
    const deleteImage = async () => {
        if (!brandId) return;

        try {
            const response = await service.deleteBrandImg(brandId);
            const responseData = response.getResponseData();

            if (responseData.success) {
                toast.success("Imagen eliminada correctamente");
                setSelectedImage(null);
                refetch();
            }
        } catch (error: any) {
            toast.error("Error al eliminar la imagen");
        }
    };
    // --------------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------------
    /**
     * @ES EDITA LOS DATOS DE UNA MARCA
     * @EN EDITS THE DATA OF A BRAND
     */
    // --------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setSubmitting(true);

        try {
            const response = await service.editBrand(values);
            const responseData = response.getResponseData();

            if (responseData.success) {
                toast.success("Marca editada correctamente");
                onClose();
                onUpdated?.();
            } else {
                responseData?.data?.errors?.forEach((error: any) => {
                    toast.error(error.message);
                });
            }
        } catch (error: any) {
            toast.error("Error al editar la marca");
        } finally {
            setSubmitting(false);
        }
    };
    // --------------------------------------------------------------------------------------

    // RENDER

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            size="xl" 
            containerClassName="border-2 border-black"
        >
            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                            Editar marca
                        </h4>
                        <p className="text-sm text-gray-500">
                            Modifique los datos necesarios
                        </p>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        className="border-none"
                        onClick={onClose}
                    >
                        <CloseIcon className="h-8 w-8" />
                    </Button>
                </div>

                {loading ? (
                    <div className="py-10 flex justify-center">
                        <Loader />
                    </div>
                ) : (
                    data && (
                        <div className="grid md:grid-cols-12 gap-8">

                            {/* IMAGEN */}
                            <div className="md:col-span-12 mr-4">
                                {selectedImage ? (
                                    <img
                                        src={selectedImage}
                                        alt="selected"
                                        className="mx-auto rounded object-cover w-[220px] h-[220px]"
                                    />
                                ) : data?.brandImg ? (
                                    <AsyncImg
                                        id={data.brandImg.id}
                                        isBackground
                                        className="mx-auto rounded w-[220px] h-[220px] object-cover"
                                    />
                                ) : (
                                    <PlaceholderImage
                                        width={200}
                                        height={200}
                                        className="mx-auto rounded"
                                    />
                                )}

                                <div className="flex justify-center items-center mt-4">
                                    <FileInput
                                        onChange={handleImageUpload}
                                        placeholder="Cambiar imagen"
                                        className="me-3 "
                                    />

                                    <DeletePopover
                                        title="Eliminar imagen"
                                        description="¿Estás seguro de que deseas eliminar la imagen?"
                                        onDelete={deleteImage}
                                        size={32}
                                        className={!data?.brandImg?.id ? "hidden" : ""}
                                    />
                                </div>
                            
                                <BrandForm
                                    data={data}
                                    submit={handleSubmit}
                                    isLoading={submitting}
                                />
                            </div>

                        </div>
                    )
                )}
            </div>
        </Modal>
    );
};

export default BrandEditModal;
