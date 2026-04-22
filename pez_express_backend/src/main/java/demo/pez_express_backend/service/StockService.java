package demo.pez_express_backend.service;

import demo.pez_express_backend.dto.DetallePedidoCrearDTO;
import demo.pez_express_backend.entity.Producto;

import java.util.List;

public interface StockService {

    void validarStockPedido(List<DetallePedidoCrearDTO> detalles);
    void descontarStockPedido(List<DetallePedidoCrearDTO> detalles);


    // METODOS PARA PODER ACTUALIZAR:
    void descontarStockProducto(Producto producto, int cantidad);
    void devolverStockProducto(Producto producto, int cantidad);


    // ── NUEVO: versión batch que valida y descuenta en 2 queries totales ──
    void descontarStockPedidoBatch(List<DetallePedidoCrearDTO> detalles);
}
