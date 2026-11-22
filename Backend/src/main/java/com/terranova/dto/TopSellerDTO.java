package com.terranova.dto;

import java.math.BigDecimal;

public class TopSellerDTO {
    private String name;
    private BigDecimal gross;
    private long deals;

    public TopSellerDTO(String name, BigDecimal gross, long deals) {
        this.name = name;
        this.gross = gross;
        this.deals = deals;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getGross() {
        return gross;
    }

    public void setGross(BigDecimal gross) {
        this.gross = gross;
    }

    public long getDeals() {
        return deals;
    }

    public void setDeals(long deals) {
        this.deals = deals;
    }
}
