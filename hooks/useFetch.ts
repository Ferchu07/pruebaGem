import { useState, useEffect } from 'react';
import { ApiResponse } from '../type/apiResponse-type';

const useFetch = (fetchFunction: () => Promise<any>) => {

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null);
    const [refetch, setRefetch] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetchFunction() as ApiResponse;
                if (response.success && response.data) {
                    setData(response.data);
                } else {
                    setData(null);
                    setError(new Error(response.message as string));
                }
                setError(null);
            } catch (error: any) {
                setData(null);
                setError(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [fetchFunction, refetch]);

    const refetchData = () => {
        setRefetch(prevRefetch => {
            return prevRefetch + 1;
        });
    };

    return [data, loading, error, refetchData];
}

export default useFetch;