package com.wasteredistribution.repository;

import com.wasteredistribution.entity.DonationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface DonationRequestRepository extends JpaRepository<DonationRequest, Long> {

    List<DonationRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    List<DonationRequest> findByDonorIdOrderByCreatedAtDesc(Long donorId);

    boolean existsByItemIdAndReceiverIdAndStatus(Long itemId, Long receiverId, String status);

    boolean existsByItemIdAndStatusIn(Long itemId, Collection<String> statuses);

    @Query("select i from Item i where "
            + "(:category is null or lower(i.category) = lower(:category)) and "
            + "(:location is null or lower(i.location) like lower(concat('%', :location, '%'))) and "
            + "not exists (select r.id from DonationRequest r where r.item = i "
            + "and r.status in ('ACCEPTED', 'PICKUP_SCHEDULED', 'PICKED_UP')) "
            + "order by i.createdAt desc")
    List<com.wasteredistribution.entity.Item> findAvailableItems(
            @Param("category") String category,
            @Param("location") String location);
}
