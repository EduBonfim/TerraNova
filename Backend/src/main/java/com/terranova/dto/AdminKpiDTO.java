package com.terranova.dto;

import java.math.BigDecimal;

public class AdminKpiDTO {
    private long totalUsers;
    private long totalProducers;
    private long totalBuyers;
    private long totalProducts;
    private BigDecimal totalSales;
    private BigDecimal producerSalesTotal;
    private BigDecimal buyerPurchasesTotal;
    private BigDecimal averageProductPrice;
    private long productsInStock;
    private long productsOutOfStock;
    private String topCategory;
    private BigDecimal averageOrderValue;
    private BigDecimal conversionRate;
    private BigDecimal growthRate;
    private TopProductDTO topPerformingProduct;

    public static class TopProductDTO {
        private String name;
        private BigDecimal sales;

        public TopProductDTO(String name, BigDecimal sales) {
            this.name = name;
            this.sales = sales;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public BigDecimal getSales() { return sales; }
        public void setSales(BigDecimal sales) { this.sales = sales; }
    }

    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalProducers() { return totalProducers; }
    public void setTotalProducers(long totalProducers) { this.totalProducers = totalProducers; }

    public long getTotalBuyers() { return totalBuyers; }
    public void setTotalBuyers(long totalBuyers) { this.totalBuyers = totalBuyers; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

    public BigDecimal getProducerSalesTotal() { return producerSalesTotal; }
    public void setProducerSalesTotal(BigDecimal producerSalesTotal) { this.producerSalesTotal = producerSalesTotal; }

    public BigDecimal getBuyerPurchasesTotal() { return buyerPurchasesTotal; }
    public void setBuyerPurchasesTotal(BigDecimal buyerPurchasesTotal) { this.buyerPurchasesTotal = buyerPurchasesTotal; }

    public BigDecimal getAverageProductPrice() { return averageProductPrice; }
    public void setAverageProductPrice(BigDecimal averageProductPrice) { this.averageProductPrice = averageProductPrice; }

    public long getProductsInStock() { return productsInStock; }
    public void setProductsInStock(long productsInStock) { this.productsInStock = productsInStock; }

    public long getProductsOutOfStock() { return productsOutOfStock; }
    public void setProductsOutOfStock(long productsOutOfStock) { this.productsOutOfStock = productsOutOfStock; }

    public String getTopCategory() { return topCategory; }
    public void setTopCategory(String topCategory) { this.topCategory = topCategory; }

    public BigDecimal getAverageOrderValue() { return averageOrderValue; }
    public void setAverageOrderValue(BigDecimal averageOrderValue) { this.averageOrderValue = averageOrderValue; }

    public BigDecimal getConversionRate() { return conversionRate; }
    public void setConversionRate(BigDecimal conversionRate) { this.conversionRate = conversionRate; }

    public BigDecimal getGrowthRate() { return growthRate; }
    public void setGrowthRate(BigDecimal growthRate) { this.growthRate = growthRate; }

    public TopProductDTO getTopPerformingProduct() { return topPerformingProduct; }
    public void setTopPerformingProduct(TopProductDTO topPerformingProduct) { this.topPerformingProduct = topPerformingProduct; }
}
