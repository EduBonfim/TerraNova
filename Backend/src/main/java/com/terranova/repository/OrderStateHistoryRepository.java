package com.terranova.repository;

import com.terranova.model.OrderStateHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderStateHistoryRepository extends JpaRepository<OrderStateHistory, UUID> {

    List<OrderStateHistory> findByPedidoIdOrderByMudadoEmAsc(UUID pedidoId);

    List<OrderStateHistory> findByMudadoPorOrderByMudadoEmDesc(UUID mudadoPor);

    @Query("SELECT h FROM OrderStateHistory h WHERE h.mudadoEm BETWEEN :inicio AND :fim ORDER BY h.mudadoEm DESC")
    List<OrderStateHistory> findByDateRange(@Param("inicio") LocalDateTime dataInicio, 
                                            @Param("fim") LocalDateTime dataFim);

    long countByPedidoId(UUID pedidoId);
}
