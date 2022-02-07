package de.bmw.partchain.dis.asset.model.dao;


import lombok.Builder;
import lombok.Data;
import org.springframework.data.redis.core.RedisHash;


@Data
@Builder
@RedisHash(value = "BusinessPartner", timeToLive = 7200)
public class BpnDao {

  private String id;
  private String name;


}
