import { FC, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader } from "../../../components/loader/SpinnerLogo";
import useFetch from "../../../hooks/useFetch";
import useHandleErrors from "../../../hooks/useHandleErrors";
import { UserService } from "../../../services/user/userService";
import { User } from "../../../type/entities/user-type";
import UserForm from "../UserForm";
import UserEditLayout from "./UserEditLayout";

const UserEdit: FC = () => {

    // HOOKS

    const { id = "" } = useParams<{ id: string }>();
    const { handleErrors } = useHandleErrors();
    const navigate = useNavigate();
    const service = new UserService();

    // STATES

    const [isLoading, setIsLoading] = useState<boolean>(false);

    // FUNCTIONS

    //-----------------------------------------------------------------------------------------------
    /**
     * @ES OBTIENE UN USUARIO POR ID
     * @EN GETS A USER BY ID
     */
    //-----------------------------------------------------------------------------------------------
    const [data, loading] = useFetch(useCallback(async () => {
        const response = await (await service.getUserById(id as string)).getResponseData();
        if (!response.data) toast.error(response.message || "Error al cargar el usuario");
        return response as User;
    }, [id]));
    //-----------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------
    /**
     * @ES MUESTRA UN USUARIO EN EL FORMULARIO
     * @EN SHOWS A USER IN THE FORM
     */
    //-----------------------------------------------------------------------------------------------
    const handleSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            if (values.password !== "" && values.passwordConfirm !== "") {
                const result = await service.changePassword(id, values.password, values.passwordConfirm);

                if (result.getResponseData().success) {
                    toast.success("Contraseña cambiada correctamente");
                } else {
                    toast.error("Error al cambiar la contraseña");
                }
            }

            const response = (await service.editUser(values)).getResponseData();

            if (response.success) {
                navigate(-1);
                toast.success("Usuario editado correctamente");
                if (data?.commercialNetwork?.id !== values.commercialNetworkId) {
                    toast.info("Para que el cambio de red comercial tenga efecto, el usuario debe cerrar sesión y volver a iniciarla");
                }
            } else {
                handleErrors(response);
            }
        } catch (error: any) {
            toast.error("Error al editar el usuario");
        } finally {
            setIsLoading(false);
        }
    };
    //-----------------------------------------------------------------------------------------------

    // RENDER

    if (loading) return <Loader />;

    return (
        <UserEditLayout>
            {(data !== null && data !== undefined) && <UserForm data={data} submit={handleSubmit} isLoading={isLoading} profileImg={data.profileImg} />}
        </UserEditLayout>
    );
};

export default UserEdit;