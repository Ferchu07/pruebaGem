import React, { useCallback } from 'react';
import { ReactComponent as UserIcon } from '../../../../../assets/Iconos/Interfaz/admin.svg';
import { useParams } from 'react-router-dom';
import { Input } from 'rizzui';
import AsyncImg from '../../../../../components/extras/AsyncImg';
import PlaceholderImage from '../../../../../components/extras/PlaceholderImage';
import CustomSelect from '../../../../../components/forms/CustomSelect';
import useFetch from '../../../../../hooks/useFetch';
import FormGroup from '../../../../../layout/shared/form-group';
import { UserService } from '../../../../../services/user/userService';
import { UserApiResponse } from '../../../../../type/entities/user-type';
import UserProfileLayout from '../../UserProfileLayout';
import { usePrivilege } from '../../../../../components/priviledge/PriviledgeProvider';

interface UserInfoProps { }

const UserInfo: React.FC<UserInfoProps> = () => {

    // HOOKS

    const { id = '' } = useParams<{ id: string }>();
    const { userCan } = usePrivilege();
    const service = new UserService();

    // FUNCTIONS 

    // -----------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS DATOS DE UN USUARIO POR ID
     * @EN GETS USER DATA BY ID
     * 
     * @param id 
     */
    // -----------------------------------------------------------------------------------
    const [data] = useFetch(useCallback(async () => {
        if (!id || id === '') return null;
        const response = await service.getUserById(id);
        return response.getResponseData() as UserApiResponse;
    }, [id]));
    // -----------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------
    /**
     * @ES OBTIENE LOS VALORES DE LOS ROLES DEL USUARIO
     * @EN GETS USER ROLES VALUES
     * 
     * @returns 
     */
    // -----------------------------------------------------------------------------------
    function getUserRolesValues() {
        return data?.userRoles.map((roleWrapper: any) => (
            { 
                value: roleWrapper.role?.id, 
                label: roleWrapper.role?.name + (userCan('list_companies', 'companies') ? '(' + roleWrapper.company?.name  + ')' : '')
            }
        ));
    };
    // -----------------------------------------------------------------------------------

    // RENDER

    return (
        <UserProfileLayout>
            <div className="@container">
                <div className="grid divide-y-2 divide-dashed divide-gray-200 gap-6">
                    <FormGroup
                        title="Datos Personales"
                        description='Información personal del usuario'
                        className='pt-3 pb-4'
                        titleCols="@md:col-span-2"
                        childCols="@md:col-span-10 md:grid-cols-4"
                    >
                        <div className='md:col-span-3 md:grid md:grid-cols-12 gap-4'>
                            <Input
                                disabled
                                label="Nombre"
                                placeholder="First Name"
                                value={data?.name ?? ''}
                                className="md:col-span-3"
                                inputClassName='!bg-[#a1b8f7]'
                            />

                            <Input
                                disabled
                                label="Apellidos"
                                placeholder="Last Name"
                                value={data?.lastName ?? ''}
                                className="md:col-span-4"
                                inputClassName='!bg-[#a1b8f7]'
                            />

                            <Input
                                disabled
                                prefix={<UserIcon className="h-6 w-6 text-gray-500" />}
                                type="email"
                                label="Correo Electrónico"
                                placeholder="georgia.young@rother.com"
                                value={data?.email ?? ''}
                                className="md:col-span-5"
                                inputClassName='!bg-[#a1b8f7]'
                            />

                            <CustomSelect
                                isMulti
                                isDisabled
                                id={'roleId'}
                                label="Rol del usuario"
                                value={getUserRolesValues()}
                                containerClassName="md:col-span-12"
                                customStyles={{
                                    control: (base: any) => {
                                        return {
                                            ...base,
                                            backgroundColor: '#a1b8f7',
                                            borderColor: 'white',
                                        };
                                    },
                                    singleValue: (base: any) => ({
                                        ...base,
                                        color: 'black', // Text color
                                    })
                                }}
                            />
                        </div>

                        {data?.profileImg?.id
                            ? <AsyncImg id={data?.profileImg?.id} isBackground className="mx-auto d-block img-fluid rounded w-[220px] h-[220px] object-cover" />
                            : <PlaceholderImage width={200} height={200} className='mx-auto d-block img-fluid rounded !bg-[#a1b8f7]' />
                        }
                    </FormGroup>
                </div>
            </div>
        </UserProfileLayout>
    );
};

export default UserInfo;