import React from "react";
import { Title } from "rizzui";

type ErrorMessagePageProps = {}

const ErrorPage: React.FC<ErrorMessagePageProps> = ({ }) => {
    return (
        <div className="flex grow items-center px-6 xl:px-10 h-[80vh]">
            <div className="mx-auto text-center">
                <div className="relative mx-auto max-w-[370px]">
                </div>
                <Title as="h1" className="text-2xl font-bold leading-normal text-gray-1000 lg:text-3xl">
                    Acceso denegado
                </Title>
                <p className="mt-3 text-sm leading-loose text-gray-500 lg:mt-6 lg:text-base lg:leading-loose">
                    No tienes permiso para acceder a esta página.
                    <br className="hidden xs:inline-block" />
                    Si crees que esto es un error, por favor contacta a soporte.
                </p>
            </div>
        </div>
    );
};

export default ErrorPage;