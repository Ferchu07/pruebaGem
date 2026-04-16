export const translations: any = {
    id: 'ID',
    name: 'Nombre',
    originalName: 'Nombre',
    lastName: 'Apellidos',
    user: 'Usuario',
    email: 'Email',
    address: 'Dirección',
    cif: 'CIF',
    userRoles: 'Rol',
    logo: 'Logo',
    profileImg: 'Imagen de perfil',
    image: 'Imagen',
    isActive: 'Activo',
    active: 'Activo',
    createdAt: 'Creación',
    date: 'Fecha',
    totalAmount: 'Precio',
    updatedAt: 'Actualización',
    lastLogin: 'Último acceso',
    lastLoginAt: 'Último acceso',
    documentType: 'Tipo de documento',
    status: 'Estado',
    company: 'Organización',
    description: 'Descripción',
    orionName: 'Nombre Orion',
    telephone: 'Teléfono',
    telephoneSecondary: 'Tfno. secundario',
    comments: 'Comentarios',
    documents: 'Documentos',
    postalCode: 'Código postal',
    province: 'Provincia',
    town: 'Localidad',
    gender: 'Género',
    birthDate: 'F. Nacimiento',
    vehicle: 'Vehículo',
    chassisNumber: 'Nº Bastidor',
    category: 'Categoría',
    subcategory: 'Subcategoría',
    battery: 'Batería',
    signal: 'Señal',
    lastSync: 'Última conexión',
    quantumLeapId: 'ID Quantum Leap',
    orionId: 'ID Orion',
};

export const imageFields = [
    'logo',
    'profileImg',
    'image',
];

export const translateColumnName = (key: any) => {
    // Convierte camelCase a "Camel Case"
    const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();

    // Retorna la traducción si existe, o el nombre formateado
    return translations[key] || formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
};