import { Outlet } from "react-router-dom";

const DevicesWrapper = () => {

    // RENDER

    return (
        <div className="flex flex-grow flex-col px-4 pb-4 md:px-5 lg:px-6 lg:pb-8 3xl:px-8  3xl:pt-4 4xl:px-10">
            <Outlet />
        </div>
    )
}

export default DevicesWrapper;
