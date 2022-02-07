package de.bmw.partchain.dis.asset.model.response.cdq.bpn;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class Type {

  private String url;
  private String name;
  private String technicalKey;

}
