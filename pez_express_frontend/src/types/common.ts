/** Estado genérico para entidades del sistema */
export type Estado = "ACTIVO" | "INACTIVO";

/** Unidades de medida para insumos */
export type UnidadMedida = "UNIDAD" | "KG" | "LITRO" | "PORCION";


/** Tipos de producto para la carta */
//export type TipoProducto = "PLATO" | "BEBIDA" | "ENTRADA" | "POSTRE" | "OTRO";
export type TipoProducto = "PLATO" | "BEBIDA_ENVASA" | "BEBIDA_PREPARADA" | "GUARNICION" | "EXTRA";
