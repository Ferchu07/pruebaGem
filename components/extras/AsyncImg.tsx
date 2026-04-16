import { AxiosResponse } from 'axios';
import { FC, useEffect, useRef, useState } from 'react';
import { Avatar } from 'rizzui';
import ProfileImgHolder from '../../assets/images/Profile.png';
import { DocumentsService } from '../../services/document/documentsService';
import Spinner from '../bootstrap/Spinner';
import PlaceholderImage from './PlaceholderImage';

interface IAsyncImg {
    id: string | null | undefined,
    isBackground?: boolean,
    isAvatar?: boolean,
    width?: string,
    height?: string,
    className?: string,
    onClick?: () => void,
}

const AsyncImg: FC<IAsyncImg> = ({ id, className = '', isBackground = false, isAvatar = false, onClick, ...props }) => {

    const divRef = useRef<HTMLDivElement | null>(null);

    const [imgSrc, setImgSrc] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async (docId: string) => {
            try {
                setLoading(true);
                const service = new DocumentsService();
                await service.renderDocument(docId);
                const response = service.getResponse() as AxiosResponse;

                if (response && response.status === 200 && response.data) {
                    const contentType = response.headers['content-type'] || response.data.type || 'image/jpeg';
                    let file = new Blob([response.data], { type: contentType });
                    let stream = URL.createObjectURL(file);
                    setImgSrc(stream);
                } else {
                    setError(true);
                }
            } catch (error) {
                console.error("Error loading image:", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        id ? fetchData(id) : setError(true);
    }, [id]);

    if (isBackground && divRef.current) {
        divRef.current.style.backgroundImage = `url(${imgSrc})`;
        divRef.current.style.backgroundPosition = 'center';
        divRef.current.style.backgroundSize = 'cover';
        return (
            <div ref={divRef} className={className} style={{ ...props }}></div>
        )
    };

    if (id === null && isAvatar) {
        return (
            <Avatar
                src={ProfileImgHolder}
                name='Studio 128k'
                className='!h-9 w-9 sm:!h-10 sm:!w-10'
            />
        );
    };

    if (loading) return <div className='text-center'><Spinner isSmall /></div>;

    if (error) return <PlaceholderImage className={className} width={props.width} height={props.height} />;

    return <img {...props} className={className} src={imgSrc} alt='img' />;
}

export default AsyncImg;