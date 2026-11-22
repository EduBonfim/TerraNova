package com.terranova.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class UsuarioDTO {
    
    private UUID id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String avatarUri;
    private String farmName;
    private String cpf;
    private String farmDocument;
    private String farmDocumentType;
    private String bio;
    private String gender;
    private String addressCep;
    private String addressStreet;
    private String addressNumber;
    private String addressNeighborhood;
    private String addressCity;
    private String addressState;
    private String addressComplement;
    private LocalDateTime lgpdAcceptedAt;
    private String lgpdTermsVersion;
    private Boolean pendingLgpdReacceptance;
    private LocalDateTime termsAcceptedAt;
    private String termsVersion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Novos campos de Perfil e Geolocalização
    private BigDecimal gateLatitude;
    private BigDecimal gateLongitude;
    private Boolean isCepValidated;
    private Boolean isGatePinConfirmed;
    private LocalDateTime locationValidatedAt;
    private String producerRole;
    private String farmAddressReference;
    private List<String> farmPhotos;
    private Boolean blockMessages;
    private Boolean isOrganicCertified;
    private String mapaRegistrationNumber;

    // Listas para o Perfil Comunitário (Front-end)
    private List<ListingDTO> listings;
    private List<InsumoDTO> insumos;
    private List<AvaliacaoDTO> reviews;
    private Double mediaNota;

    public UsuarioDTO() {}

    public UsuarioDTO(UUID id, String username, String fullName, String email, String phone, String role, String avatarUri, String farmName, String cpf, String farmDocument, String farmDocumentType, String bio, String gender, String addressCep, String addressStreet, String addressNumber, String addressNeighborhood, String addressCity, String addressState, String addressComplement, LocalDateTime lgpdAcceptedAt, String lgpdTermsVersion, Boolean pendingLgpdReacceptance, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.avatarUri = avatarUri;
        this.farmName = farmName;
        this.cpf = cpf;
        this.farmDocument = farmDocument;
        this.farmDocumentType = farmDocumentType;
        this.bio = bio;
        this.gender = gender;
        this.addressCep = addressCep;
        this.addressStreet = addressStreet;
        this.addressNumber = addressNumber;
        this.addressNeighborhood = addressNeighborhood;
        this.addressCity = addressCity;
        this.addressState = addressState;
        this.addressComplement = addressComplement;
        this.lgpdAcceptedAt = lgpdAcceptedAt;
        this.lgpdTermsVersion = lgpdTermsVersion;
        this.pendingLgpdReacceptance = pendingLgpdReacceptance;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarUri() { return avatarUri; }
    public void setAvatarUri(String avatarUri) { this.avatarUri = avatarUri; }

    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getFarmDocument() { return farmDocument; }
    public void setFarmDocument(String farmDocument) { this.farmDocument = farmDocument; }

    public String getFarmDocumentType() { return farmDocumentType; }
    public void setFarmDocumentType(String farmDocumentType) { this.farmDocumentType = farmDocumentType; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddressCep() { return addressCep; }
    public void setAddressCep(String addressCep) { this.addressCep = addressCep; }

    public String getAddressStreet() { return addressStreet; }
    public void setAddressStreet(String addressStreet) { this.addressStreet = addressStreet; }

    public String getAddressNumber() { return addressNumber; }
    public void setAddressNumber(String addressNumber) { this.addressNumber = addressNumber; }

    public String getAddressNeighborhood() { return addressNeighborhood; }
    public void setAddressNeighborhood(String addressNeighborhood) { this.addressNeighborhood = addressNeighborhood; }

    public String getAddressCity() { return addressCity; }
    public void setAddressCity(String addressCity) { this.addressCity = addressCity; }

    public String getAddressState() { return addressState; }
    public void setAddressState(String addressState) { this.addressState = addressState; }

    public String getAddressComplement() { return addressComplement; }
    public void setAddressComplement(String addressComplement) { this.addressComplement = addressComplement; }

    public LocalDateTime getLgpdAcceptedAt() { return lgpdAcceptedAt; }
    public void setLgpdAcceptedAt(LocalDateTime lgpdAcceptedAt) { this.lgpdAcceptedAt = lgpdAcceptedAt; }

    public String getLgpdTermsVersion() { return lgpdTermsVersion; }
    public void setLgpdTermsVersion(String lgpdTermsVersion) { this.lgpdTermsVersion = lgpdTermsVersion; }

    public Boolean getPendingLgpdReacceptance() { return pendingLgpdReacceptance; }
    public void setPendingLgpdReacceptance(Boolean pendingLgpdReacceptance) { this.pendingLgpdReacceptance = pendingLgpdReacceptance; }

    public LocalDateTime getTermsAcceptedAt() { return termsAcceptedAt; }
    public void setTermsAcceptedAt(LocalDateTime termsAcceptedAt) { this.termsAcceptedAt = termsAcceptedAt; }

    public String getTermsVersion() { return termsVersion; }
    public void setTermsVersion(String termsVersion) { this.termsVersion = termsVersion; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Getters e Setters para os novos campos
    public BigDecimal getGateLatitude() { return gateLatitude; }
    public void setGateLatitude(BigDecimal gateLatitude) { this.gateLatitude = gateLatitude; }

    public BigDecimal getGateLongitude() { return gateLongitude; }
    public void setGateLongitude(BigDecimal gateLongitude) { this.gateLongitude = gateLongitude; }

    public Boolean getIsCepValidated() { return isCepValidated; }
    public void setIsCepValidated(Boolean isCepValidated) { this.isCepValidated = isCepValidated; }

    public Boolean getIsGatePinConfirmed() { return isGatePinConfirmed; }
    public void setIsGatePinConfirmed(Boolean isGatePinConfirmed) { this.isGatePinConfirmed = isGatePinConfirmed; }

    public LocalDateTime getLocationValidatedAt() { return locationValidatedAt; }
    public void setLocationValidatedAt(LocalDateTime locationValidatedAt) { this.locationValidatedAt = locationValidatedAt; }

    public String getProducerRole() { return producerRole; }
    public void setProducerRole(String producerRole) { this.producerRole = producerRole; }

    public String getFarmAddressReference() { return farmAddressReference; }
    public void setFarmAddressReference(String farmAddressReference) { this.farmAddressReference = farmAddressReference; }

    public List<String> getFarmPhotos() { return farmPhotos; }
    public void setFarmPhotos(List<String> farmPhotos) { this.farmPhotos = farmPhotos; }

    public Boolean getBlockMessages() { return blockMessages; }
    public void setBlockMessages(Boolean blockMessages) { this.blockMessages = blockMessages; }

    public Boolean getIsOrganicCertified() { return isOrganicCertified; }
    public void setIsOrganicCertified(Boolean isOrganicCertified) { this.isOrganicCertified = isOrganicCertified; }

    public String getMapaRegistrationNumber() { return mapaRegistrationNumber; }
    public void setMapaRegistrationNumber(String mapaRegistrationNumber) { this.mapaRegistrationNumber = mapaRegistrationNumber; }

    public List<ListingDTO> getListings() { return listings; }
    public void setListings(List<ListingDTO> listings) { this.listings = listings; }

    public List<InsumoDTO> getInsumos() { return insumos; }
    public void setInsumos(List<InsumoDTO> insumos) { this.insumos = insumos; }

    public List<AvaliacaoDTO> getReviews() { return reviews; }
    public void setReviews(List<AvaliacaoDTO> reviews) { this.reviews = reviews; }

    public Double getMediaNota() { return mediaNota; }
    public void setMediaNota(Double mediaNota) { this.mediaNota = mediaNota; }
}
