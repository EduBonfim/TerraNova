package com.terranova.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.validator.constraints.br.CPF;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false)
    @NotBlank
    private String password;

    @Column(nullable = false, length = 20)
    private String role = "producer";

    @Column(name = "full_name")
    private String fullName;

    @Email
    @Column(unique = true)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 500)
    private String bio;

    @Column(name = "avatar_uri", length = 500)
    private String avatarUri;

    @Column(length = 20)
    private String gender;

    @Column(unique = true, length = 20)
    @CPF
    private String cpf;

    @Column(name = "farm_name")
    private String farmName;

    @Column(name = "farm_document", length = 30)
    private String farmDocument;

    @Column(name = "farm_document_type", length = 10)
    private String farmDocumentType;

    @Column(name = "is_organic_certified")
    private Boolean isOrganicCertified = false;

    @Column(name = "mapa_registration_number", length = 100)
    private String mapaRegistrationNumber;

    @Column(name = "address_cep", length = 10)
    @NotBlank
    private String addressCep;

    @Column(name = "address_street")
    private String addressStreet;

    @Column(name = "address_number", length = 30)
    private String addressNumber;

    @Column(name = "address_neighborhood", length = 100)
    private String addressNeighborhood;

    @Column(name = "address_city", length = 100)
    private String addressCity;

    @Column(name = "address_state", length = 2)
    private String addressState;

    @Column(name = "address_complement")
    private String addressComplement;

    @Column(name = "gate_latitude")
    private java.math.BigDecimal gateLatitude;

    @Column(name = "gate_longitude")
    private java.math.BigDecimal gateLongitude;

    @Column(name = "is_cep_validated")
    private Boolean isCepValidated = false;

    @Column(name = "is_gate_pin_confirmed")
    private Boolean isGatePinConfirmed = false;

    @Column(name = "location_validated_at")
    private LocalDateTime locationValidatedAt;

    @ElementCollection
    @CollectionTable(name = "usuario_farm_photos", joinColumns = @JoinColumn(name = "usuario_id"))
    @Column(name = "photo_uri")
    private java.util.List<String> farmPhotos;

    @Column(name = "producer_role")
    private String producerRole;

    @Column(name = "farm_address_reference")
    private String farmAddressReference;

    @Column(name = "block_messages")
    private Boolean blockMessages = false;

    @Column(name = "lgpd_accepted_at")
    private LocalDateTime lgpdAcceptedAt;

    @Column(name = "lgpd_terms_version", length = 20)
    private String lgpdTermsVersion;

    @Column(name = "pending_lgpd_reacceptance")
    private Boolean pendingLgpdReacceptance = false;

    @Column(name = "terms_accepted_at")
    private LocalDateTime termsAcceptedAt;

    @Column(name = "terms_version", length = 20)
    private String termsVersion;

    @Column(name = "media_avaliacao")
    private Double mediaAvaliacao = 0.0;

    @Column(name = "total_avaliacoes")
    private Integer totalAvaliacoes = 0;

    @Column(name = "confiabilidade")
    private Double confiabilidade = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public Usuario() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUri() {
        return avatarUri;
    }

    public void setAvatarUri(String avatarUri) {
        this.avatarUri = avatarUri;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

    public String getFarmDocument() {
        return farmDocument;
    }

    public void setFarmDocument(String farmDocument) {
        this.farmDocument = farmDocument;
    }

    public String getFarmDocumentType() {
        return farmDocumentType;
    }

    public void setFarmDocumentType(String farmDocumentType) {
        this.farmDocumentType = farmDocumentType;
    }

    public Boolean getIsOrganicCertified() {
        return isOrganicCertified;
    }

    public void setIsOrganicCertified(Boolean isOrganicCertified) {
        this.isOrganicCertified = isOrganicCertified;
    }

    public String getMapaRegistrationNumber() {
        return mapaRegistrationNumber;
    }

    public void setMapaRegistrationNumber(String mapaRegistrationNumber) {
        this.mapaRegistrationNumber = mapaRegistrationNumber;
    }

    public String getAddressCep() {
        return addressCep;
    }

    public void setAddressCep(String addressCep) {
        this.addressCep = addressCep;
    }

    public String getAddressStreet() {
        return addressStreet;
    }

    public void setAddressStreet(String addressStreet) {
        this.addressStreet = addressStreet;
    }

    public String getAddressNumber() {
        return addressNumber;
    }

    public void setAddressNumber(String addressNumber) {
        this.addressNumber = addressNumber;
    }

    public String getAddressNeighborhood() {
        return addressNeighborhood;
    }

    public void setAddressNeighborhood(String addressNeighborhood) {
        this.addressNeighborhood = addressNeighborhood;
    }

    public String getAddressCity() {
        return addressCity;
    }

    public void setAddressCity(String addressCity) {
        this.addressCity = addressCity;
    }

    public String getAddressState() {
        return addressState;
    }

    public void setAddressState(String addressState) {
        this.addressState = addressState;
    }

    public String getAddressComplement() {
        return addressComplement;
    }

    public void setAddressComplement(String addressComplement) {
        this.addressComplement = addressComplement;
    }

    public LocalDateTime getLgpdAcceptedAt() {
        return lgpdAcceptedAt;
    }

    public void setLgpdAcceptedAt(LocalDateTime lgpdAcceptedAt) {
        this.lgpdAcceptedAt = lgpdAcceptedAt;
    }

    public String getLgpdTermsVersion() {
        return lgpdTermsVersion;
    }

    public void setLgpdTermsVersion(String lgpdTermsVersion) {
        this.lgpdTermsVersion = lgpdTermsVersion;
    }

    public Boolean getPendingLgpdReacceptance() {
        return pendingLgpdReacceptance;
    }

    public void setPendingLgpdReacceptance(Boolean pendingLgpdReacceptance) {
        this.pendingLgpdReacceptance = pendingLgpdReacceptance;
    }

    public LocalDateTime getTermsAcceptedAt() {
        return termsAcceptedAt;
    }

    public void setTermsAcceptedAt(LocalDateTime termsAcceptedAt) {
        this.termsAcceptedAt = termsAcceptedAt;
    }

    public String getTermsVersion() {
        return termsVersion;
    }

    public void setTermsVersion(String termsVersion) {
        this.termsVersion = termsVersion;
    }

    public Double getMediaAvaliacao() { return mediaAvaliacao; }
    public void setMediaAvaliacao(Double mediaAvaliacao) { this.mediaAvaliacao = mediaAvaliacao; }

    public Integer getTotalAvaliacoes() { return totalAvaliacoes; }
    public void setTotalAvaliacoes(Integer totalAvaliacoes) { this.totalAvaliacoes = totalAvaliacoes; }

    public Double getConfiabilidade() { return confiabilidade; }
    public void setConfiabilidade(Double confiabilidade) { this.confiabilidade = confiabilidade; }

    public java.math.BigDecimal getGateLatitude() { return gateLatitude; }
    public void setGateLatitude(java.math.BigDecimal gateLatitude) { this.gateLatitude = gateLatitude; }

    public java.math.BigDecimal getGateLongitude() { return gateLongitude; }
    public void setGateLongitude(java.math.BigDecimal gateLongitude) { this.gateLongitude = gateLongitude; }

    public Boolean getIsCepValidated() { return isCepValidated; }
    public void setIsCepValidated(Boolean isCepValidated) { this.isCepValidated = isCepValidated; }

    public Boolean getIsGatePinConfirmed() { return isGatePinConfirmed; }
    public void setIsGatePinConfirmed(Boolean isGatePinConfirmed) { this.isGatePinConfirmed = isGatePinConfirmed; }

    public LocalDateTime getLocationValidatedAt() { return locationValidatedAt; }
    public void setLocationValidatedAt(LocalDateTime locationValidatedAt) { this.locationValidatedAt = locationValidatedAt; }

    public java.util.List<String> getFarmPhotos() { return farmPhotos; }
    public void setFarmPhotos(java.util.List<String> farmPhotos) { this.farmPhotos = farmPhotos; }

    public String getProducerRole() { return producerRole; }
    public void setProducerRole(String producerRole) { this.producerRole = producerRole; }

    public String getFarmAddressReference() { return farmAddressReference; }
    public void setFarmAddressReference(String farmAddressReference) { this.farmAddressReference = farmAddressReference; }

    public Boolean getBlockMessages() { return blockMessages; }
    public void setBlockMessages(Boolean blockMessages) { this.blockMessages = blockMessages; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
