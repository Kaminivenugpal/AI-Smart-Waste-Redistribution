package com.wasteredistribution.dto;

import com.wasteredistribution.entity.Donor;
import com.wasteredistribution.entity.Receiver;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private boolean success;
    private String message;
    private Donor donor;
    private Receiver receiver;
    private String token;
}
