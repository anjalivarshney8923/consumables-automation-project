package com.iocl.procurement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cartridge_thresholds")
public class CartridgeThreshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartridge_id", nullable = false, unique = true)
    private Cartridge cartridge;

    @Column(name = "po_threshold", nullable = false)
    private Integer poThreshold;

    @Column(name = "tendering_threshold", nullable = false, columnDefinition = "integer default 10")
    private Integer tenderingThreshold;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CartridgeThreshold() {
    }

    public CartridgeThreshold(Cartridge cartridge, Integer poThreshold) {
        this.cartridge = cartridge;
        this.poThreshold = poThreshold;
        this.tenderingThreshold = (poThreshold != null) ? Math.max(5, poThreshold * 2) : 10;
    }

    public CartridgeThreshold(Cartridge cartridge, Integer poThreshold, Integer tenderingThreshold) {
        this.cartridge = cartridge;
        this.poThreshold = poThreshold;
        this.tenderingThreshold = (tenderingThreshold != null) ? tenderingThreshold : (poThreshold != null ? Math.max(5, poThreshold * 2) : 10);
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.tenderingThreshold == null) {
            this.tenderingThreshold = (this.poThreshold != null) ? Math.max(5, this.poThreshold * 2) : 10;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.tenderingThreshold == null) {
            this.tenderingThreshold = (this.poThreshold != null) ? Math.max(5, this.poThreshold * 2) : 10;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cartridge getCartridge() {
        return cartridge;
    }

    public void setCartridge(Cartridge cartridge) {
        this.cartridge = cartridge;
    }

    public Integer getPoThreshold() {
        return poThreshold;
    }

    public void setPoThreshold(Integer poThreshold) {
        this.poThreshold = poThreshold;
    }

    public Integer getTenderingThreshold() {
        return tenderingThreshold;
    }

    public void setTenderingThreshold(Integer tenderingThreshold) {
        this.tenderingThreshold = tenderingThreshold;
    }

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
}
