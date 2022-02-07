package de.bmw.partchain.dis.asset.model.request;

import lombok.Data;

import java.util.List;

@Data
public class TreeDto {
    private List<String> isParentOf;
}