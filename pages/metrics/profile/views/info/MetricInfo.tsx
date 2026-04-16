import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import Button from "../../../../../components/bootstrap/Button";
import { MetricService } from "../../../../../services/metrics/metricService";
import { Metric } from "../../../../../type/entities/metric-type";
import useHandleErrors from "../../../../../hooks/useHandleErrors";
import { Input, Badge, Select } from "rizzui";
import { FaSave } from "react-icons/fa";
import { GroupService } from "../../../../../services/metrics/groupService";
import AsyncImg from "../../../../../components/extras/AsyncImg";

interface MetricInfoProps {
    data: Metric;
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    onUpdate?: () => void;
}

const METADATA_TYPES = [
    { label: 'Measured', value: 'MEASURED' },
    { label: 'Status', value: 'STATUS' }
];

interface MetricFormValues extends Omit<Metric, 'groups' | 'image'> {
    groupId?: string;
    groups?: any;
    image?: any;
}

export default function MetricInfo({ data, isEditing, setIsEditing, onUpdate }: MetricInfoProps) {

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const service = new MetricService();
    const groupService = new GroupService();

    // STATES

    const [groups, setGroups] = useState<{ label: string, value: string }[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(false);

    // FORM

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<MetricFormValues>({
        defaultValues: {
            ...data,
            groupId: data.groups?.id || undefined, // Ensure groupId is populated
            image: data.image
        } as MetricFormValues
    });

    const metadataType = watch("metadataType");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // FUNCTIONS

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            //@ts-ignore
            setValue("profileImg", file);
        }
    };

    // -----------------------------------------------------------------------------------
    /**
     * @ES CARGA LA LISTA DE GRUPOS PARA EL SELECT
     * @EN LOADS THE GROUP LIST FOR THE SELECT
     */
    // -----------------------------------------------------------------------------------
    const fetchGroups = async () => {
        if (groups.length > 0) return;
        setLoadingGroups(true);
        try {
            const response = await groupService.listGroupsForSelect();
            const responseData = response.getResponseData();
            if (Array.isArray(responseData)) {
                setGroups(responseData.map((g: any) => ({ label: g.name, value: g.id })));
            }
        } catch (error) {
            console.error("Error loading groups", error);
        } finally {
            setLoadingGroups(false);
        }
    };

    // -----------------------------------------------------------------------------------
    /**
     * @ES ACTUALIZA LA INFORMACION DE LA METRICA
     * @EN UPDATES THE METRIC INFORMATION
     * 
     * @param formData 
     */
    // -----------------------------------------------------------------------------------
    const onSubmit = async (formData: MetricFormValues) => {
        try {
            const dataToSend = new FormData();

            // Explicitly append ID
            dataToSend.append('metricId', data.id);
            dataToSend.append('id', data.id);

            // Append other fields
            Object.keys(formData).forEach(key => {
                const val = (formData as any)[key];
                
                if (key === 'profileImg') {
                    if (val instanceof File) {
                        dataToSend.append('profileImg', val);
                    }
                } else if (key !== 'groups' && key !== 'metricOptions' && val !== null && val !== undefined) {
                     dataToSend.append(key, val as string);
                }
            });

            const response = await (await service.editMetric(dataToSend as any)).getResponseData();

            if (response) {
                toast.success('Información actualizada correctamente');
                setIsEditing(false);
                if (onUpdate) onUpdate();
            } else {
                handleErrors(response);
            }
        } catch (error) {
            handleErrors(error);
        }
    };

    // EFFECTS

    useEffect(() => {
        // Reset previewUrl if data changes, rely on AsyncImg for server images
        setPreviewUrl(null);
        
        if (isEditing) {
            fetchGroups();
        }
    }, [isEditing, data.profileImg]);

    // RENDER

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                
                {/* HEADER SECTION */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Información General</h3>
                        <p className="text-sm text-gray-500">Detalles principales de la métrica</p>
                    </div>
                    <Badge 
                        variant="flat" 
                        className={metadataType === 'STATUS' 
                            ? 'bg-purple-50 text-purple-700' 
                            : 'bg-teal-50 text-teal-700'
                        }
                    >
                        {metadataType || 'N/A'}
                    </Badge>
                </div>

                {/* IMAGE UPLOAD SECTION */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Imagen de Perfil</label>
                    <div className="flex items-center gap-4">
                        {previewUrl ? (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                <img src={previewUrl} alt="Metric Profile" className="w-full h-full object-contain bg-gray-50" />
                            </div>
                        ) : data.image?.id ? (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                <AsyncImg id={data.image.id} className="w-full h-full object-contain bg-gray-50" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
                                <span className="text-xs">Sin imagen</span>
                            </div>
                        )}
                        
                        {isEditing && (
                            <div className="flex-1">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="mt-1 text-xs text-gray-500">Formatos permitidos: JPG, PNG, GIF. Máx 5MB.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* GENERAL FIELDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Input
                        label="Nombre"
                        placeholder="Nombre de la métrica"
                        {...register("name", { required: "Este campo es requerido" })}
                        error={errors.name?.message}
                        disabled={!isEditing}
                        className="[&>label>span]:font-medium"
                        inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                    />
                    
                    <Input
                        label="Nombre Orion"
                        placeholder="Identificador en Orion"
                        {...register("orionName", { required: "Este campo es requerido" })}
                        error={errors.orionName?.message}
                        disabled={!isEditing}
                        className="[&>label>span]:font-medium"
                        inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                    />

                    <Controller
                        name="groupId"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Select
                                label="Grupo"
                                options={groups}
                                value={groups.find(g => g.value === value)}
                                onChange={(option: any) => onChange(option?.value)}
                                disabled={!isEditing || loadingGroups}
                                placeholder={loadingGroups ? "Cargando grupos..." : "Selecciona un grupo"}
                                className="[&>label>span]:font-medium"
                                selectClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                                // If not editing and groups not loaded, show simple input or text
                                displayValue={(val: any) => groups.find(g => g.value === val?.value)?.label || data.groups?.name || val?.label}
                            />
                        )}
                    />

                    <Controller
                        name="metadataType"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Select
                                label="Tipo de Metadato"
                                options={METADATA_TYPES}
                                value={METADATA_TYPES.find(t => t.value === value)}
                                onChange={(option: any) => onChange(option?.value)}
                                disabled={!isEditing}
                                className="[&>label>span]:font-medium"
                                selectClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                            />
                        )}
                    />

                    <Input
                        label="Tipo de Dato"
                        placeholder="Ej: Number, String"
                        {...register("type", { required: "Este campo es requerido" })}
                        error={errors.type?.message}
                        disabled={!isEditing}
                        className="[&>label>span]:font-medium"
                        inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                    />

                    <Input
                        label="Valor Actual (Referencia)"
                        placeholder="Valor"
                        {...register("value")}
                        disabled={!isEditing}
                        className="[&>label>span]:font-medium"
                        inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                    />
                </div>

                {/* MEASURED CONFIGURATION */}
                {metadataType === 'MEASURED' && (
                    <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Configuración de Medición</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <Input
                                label="Unidad"
                                placeholder="Ej: °C, kg, m"
                                {...register("metadataUnit")}
                                disabled={!isEditing}
                                className="[&>label>span]:font-medium"
                                inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                            />
                            <Input
                                type="number"
                                label="Escala"
                                {...register("scale")}
                                disabled={!isEditing}
                                className="[&>label>span]:font-medium"
                                inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                            />
                            <Input
                                type="number"
                                label="Offset"
                                {...register("offset")}
                                disabled={!isEditing}
                                className="[&>label>span]:font-medium"
                                inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                            />
                            <Input
                                type="number"
                                label="Rango Desde"
                                {...register("from")}
                                disabled={!isEditing}
                                className="[&>label>span]:font-medium"
                                inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                            />
                            <Input
                                type="number"
                                label="Rango Hasta"
                                {...register("to")}
                                disabled={!isEditing}
                                className="[&>label>span]:font-medium"
                                inputClassName={!isEditing ? '!bg-[#a1b8f7]' : ''}
                            />
                        </div>
                    </div>
                )}

                {/* STATUS CONFIGURATION */}
                {metadataType === 'STATUS' && (
                    <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Opciones de Estado</h4>
                        
                        {data.metricOptions && data.metricOptions.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {data.metricOptions.map((option, index) => (
                                    <div key={index} className="flex items-center p-3 border rounded-lg bg-gray-50">
                                        {option.image && (
                                            <div className="mr-3 h-10 w-10 relative rounded overflow-hidden bg-white border">
                                                <AsyncImg 
                                                    id={option.image.id}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">{option.label}</p>
                                            <p className="text-xs text-gray-500">Valor: {option.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 rounded border border-dashed text-gray-500 text-sm">
                                No hay opciones configuradas.
                            </div>
                        )}
                        
                        {isEditing && (
                             <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded text-sm">
                                Para editar las opciones avanzadas (imágenes, nuevos estados), por favor utiliza el editor completo de métricas.
                             </div>
                        )}
                    </div>
                )}

                {/* ACTION BUTTONS */}
                {isEditing && (
                    <div className="flex justify-end pt-4 border-t mt-6">
                        <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
                            <FaSave className="mr-2" />
                            Guardar Cambios
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}
