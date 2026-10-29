package com.dework.reportservice.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponseDto<T> {
    @Builder.Default
    private List<T> content = new ArrayList<>();
    private int totalPages;
    private long totalElements;
    private int size;
    private int number;
}

