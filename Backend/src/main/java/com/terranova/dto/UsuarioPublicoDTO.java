package com.terranova.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class UsuarioPublicoDTO {
    private UUID id;
    private String username;
    private String fullName;
    private String role;
    private String avatarUri;
    private String farmName;
    private String bio;
    private String gender;

    // Apenas cidade, estado e referência. Ocultar número e logradouro se não for produtor, 
    // ou expor tudo que não seja PII crítica. 
    // Como a UI comunitária só precisa muitas vezes da rua (sem PII estrito como CPF),
    // liberamos os campos de mapa, mas OMITIMOS CPF, Email, Telefone, Documento, etc.
    private String addressStreet;
    private String addressNumber;
    private String addressNeighborhood;
    private String addressCity;
    private String addressState;
    private String farmAddressReference;

    private BigDecimal gateLatitude;
    private BigDecimal gateLongitude;
    private Boolean isCepValidated;
    private Boolean isGatePinConfirmed;
    private LocalDateTime locationValidatedAt;

    private String producerRole;
    private List<String> farmPhotos;
    private Boolean blockMessages;
    private Boolean isOrganicCertified;
    private String mapaRegistrationNumber;

    private List<ListingDTO> listings;
    private List<InsumoDTO> insumos;
    private List<AvaliacaoDTO> reviews;
    private Double mediaNota;

    // Getters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarUri() { return avatarUri; }
    public void setAvatarUri(String avatarUri) { this.avatarUri = avatarUri; }

    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

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

    public String getFarmAddressReference() { return farmAddressReference; }
    public void setFarmAddressReference(String farmAddressReference) { this.farmAddressReference = farmAddressReference; }

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
