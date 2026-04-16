import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FormCard from "../../../components/card/FormCard";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { UserService } from "../../../services/user/userService";
import UserForm from "../UserForm";
import { useSetAtom } from "jotai";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as NewUserIcon } from '../../../assets/Iconos/Interfaz/nuevo_usuario.svg';

const UserCreate: FC = () => {

    // HOOKS

    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new UserService();

    // STATES

    const [loading, setLoading] = useState<boolean>(false);

    // ATOMS
            
    const setHeaderConfig = useSetAtom(headerConfigAtom);

    // FUNCTIONS

    // --------------------------------------------------------------------------------------
    /**
     * @ES MANEJA EL ENVIO DEL FORMULARIO DE CREACIÓN DE USUARIO.
     * @EN HANDLES THE SUBMISSION OF THE USER CREATION FORM.
     * 
     * @param values
     */
    // --------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const response = (await service.createUser(values)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Usuario creado correctamente");
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al crear el usuario");
        } finally {
            setLoading(false);
        }
    };
    // --------------------------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "CREAR USUARIO",
            icon: <NewUserIcon className="app-sub-icon w-9 h-9" />,
            breadcrumbs: [
                { 
                    label: 'Inicio', 
                    path: '/' 
                },
                {
                    label: "Control de acceso",
                    path: undefined
                },
                {
                    label: "Usuarios",
                    path: "/users",
                },
                {
                    label: "Crear",
                    path: "/users/create",
                    active: true
                }
            ]
        });

        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
        };

    }, [setHeaderConfig]);

    // RENDER

    return (
        <>
            <FormCard title="Datos Principales" className="mb-4">
                <UserForm submit={handleSubmit} isLoading={loading} />
            </FormCard>
        </>
    );
};

export default UserCreate;