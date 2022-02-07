package de.bmw.partchain.dis.asset.model.response.cdq.bpn;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class LookupBusinessPartnersResponse {

  private int pageSize;
  private int totals;
  private int page;
  private List<Value> values;

}
