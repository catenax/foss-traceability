package de.bmw.partchain.dis.asset.model.request.cdq.bpn;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class LookupBusinessPartnersRequest {
  private BusinessPartner businessPartner;
}
