package com.terranova.controller;

import com.terranova.dto.ProducerKpiDTO;
import com.terranova.enums.StatusPedido;
import com.terranova.enums.StatusProduto;
import com.terranova.model.Avaliacao;
import com.terranova.model.Pedido;
import com.terranova.model.Usuario;
import com.terranova.repository.AvaliacaoRepository;
import com.terranova.repository.PedidoRepository;
import com.terranova.repository.ProdutoRepository;
import com.terranova.repository.SeguidorRepository;
import com.terranova.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/producers")
@Tag(name = "Producer Metrics", description = "KPIs reais dos produtores")
public class ProducerMetricsController {

    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final PedidoRepository pedidoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final SeguidorRepository seguidorRepository;

    public ProducerMetricsController(
            UsuarioRepository usuarioRepository,
            ProdutoRepository produtoRepository,
            PedidoRepository pedidoRepository,
            AvaliacaoRepository avaliacaoRepository,
            SeguidorRepository seguidorRepository) {
        this.usuarioRepository = usuarioRepository;
        this.produtoRepository = produtoRepository;
        this.pedidoRepository = pedidoRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.seguidorRepository = seguidorRepository;
    }

    @GetMapping("/{username}/kpis")
    @Operation(summary = "Buscar KPIs reais de um produtor")
    public ResponseEntity<ProducerKpiDTO> getProducerKpis(@PathVariable String username) {
        return usuarioRepository.findByUsernameIgnoreCase(username)
                .filter(usuario -> usuario.getDeletedAt() == null)
                .filter(usuario -> "producer".equalsIgnoreCase(usuario.getRole()))
                .map(this::buildKpis)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private ProducerKpiDTO buildKpis(Usuario producer) {
        int totalAds = produtoRepository.findByVendedorIdAndStatus(producer.getId(), StatusProduto.ATIVO).size();
        BigDecimal monthlySales = calculateMonthlySales(producer);
        BigDecimal averageRating = calculateAverageRating(producer);
        long followers = seguidorRepository.countByProducerId(producer.getId());

        return new ProducerKpiDTO(totalAds, averageRating, monthlySales, followers);
    }

    private BigDecimal calculateMonthlySales(Usuario producer) {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();
        List<Pedido> orders = pedidoRepository.findByVendedorId(producer.getId());

        return orders.stream()
                .filter(order -> order.getDataPedido() != null && !order.getDataPedido().isBefore(startOfMonth))
                .filter(order -> order.getStatus() == StatusPedido.aguardando
                        || order.getStatus() == StatusPedido.transporte
                        || order.getStatus() == StatusPedido.finalizado)
                .map(Pedido::getValorTotal)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateAverageRating(Usuario producer) {
        List<Avaliacao> reviews = avaliacaoRepository.findByAvaliadoId(producer.getId());
        if (reviews.isEmpty()) {
            return BigDecimal.ZERO;
        }

        double average = reviews.stream()
                .map(Avaliacao::getNota)
                .filter(nota -> nota != null)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0);

        return BigDecimal.valueOf(average).setScale(1, RoundingMode.HALF_UP);
    }
}
