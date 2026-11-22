package com.terranova.dto;

import java.math.BigDecimal;

public class ProducerKpiDTO {
    private Integer totalAds;
    private BigDecimal averageRating;
    private BigDecimal monthlySales;
    private Long followers;

    public ProducerKpiDTO() {}

    public ProducerKpiDTO(Integer totalAds, BigDecimal averageRating, BigDecimal monthlySales, Long followers) {
        this.totalAds = totalAds;
        this.averageRating = averageRating;
        this.monthlySales = monthlySales;
        this.followers = followers;
    }

    public Integer getTotalAds() { return totalAds; }
    public void setTotalAds(Integer totalAds) { this.totalAds = totalAds; }

    public BigDecimal getAverageRating() { return averageRating; }
    public void setAverageRating(BigDecimal averageRating) { this.averageRating = averageRating; }

    public BigDecimal getMonthlySales() { return monthlySales; }
    public void setMonthlySales(BigDecimal monthlySales) { this.monthlySales = monthlySales; }

    public Long getFollowers() { return followers; }
    public void setFollowers(Long followers) { this.followers = followers; }
}
