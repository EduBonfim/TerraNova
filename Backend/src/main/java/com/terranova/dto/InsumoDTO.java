package com.terranova.dto;

import java.util.UUID;

public class InsumoDTO {
    private UUID id;
    private String title;
    private String amount;

    public InsumoDTO() {}

    public InsumoDTO(UUID id, String title, String amount) {
        this.id = id;
        this.title = title;
        this.amount = amount;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
}
