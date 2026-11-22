package com.terranova.controller;

import com.terranova.dto.AdminKpiDTO;
import com.terranova.dto.TopSellerDTO;
import com.terranova.model.Pedido;
import com.terranova.model.Produto;
import com.terranova.model.Usuario;
import com.terranova.repository.PedidoRepository;
import com.terranova.repository.ProdutoRepository;
import com.terranova.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin", description = "Painel Administrativo")
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final PedidoRepository pedidoRepository;

    public AdminController(UsuarioRepository usuarioRepository, ProdutoRepository produtoRepository, PedidoRepository pedidoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.produtoRepository = produtoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    private boolean isAdmin(Principal principal) {
        if (principal == null) return false;
        return usuarioRepository.findByUsernameIgnoreCase(principal.getName())
                .map(u -> "admin".equalsIgnoreCase(u.getRole()))
                .orElse(false);
    }

    @GetMapping("/kpis")
    @Operation(summary = "Obter KPIs do Dashboard")
    public ResponseEntity<AdminKpiDTO> getKpis(Principal principal) {
        if (!isAdmin(principal)) {
            return ResponseEntity.status(403).build();
        }

        List<Usuario> users = usuarioRepository.findAll();
        List<Produto> products = produtoRepository.findAll();
        List<Pedido> orders = pedidoRepository.findAll();

        AdminKpiDTO dto = new AdminKpiDTO();
        dto.setTotalUsers(users.size());
        dto.setTotalProducers(users.stream().filter(u -> "producer".equalsIgnoreCase(u.getRole())).count());
        dto.setTotalBuyers(users.stream().filter(u -> "buyer".equalsIgnoreCase(u.getRole())).count());
        dto.setTotalProducts(products.size());

        BigDecimal totalSales = orders.stream()
                .map(Pedido::getValorTotal)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalSales(totalSales);

        dto.setProducerSalesTotal(totalSales);
        dto.setBuyerPurchasesTotal(totalSales);

        if (!products.isEmpty()) {
            BigDecimal avgPrice = products.stream()
                    .map(Produto::getPreco)
                    .filter(v -> v != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(products.size()), 2, RoundingMode.HALF_UP);
            dto.setAverageProductPrice(avgPrice);
        } else {
            dto.setAverageProductPrice(BigDecimal.ZERO);
        }

        dto.setProductsInStock(products.stream().filter(p -> p.getEstoque() != null && p.getEstoque().compareTo(BigDecimal.ZERO) > 0).count());
        dto.setProductsOutOfStock(products.stream().filter(p -> p.getEstoque() == null || p.getEstoque().compareTo(BigDecimal.ZERO) <= 0).count());

        Map<String, BigDecimal> categorySales = orders.stream()
                .filter(o -> o.getItens() != null && !o.getItens().isEmpty() && o.getItens().get(0).getProduto() != null && o.getItens().get(0).getProduto().getCategoria() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getItens().get(0).getProduto().getCategoria().getNome(),
                        Collectors.reducing(BigDecimal.ZERO, Pedido::getValorTotal, BigDecimal::add)
                ));

        String topCat = categorySales.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
        dto.setTopCategory(topCat);

        if (!orders.isEmpty()) {
            dto.setAverageOrderValue(totalSales.divide(BigDecimal.valueOf(orders.size()), 2, RoundingMode.HALF_UP));
        } else {
            dto.setAverageOrderValue(BigDecimal.ZERO);
        }

        double convRate = !users.isEmpty() ? ((double) orders.size() / users.size()) * 10 : 0;
        dto.setConversionRate(BigDecimal.valueOf(convRate).setScale(1, RoundingMode.HALF_UP));

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        LocalDateTime sixtyDaysAgo = LocalDateTime.now().minusDays(60);

        BigDecimal currentSales = orders.stream()
                .filter(o -> o.getDataPedido() != null && o.getDataPedido().isAfter(thirtyDaysAgo))
                .map(Pedido::getValorTotal)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal previousSales = orders.stream()
                .filter(o -> o.getDataPedido() != null && o.getDataPedido().isAfter(sixtyDaysAgo) && o.getDataPedido().isBefore(thirtyDaysAgo))
                .map(Pedido::getValorTotal)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal growthRate = BigDecimal.ZERO;
        if (previousSales.compareTo(BigDecimal.ZERO) > 0) {
            growthRate = currentSales.subtract(previousSales)
                    .divide(previousSales, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP);
        } else if (currentSales.compareTo(BigDecimal.ZERO) > 0) {
            growthRate = BigDecimal.valueOf(100);
        }
        dto.setGrowthRate(growthRate);

        Map<String, BigDecimal> productSales = orders.stream()
                .filter(o -> o.getItens() != null && !o.getItens().isEmpty() && o.getItens().get(0).getProduto() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getItens().get(0).getProduto().getNome(),
                        Collectors.reducing(BigDecimal.ZERO, Pedido::getValorTotal, BigDecimal::add)
                ));

        AdminKpiDTO.TopProductDTO topProd = productSales.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> new AdminKpiDTO.TopProductDTO(e.getKey(), e.getValue()))
                .orElse(new AdminKpiDTO.TopProductDTO("Nenhum", BigDecimal.ZERO));
        dto.setTopPerformingProduct(topProd);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/sellers")
    @Operation(summary = "Listar Top Vendedores com suas Vendas")
    public ResponseEntity<List<TopSellerDTO>> getTopSellers(Principal principal) {
        if (!isAdmin(principal)) {
            return ResponseEntity.status(403).build();
        }

        List<Pedido> orders = pedidoRepository.findAll();

        // Agrupar pedidos por vendedor e calcular totais
        Map<Usuario, Object[]> sellerStats = orders.stream()
                .filter(o -> o.getVendedor() != null)
                .collect(Collectors.groupingBy(
                        Pedido::getVendedor,
                        Collectors.teeing(
                                Collectors.reducing(
                                        BigDecimal.ZERO,
                                        Pedido::getValorTotal,
                                        (acc, val) -> val != null ? acc.add(val) : acc
                                ),
                                Collectors.counting(),
                                (totalSales, count) -> new Object[]{totalSales, count}
                        )
                ));

        // Converter para TopSellerDTO e ordenar por vendas decrescentes
        List<TopSellerDTO> topSellers = sellerStats.entrySet().stream()
                .map(entry -> {
                    Usuario seller = entry.getKey();
                    BigDecimal totalSales = (BigDecimal) entry.getValue()[0];
                    long dealCount = (long) entry.getValue()[1];
                    return new TopSellerDTO(seller.getFullName(), totalSales, dealCount);
                })
                .sorted((a, b) -> b.getGross().compareTo(a.getGross())) // Ordenar por vendas decrescentes
                .limit(10) // Top 10 apenas
                .collect(Collectors.toList());

        return ResponseEntity.ok(topSellers);
    }
}

