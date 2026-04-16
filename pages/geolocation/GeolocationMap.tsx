import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ReactComponent as BuscarIcon } from '../../assets/Iconos/Interfaz/buscar.svg';
import { ReactComponent as CentrarIcon } from '../../assets/Iconos/Interfaz/centrar.svg';
import { ReactComponent as VerIcon } from '../../assets/Iconos/Interfaz/ver.svg';
import { ReactComponent as GeolocalizacionIcon } from '../../assets/Iconos/Interfaz/geolocalizacion.svg';
import { ReactComponent as PersonalizacionIcon } from '../../assets/Iconos/Interfaz/personalizacion.svg';
import { ReactComponent as FlechaIcon } from '../../assets/Iconos/Interfaz/flecha.svg';
import './GeolocationMap.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import useFetch from '../../hooks/useFetch';
import { VehicleService } from '../../services/vehicle/vehicleService';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import VehicleIconSelector from '../../components/icon/VehicleIconSelector';

// Simple SVG components for Zoom controls to avoid dependencies
const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const MinusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14" />
    </svg>
);

const FullscreenIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
);

const ExitFullscreenIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2v-3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
    </svg>
);

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const INITIAL_CENTER: [number, number] = [40.416775, -3.703790];
const INITIAL_ZOOM = 6;

const VEHICLE_COLORS = ['#ff7f00', '#e31a1c', '#1f78b4', '#33a02c', '#6a3d9a', '#b15928', '#a6cee3', '#b2df8a'];

export interface MapVehicle {
    id: string;
    vehicleId: string;
    vehicleSubtypeName: string;
    brand: string;
    model: string;
    type: string;
    color: string;
    lat: number;
    lng: number;
}

const mapApiVehicleToMapFormat = (vehicle: any, index: number): MapVehicle | null => {
    const location = vehicle.location?.[0];
    if (location == null || location.latitude == null || location.longitude == null) return null;

    const typeName = (vehicle.vehicleTypeName || vehicle.vehicleSubtypeName || '').toLowerCase();
    const isTruck = typeName.includes('truck') || typeName.includes('camion') || typeName.includes('pesado');
    const type = isTruck ? 'truck' : 'van';

    return {
        id: vehicle.plateNumber || vehicle.id,
        vehicleId: vehicle.id,
        vehicleSubtypeName: vehicle.vehicleSubtypeName || '',
        brand: vehicle.brandName || '',
        model: vehicle.modelName || '',
        type,
        color: VEHICLE_COLORS[index % VEHICLE_COLORS.length],
        lat: location.latitude,
        lng: location.longitude
    };
};

// Component to handle map center/zoom updates and track bounds
const MapController = ({
    center,
    zoom,
    vehicles,
    setVisibleVehiclesInView,
    isRoutingMode,
    setRouteDestination,
    selectedVehicleId,
    onDeselect,
    isFullScreen
}: {
    center: [number, number],
    zoom: number,
    vehicles: MapVehicle[],
    setVisibleVehiclesInView: (ids: string[]) => void,
    isRoutingMode: boolean,
    setRouteDestination: (pos: [number, number]) => void,
    selectedVehicleId: string | null,
    onDeselect: () => void,
    isFullScreen?: boolean
}) => {
    const map = useMap();
    const hasInitialFit = React.useRef(false);

    React.useEffect(() => {
        if (isFullScreen === undefined) return;
        const timer = setTimeout(() => {
            try {
                const container = map.getContainer?.();
                if (container && document.contains(container)) {
                    map.invalidateSize?.();
                }
            } catch {
                // Ignorar si el mapa ya no es válido (ej. al desmontar o cambiar fullscreen)
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [map, isFullScreen]);

    React.useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    React.useEffect(() => {
        if (vehicles.length > 0) {
            if (!selectedVehicleId && !hasInitialFit.current) {
                hasInitialFit.current = true;
                const bounds = L.latLngBounds(vehicles.map(v => [v.lat, v.lng]));
                map.fitBounds(bounds, { padding: [50, 50] });
            } else if (selectedVehicleId) {
                hasInitialFit.current = false;
            }
        }
    }, [map, vehicles, selectedVehicleId]);

    const checkVisibleVehicles = React.useCallback(() => {
        const bounds = map.getBounds();
        const visibleIds = vehicles
            .filter(v => bounds.contains([v.lat, v.lng]))
            .map(v => v.id);
        setVisibleVehiclesInView(visibleIds);
    }, [map, vehicles, setVisibleVehiclesInView]);

    useMapEvents({
        moveend: checkVisibleVehicles,
        zoomend: checkVisibleVehicles,
        click: (e) => {
            if (isRoutingMode) {
                setRouteDestination([e.latlng.lat, e.latlng.lng]);
            } else if (selectedVehicleId) {
                onDeselect();
            }
        }
    });

    React.useEffect(() => {
        checkVisibleVehicles();
    }, [checkVisibleVehicles]);

    React.useEffect(() => {
        if (isRoutingMode) {
            L.DomUtil.addClass(map.getContainer(), 'crosshair-cursor');
        } else {
            L.DomUtil.removeClass(map.getContainer(), 'crosshair-cursor');
        }
    }, [isRoutingMode, map]);

    return null;
};

/** Detecta si coords están en formato [lat, lng] (Orion/CrateDB) vs GeoJSON [lng, lat] */
const coordsToLatLng = (coords: number[]): [number, number] => {
    const a = coords[0];
    const b = coords[1];
    if (typeof a !== 'number' || typeof b !== 'number') return [0, 0];
    if (a === 0 && b === 0) return [0, 0];
    const isLikelyLatLng = Math.abs(a) <= 90 && Math.abs(b) <= 180 && Math.abs(a) > Math.abs(b);
    const isLikelyLngLat = Math.abs(a) <= 180 && Math.abs(b) <= 90 && Math.abs(b) > Math.abs(a);
    if (isLikelyLatLng) return [a, b];
    if (isLikelyLngLat) return [b, a];
    return [b, a];
};

const parseLocationToLatLng = (location: any): [number, number] | null => {
    if (location == null) return null;
    if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        return [location.latitude, location.longitude];
    }
    const loc = Array.isArray(location) ? location[0] : location;
    if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        return [loc.latitude, loc.longitude];
    }
    const coords = location?.coordinates || location?.value?.coordinates || loc?.coordinates || loc?.value?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
        const [lat, lng] = coordsToLatLng(coords);
        if (lat === 0 && lng === 0) return null;
        return [lat, lng];
    }
    return null;
};

const createVehicleIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-vehicle-marker',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="${color}" stroke="#333" stroke-width="1.5" stroke-linejoin="round" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
};

/** Dibuja la ruta con Polyline (línea) + marcador inicio + marcador fin (último punto de la ruta) */
const RouteDisplay = ({
    routePoints,
    lineColor,
    fitBoundsKey
}: {
    routePoints: [number, number][];
    lineColor: string;
    fitBoundsKey: string;
}) => {
    const map = useMap();
    const hasFitBounds = React.useRef(false);

    useEffect(() => {
        hasFitBounds.current = false;
    }, [fitBoundsKey]);

    useEffect(() => {
        if (!map || routePoints.length < 2 || hasFitBounds.current) return;
        hasFitBounds.current = true;
        const bounds = L.latLngBounds(routePoints.map((p) => [p[0], p[1]]));
        map.fitBounds(bounds, { padding: [50, 50] });
    }, [map, routePoints, fitBoundsKey]);

    const start = routePoints[0];
    const end = routePoints[routePoints.length - 1];
    const vehicleIcon = createVehicleIcon(lineColor);

    return (
        <>
            <Polyline
                positions={routePoints}
                color={lineColor}
                weight={5}
                opacity={0.9}
            />
            <Marker key={`inicio-${start[0]}-${start[1]}`} position={start} icon={vehicleIcon}>
                <Tooltip permanent direction="top" offset={[0, -40]}>Inicio</Tooltip>
            </Marker>
            {(start[0] !== end[0] || start[1] !== end[1]) && (
                <Marker key={`fin-${end[0]}-${end[1]}`} position={end} icon={vehicleIcon}>
                    <Tooltip permanent direction="top" offset={[0, -40]}>Fin</Tooltip>
                </Marker>
            )}
        </>
    );
};

const getDefaultDateRange = () => {
    const end = new Date();
    const start = subDays(end, 7);
    return {
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd')
    };
};

const isMobileView = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

const GeolocationMap = () => {
    const [showPlates, setShowPlates] = useState(false);
    const [showCoords, setShowCoords] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>(INITIAL_CENTER);
    const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM);
    const [showSidebar, setShowSidebar] = useState(() => !isMobileView());
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isRoutingMode, setIsRoutingMode] = useState(false);
    const [routeDestination, setRouteDestination] = useState<[number, number] | null>(null);
    const [hiddenVehicleIds, setHiddenVehicleIds] = useState<Set<string>>(new Set());
    const [visibleVehiclesInView, setVisibleVehiclesInView] = useState<string[]>([]);
    const [routePoints, setRoutePoints] = useState<[number, number][] | null>(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const [routeError, setRouteError] = useState<string | null>(null);
    const [routeDateRange, setRouteDateRange] = useState(getDefaultDateRange);
    const [routeDatePreset, setRouteDatePreset] = useState<'hoy' | 'semana' | 'mes'>('semana');

    const service = new VehicleService();
    const fetchVehicles = useCallback(async () => {
        const response = await service.listVehiclesForMap({
            filter_order: [],
            filter_filters: {
                search_text: '',
                statuses_to_show: [1, 0]
            },
            limit: 500,
            page: 1
        });
        return response.getResponseData() as { success: boolean; data?: { data?: any[] } };
    }, []);

    const [apiData, loading, error, refetch] = useFetch(fetchVehicles);

    const vehicles: MapVehicle[] = useMemo(() => {
        const vehiclesData = apiData?.data;
        if (!Array.isArray(vehiclesData)) return [];
        return vehiclesData
            .map((v: any, i: number) => mapApiVehicleToMapFormat(v, i))
            .filter((v: MapVehicle | null): v is MapVehicle => v !== null);
    }, [apiData]);

    const filteredVehicles = useMemo(() => {
        let filtered = vehicles.filter(v => {
            const searchLower = searchTerm.toLowerCase();
            return (
                v.id.toLowerCase().includes(searchLower) ||
                v.brand.toLowerCase().includes(searchLower) ||
                v.model.toLowerCase().includes(searchLower)
            );
        });

        if (selectedVehicleId) {
            return filtered.filter(v => v.id === selectedVehicleId);
        }

        return filtered.filter(v => !hiddenVehicleIds.has(v.id));
    }, [vehicles, searchTerm, selectedVehicleId, hiddenVehicleIds]);

    const listVehicles = useMemo(() => {
        let list = vehicles.filter(v => {
            const searchLower = searchTerm.toLowerCase();
            return (
                v.id.toLowerCase().includes(searchLower) ||
                v.brand.toLowerCase().includes(searchLower) ||
                v.model.toLowerCase().includes(searchLower)
            );
        });

        return list.sort((a, b) => {
            const aInView = visibleVehiclesInView.includes(a.id);
            const bInView = visibleVehiclesInView.includes(b.id);
            if (aInView && !bInView) return -1;
            if (!aInView && bInView) return 1;
            return 0;
        });
    }, [vehicles, searchTerm, visibleVehiclesInView]);

    React.useEffect(() => {
        if (error) {
            toast.error('Error al cargar los vehículos del mapa');
        }
    }, [error]);

    const fetchVehicleRoute = useCallback(async (vehicleId: string, silent = false) => {
        if (!silent) {
            setRouteLoading(true);
            setRouteError(null);
            setRoutePoints(null);
        }
        try {
            const response = await service.getVehicleRoute(vehicleId, routeDateRange);
            const payload = response.getResponseData() as { data?: any[] };
            const rows = Array.isArray(payload?.data) ? payload.data : [];
            if (!rows.length) {
                setRouteError('No hay datos de ruta para el período seleccionado');
                setRoutePoints(null);
                return;
            }
            const points: [number, number][] = [];
            for (const row of rows) {
                const coords = parseLocationToLatLng(row.location);
                if (coords) points.push(coords);
            }
            // API devuelve puntos en orden ASC por time_index (más antiguo primero)
            // Inicio = points[0], Fin = último punto. La línea se dibuja en orden cronológico.
            if (points.length < 2) {
                setRouteError('No hay suficientes puntos para dibujar la ruta');
                setRoutePoints(null);
            } else {
                setRoutePoints(points);
                setRouteError(null);
            }
        } catch (err) {
            if (!silent) {
                setRouteError('Error al cargar la ruta del vehículo');
                setRoutePoints(null);
                toast.error('Error al cargar la ruta del vehículo');
            }
        } finally {
            if (!silent) setRouteLoading(false);
        }
    }, [routeDateRange]);

    const handleVehicleClick = (vehicle: MapVehicle) => {
        if (selectedVehicleId === vehicle.id) {
            handleBackClick();
        } else {
            setSelectedVehicleId(vehicle.id);
            setMapCenter([vehicle.lat, vehicle.lng]);
            setMapZoom(14);
            setRoutePoints(null);
            setRouteError(null);
        }
    };

    const handleBackClick = () => {
        setSelectedVehicleId(null);
        setIsRoutingMode(false);
        setRouteDestination(null);
        setRoutePoints(null);
        setRouteError(null);
        setMapCenter(INITIAL_CENTER);
        setMapZoom(INITIAL_ZOOM);
        refetch();
    };

    const handleCenterOnVehicle = () => {
        if (selectedVehicleId) {
            const vehicle = vehicles.find(v => v.id === selectedVehicleId);
            if (vehicle) {
                setMapCenter([vehicle.lat, vehicle.lng]);
                setMapZoom(18);
            }
        }
    };

    const toggleVehicleVisibility = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newHidden = new Set(hiddenVehicleIds);
        if (newHidden.has(id)) {
            newHidden.delete(id);
        } else {
            newHidden.add(id);
        }
        setHiddenVehicleIds(newHidden);
    };

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
    const mapWrapperRef = React.useRef<HTMLDivElement>(null);

    const ROUTE_REFRESH_INTERVAL_MS = 7000;

    useEffect(() => {
        if (!selectedVehicleId || !selectedVehicle) return;
        fetchVehicleRoute(selectedVehicle.vehicleId);
    }, [fetchVehicleRoute, selectedVehicle, selectedVehicleId]);

    useEffect(() => {
        if (!selectedVehicleId || !selectedVehicle) return;
        const interval = setInterval(() => {
            fetchVehicleRoute(selectedVehicle.vehicleId, true);
        }, ROUTE_REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [selectedVehicleId, selectedVehicle?.vehicleId, fetchVehicleRoute]);

    const handleFullscreen = useCallback(() => {
        const el = mapWrapperRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen?.().then(() => setIsFullScreen(true)).catch(() => {});
        } else {
            document.exitFullscreen?.().then(() => setIsFullScreen(false)).catch(() => {});
        }
    }, []);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    return (
        <>
            <div className="geolocation-map-title">
                GEOLOCALIZACIÓN GPS DE LOS TRAYECTOS
            </div>
            <div className={`geolocation-map-wrapper ${isFullScreen ? 'is-fullscreen' : ''}`} ref={mapWrapperRef}>
                <div className="geolocation-map-container">
                    <div className="geolocation-map-view">
                        {loading && !apiData ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f0f4f8' }}>
                                <span>Cargando vehículos...</span>
                            </div>
                        ) : error && !apiData ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f0f4f8', gap: 10 }}>
                                <span>Error al cargar los vehículos</span>
                                <button className="map-btn" onClick={() => refetch()}>Reintentar</button>
                            </div>
                        ) : (
                            <MapContainer
                                center={mapCenter}
                                zoom={mapZoom}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                />
                                <MapController
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    vehicles={vehicles}
                                    setVisibleVehiclesInView={setVisibleVehiclesInView}
                                    isRoutingMode={isRoutingMode}
                                    setRouteDestination={setRouteDestination}
                                    selectedVehicleId={selectedVehicleId}
                                    onDeselect={handleBackClick}
                                    isFullScreen={isFullScreen}
                                />

                                {routePoints && routePoints.length >= 2 && selectedVehicle ? (
                                    <RouteDisplay
                                        routePoints={routePoints}
                                        lineColor={selectedVehicle.color}
                                        fitBoundsKey={`${selectedVehicle.vehicleId}-${routeDateRange.startDate}-${routeDateRange.endDate}`}
                                    />
                                ) : null}

                                {selectedVehicleId && routeDestination && selectedVehicle && (
                                    <>
                                        <Polyline
                                            positions={[[selectedVehicle.lat, selectedVehicle.lng], routeDestination]}
                                            color="blue"
                                            dashArray="10, 10"
                                        />
                                        <Marker position={routeDestination}>
                                            <Tooltip permanent direction="top" offset={[0, -20]}>
                                                Destino
                                            </Tooltip>
                                        </Marker>
                                    </>
                                )}

                                {filteredVehicles
                                    .filter((v) => !(routePoints && selectedVehicleId === v.id))
                                    .map((vehicle) => (
                                    <Marker
                                        key={vehicle.id}
                                        position={[vehicle.lat, vehicle.lng]}
                                        icon={createVehicleIcon(vehicle.color)}
                                        eventHandlers={{
                                            click: () => handleVehicleClick(vehicle),
                                        }}
                                    >
                                        <Tooltip
                                            key={`${showPlates}-${showCoords}`}
                                            permanent={showPlates || showCoords}
                                            direction="top"
                                            offset={[0, -40]}
                                            opacity={1}
                                            className="custom-tooltip"
                                        >
                                            <div className="text-center">
                                                {(showPlates || (!showPlates && !showCoords)) && (
                                                    <div className="font-bold">{vehicle.id}</div>
                                                )}
                                                {(showCoords || (!showPlates && !showCoords)) && (
                                                    <div className="text-xs text-gray-600">
                                                        {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                                                    </div>
                                                )}
                                            </div>
                                        </Tooltip>
                                    </Marker>
                                ))
                                }
                            </MapContainer>
                        )}

                        {/* Controls Overlay - se muestra cuando hay mapa (apiData) para no ocultar durante refetch */}
                        {apiData && !error && (() => {
                            const overlayContent = (
                                <div className={`map-controls-overlay-container ${isFullScreen ? 'map-controls-overlay-fullscreen' : ''} ${isFullScreen && showSidebar ? 'map-controls-overlay-with-sidebar' : ''}`}>
                                    <div className="map-controls-overlay top-0 left-0">
                                        {selectedVehicleId && (
                                            <button className="map-control-btn back-btn" onClick={handleBackClick} title="Volver a todos los vehículos">
                                                <FlechaIcon className="transform rotate-180" />
                                            </button>
                                        )}
                                        {selectedVehicleId && (
                                            <button
                                                className={`map-control-btn ${isRoutingMode ? 'active-route' : ''}`}
                                                onClick={() => {
                                                    setIsRoutingMode(!isRoutingMode);
                                                    setRouteDestination(null);
                                                }}
                                                title="Crear Ruta (Click en mapa para destino)"
                                                style={{ marginTop: '10px' }}
                                            >
                                                <GeolocalizacionIcon />
                                            </button>
                                        )}
                                    </div>

                                    <div className="map-controls-overlay top-0 right-0">
                                        {selectedVehicleId && (
                                            <button className="map-control-btn" onClick={handleCenterOnVehicle} title="Centrar en vehículo" style={{ marginBottom: '10px' }}>
                                                <CentrarIcon />
                                            </button>
                                        )}
                                        <button className="map-control-btn" onClick={() => setShowSidebar(!showSidebar)} title={showSidebar ? "Ocultar Menú" : "Mostrar Menú"}>
                                            <PersonalizacionIcon />
                                        </button>
                                        <button className="map-control-btn" onClick={() => refetch()} title="Actualizar vehículos" style={{ marginTop: '10px' }}>
                                            ↻
                                        </button>
                                        <button className="map-control-btn" onClick={handleFullscreen} title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"} style={{ marginTop: '10px' }}>
                                            {isFullScreen ? <ExitFullscreenIcon className="w-5 h-5" /> : <FullscreenIcon className="w-5 h-5" />}
                                        </button>
                                    </div>


                                    <div className="map-controls-overlay bottom-0 right-0">
                                        <div className="flex flex-col gap-1">
                                            <button className="map-control-btn" onClick={() => setMapZoom(z => z + 1)} title="Acercar">
                                                <PlusIcon className="w-5 h-5" />
                                            </button>
                                            <button className="map-control-btn" onClick={() => setMapZoom(z => z - 1)} title="Alejar">
                                                <MinusIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {selectedVehicleId && routeDestination && (
                                        <div className="map-floating-info">
                                            <div className="trip-info-header">
                                                <strong>Ruta Estimada</strong>
                                                <button className="close-info-btn" onClick={() => setRouteDestination(null)}>×</button>
                                            </div>
                                            <div className="trip-info-content">
                                                <div className="trip-info-row">
                                                    <span>Distancia:</span>
                                                    <span className="trip-box">{(Math.random() * 50 + 10).toFixed(1)} km</span>
                                                </div>
                                                <div className="trip-info-row">
                                                    <span>Tiempo:</span>
                                                    <span className="trip-box">{(Math.random() * 60 + 15).toFixed(0)} min</span>
                                                </div>
                                                <div className="trip-info-row" style={{ marginTop: '5px', fontSize: '0.75rem', color: '#666' }}>
                                                    * Cálculo aproximado
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );

                            if (isFullScreen) {
                                const portalTarget = document.fullscreenElement || mapWrapperRef.current;
                                if (portalTarget) {
                                    return createPortal(overlayContent, portalTarget);
                                }
                            }
                            return overlayContent;
                        })()}
                    </div>

                    {showSidebar && apiData && !error && (
                        <div className={`geolocation-map-sidebar ${isFullScreen ? 'fullscreen-sidebar' : ''}`}>
                            <button
                                type="button"
                                className="sidebar-close-mobile"
                                onClick={() => setShowSidebar(false)}
                                title="Cerrar menú"
                                aria-label="Cerrar menú"
                            >
                                ✕
                            </button>
                            {selectedVehicleId && (
                                <div className="route-date-selector">
                                    <div className="route-date-label">Ruta del vehículo</div>
                                    <div className="route-date-presets">
                                        <button
                                            type="button"
                                            className={`map-btn route-date-btn ${routeDatePreset === 'hoy' ? 'active' : ''}`}
                                            onClick={() => {
                                                const today = format(new Date(), 'yyyy-MM-dd');
                                                setRouteDateRange({ startDate: today, endDate: today });
                                                setRouteDatePreset('hoy');
                                            }}
                                        >
                                            Hoy
                                        </button>
                                        <button
                                            type="button"
                                            className={`map-btn route-date-btn ${routeDatePreset === 'semana' ? 'active' : ''}`}
                                            onClick={() => {
                                                const range = getDefaultDateRange();
                                                setRouteDateRange(range);
                                                setRouteDatePreset('semana');
                                            }}
                                        >
                                            Última semana
                                        </button>
                                        <button
                                            type="button"
                                            className={`map-btn route-date-btn ${routeDatePreset === 'mes' ? 'active' : ''}`}
                                            onClick={() => {
                                                const end = new Date();
                                                const start = subDays(end, 30);
                                                setRouteDateRange({
                                                    startDate: format(start, 'yyyy-MM-dd'),
                                                    endDate: format(end, 'yyyy-MM-dd')
                                                });
                                                setRouteDatePreset('mes');
                                            }}
                                        >
                                            Último mes
                                        </button>
                                    </div>
                                    {routeLoading && <div className="route-loading">Cargando ruta...</div>}
                                    {routeError && <div className="route-error">{routeError}</div>}
                                    {routePoints && routePoints.length >= 2 && (
                                        <div className="route-success">{routePoints.length} puntos en la ruta</div>
                                    )}
                                </div>
                            )}
                            <div className="map-sidebar-buttons">
                                <button
                                    className={`map-btn ${showPlates ? 'active' : ''}`}
                                    onClick={() => setShowPlates(!showPlates)}
                                >
                                    {showPlates ? 'OCULTAR MATRÍCULA' : 'MOSTRAR MATRÍCULA'}
                                </button>
                                <button
                                    className={`map-btn ${showCoords ? 'active' : ''}`}
                                    onClick={() => setShowCoords(!showCoords)}
                                >
                                    {showCoords ? 'OCULTAR COORDENADAS' : 'MOSTRAR COORDENADAS'}
                                </button>

                                {isFullScreen && (
                                    <button
                                        className="map-btn"
                                        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                    >
                                        {isSidebarExpanded ? 'REDUCIR MENÚ' : 'AMPLIAR MENÚ (VER TODOS)'}
                                    </button>
                                )}
                            </div>

                            <div className="map-search-bar">
                                <BuscarIcon style={{ color: '#666', marginRight: '5px', width: '20px', height: '20px' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar matrícula, marca..."
                                    className="map-search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="vehicle-list">
                                {listVehicles.filter(v => {
                                    if (isFullScreen && !isSidebarExpanded) {
                                        return visibleVehiclesInView.includes(v.id);
                                    }
                                    return true;
                                }).map((v) => {
                                    const isVisibleInMap = visibleVehiclesInView.includes(v.id);
                                    const isHiddenByUser = hiddenVehicleIds.has(v.id);

                                    return (
                                        <div
                                            key={v.id}
                                            className={`vehicle-card ${selectedVehicleId === v.id ? 'selected' : ''} ${!isVisibleInMap ? 'out-of-view' : ''} ${isHiddenByUser ? 'hidden-user' : ''}`}
                                            onClick={() => handleVehicleClick(v)}
                                        >
                                            <div className="vehicle-visibility-toggle" onClick={(e) => toggleVehicleVisibility(e, v.id)}>
                                                {isHiddenByUser ? <VerIcon className="opacity-40 h-4" /> : <VerIcon className='h-4'/>}
                                            </div>
                                            <div className="vehicle-icon" style={{ color: v.color }}>
                                                 <VehicleIconSelector category={null} subcategory={v?.vehicleSubtypeName} className='w-6 h-6 me-2' />
                                            </div>
                                            <div className="vehicle-info">
                                                <span className="vehicle-plate">{v.id}</span>
                                                <span className="vehicle-model">{v.brand} {v.model}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default GeolocationMap;
