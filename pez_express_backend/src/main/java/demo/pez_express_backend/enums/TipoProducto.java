package demo.pez_express_backend.enums;

public enum TipoProducto {
    PLATO,
    BEBIDA_ENVASA,
    BEBIDA_PREPARADA,
    GUARNICION,
    EXTRA
}

/*
| Producto           | Tipo             | manejo_stock | Se controla con |
        | ------------------ | ---------------- | ------------ | --------------- |
        | Ceviche            | PLATO            | false        | MenuDiario      |
        | Arroz con mariscos | PLATO            | false        | MenuDiario      |
        | Porción de arroz   | GUARNICION       | false        | MenuDiario      |
        | Gaseosa            | BEBIDA_ENVASADA  | true         | StockProducto   |
        | Agua               | BEBIDA_ENVASADA  | true         | StockProducto   |
        | Chicha (jarra)     | BEBIDA_PREPARADA | false        | MenuDiario      |
        | Frozen             | BEBIDA_PREPARADA | false        | MenuDiario      |

 */