import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { headerActionAtom, HeaderAction } from "../../../../../atoms/headerAtoms";
import Button from "../../../../../components/bootstrap/Button";
import { GroupService } from "../../../../../services/metrics/groupService";
import { Group } from "../../../../../type/entities/group-type";
import useHandleErrors from "../../../../../hooks/useHandleErrors";
import { Input, Textarea } from "rizzui";
import { FaSave } from "react-icons/fa";
import FormGroup from "../../../../../layout/shared/form-group";

export default function GroupInfo({ data }: { data: Group }) {

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const service = new GroupService();

    // ATOMS

    const headerAction = useAtomValue(headerActionAtom);

    // STATES

    const [isEditing, setIsEditing] = useState(false);

    // FORM

    const { register, handleSubmit, formState: { errors } } = useForm<Group>({
        defaultValues: data
    });

    // FUNCTIONS

    // -----------------------------------------------------------------------------------
    /**
     * @ES ACTUALIZA LA INFORMACION DEL GRUPO
     * @EN UPDATES THE GROUP INFORMATION
     * 
     * @param formData 
     */
    // -----------------------------------------------------------------------------------
    const onSubmit = async (formData: Group) => {
        try {
            const response = await (await service.editGroup({ ...formData, id: data.id })).getResponseData();

            if (response) {
                toast.success('Información actualizada correctamente');
                setIsEditing(false);
            } else {
                handleErrors(response);
            }
        } catch (error) {
            handleErrors(error);
        }
    };
    // -----------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {
        if (Array.isArray(headerAction) && headerAction.length > 0) {
            const editAction = headerAction.find((action: HeaderAction) => {
                // Check if label is a React element and has type with name 'EditarIcon'
                // This is a bit fragile but matches the original intent
                const label: any = action.label;
                return label?.type?.name === 'EditarIcon' || (label?.props?.children?.type?.name === 'EditarIcon');
            });
            if (editAction) {
                setIsEditing(true);
            }
        }
    }, [headerAction]);

    // RENDER

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormGroup
                title="Información General"
                description='Datos principales del grupo'
                className='pt-3 pb-4'
                titleCols="@md:col-span-2"
                childCols="@md:col-span-10"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        label={<span>Nombre <span className="text-red-500">*</span></span>}
                        placeholder="Nombre del grupo"
                        {...register("name", { required: "Este campo es requerido" })}
                        error={errors.name?.message}
                        disabled={!isEditing}
                        inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                    />
                    
                    <Input
                        label={<span>Nombre de Orion <span className="text-red-500">*</span></span>}
                        placeholder="Identificador Orion"
                        {...register("orionId")}
                        disabled={!isEditing}
                        inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                    />

                    <Input
                        label={<span>ID de Orion <span className="text-red-500">*</span></span>}
                        placeholder="ID"
                        {...register("orionId")} // Replace with correct field if available
                        disabled={!isEditing}
                        inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                    />

                    <Input
                        label={<span>ECU <span className="text-red-500">*</span></span>}
                        placeholder="ECU"
                        value={data?.ecu?.name ?? ''} // Assuming ECU info might be linked
                        disabled={true}
                        inputClassName='!bg-[#a1b8f7]'
                    />

                    <div className="md:col-span-4">
                        <Textarea
                            label="Descripción del grupo"
                            placeholder="Descripción del grupo"
                            {...register("description")}
                            disabled={!isEditing}
                            textareaClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                        />
                    </div>
                </div>

                {isEditing && (
                    <div className="flex justify-end pt-4 mt-6">
                        <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
                            <FaSave className="mr-2" />
                            Guardar Cambios
                        </Button>
                    </div>
                )}
            </FormGroup>
        </form>
    );
}
