import { useSetAtom } from 'jotai';
import Page from '../../layout/Page/Page';
import GeolocationMap from './GeolocationMap';
import './GeolocationPage.css';
import { headerConfigAtom } from '../../atoms/headerAtoms';
import { useContext, useEffect } from 'react';
import { PrivilegeContext } from '../../components/priviledge/PriviledgeProvider';
import { ReactComponent as LocationIcon } from '../../assets/Iconos/Interfaz/geolocalizacion.svg';

const GeolocationPage = () => {

        // HOOKS
    
        const { userCan } = useContext(PrivilegeContext);
    
        // ATOMS
                
        const setHeaderConfig = useSetAtom(headerConfigAtom);
    
        // USE EFFECT
    
        useEffect(() => {
    
            // CONFIGURE HEADER TITLE AND ICON
    
            setHeaderConfig({
                title: "GEOLOCALIZACIÓN",
                icon: <LocationIcon className="app-sub-icon" />,
                breadcrumbs: [
                    { 
                        label: 'Inicio', 
                        path: '/' 
                    },
                    {
                        label: "Geolocalización",
                        path: "/geolocation",
                        active: true
                    }
                ]
            });
    
            // CLEANUP EFFECT
    
            return () => {
                setHeaderConfig(null);
            };

    }, [userCan, setHeaderConfig]);
        
    // RENDER 

    return (
        <Page className='mt-0'>
            <div className="geolocation-page-container">
                <GeolocationMap />
            </div>
        </Page>
    );
};

export default GeolocationPage;
