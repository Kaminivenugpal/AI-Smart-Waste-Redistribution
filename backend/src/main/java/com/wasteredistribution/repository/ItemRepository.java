package com.wasteredistribution.repository;

import com.wasteredistribution.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByDonorIdOrderByCreatedAtDesc(Long donorId);
    List<Item> findAllByOrderByCreatedAtDesc();
}
