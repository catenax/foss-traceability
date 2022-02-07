# BMWPartChainDIS

Asset that is meant to be added into the Partchain Blockchain (PB) has to exhibit a defined data structure. It needs to be a [plain JSON](https://www.json.org/) having these properties defined:

| Property key | unique | nullable | type|
|--|:--:|:--:|--|
| manufacturer | X |  | string |
| productionCountryCodeManufacturer |  |  | string |
| partNameManufacturer |  |  | string |
| partNumberManufacturer |  |  | string |
| partNumberCustomer |  | X | string |
| serialNumberManufacturer | X |  | string |
| serialNumberCustomer | X | X | string |
| qualityStatus |  |  | string |
| qualityHash | X | X | stirng |
| componentSerialNumber |  | X | Array<string> |
| status |  |  | string |
| productionDateGmt |  |  | string - ISO 8601 Datetime |

## Data integration

Data integration service (DIS) serves for the simplification of transfer of customer’s data into PB.
DIS exposes the RESTful endpoint `/api/asset/` (media type: `application/json`, http method: `POST`) that is capable of receiving asset’s data and propagate them to the distributed ledger of PB.
This endpoint can parse single asset or array of more assets.  In DIS, it is also possible to configure data transformation from customer specific format into data interface of PB and regex to validate format of incoming data.

## Data mocking

For testing and development purposes it is convenient to generate mock assets. There is endpoint in DIS `/api/mock/count/{count}/publish/{publish}` (http method: `GET`) that generates mock assets. As you can see there are two parameters in path that can be provided by user. The count is a numeric value specifying how many mock assets should be created and publish is a boolean. If set to true than assets are propagated into PB in set to false than they are only returned as a request response.

In configuration can be specified what mocking function would be used and how would format of data look like.

### Mocking functions

| Function | DIS Configuration Label | Format | Description | Format example
|--|--|--|--|--|
| LETTER | Letter | string | Replaces ? by random letter | A1BC? |
| NUMBER | Number | string | Replaces # by random number | AB#D |
| BOTH | Alphanumeric | string | Replaces ? by random letter and # by random number | A?RF## |
| REGEX | Regular expression | string | Generates random value based on regular expression | [A-C]{4} |
| ENUM | Enumeration | [string] | Selects random value from collection | ABCD,EFGH |
| SEQUENCE | Sequence | [string] | Repeatedly selects value from collection  | ABCD,EFGH |
| EXACT | Exact | string | Exact match of format value | Mock111 |
| TIMESTAMP | Timestamp | number | Random date not older than number of days mentioned in format | 10 |
| EMPTY_STRING | Empty string |  | Returns "" |  |
| NULL | NULL |  | Returns null |  |

## Configuration

> Please note that configuration can be changed via DIS UI in configuration section.

Initial configuration is provided by transformation.yml file that is located in src\main\resources folder of DIS application. It is a map where key is a name of parameter listed above in this document and value is a map with these keys:

- parameterName (required)
- formatRegex (optional)
- defaultValue (optional)
- mockFunction (optional)
- mockFormat (optional)

### parameterName
Is a name of customer's naming of parameter to be mapped into mentioned parameter

### defaultValue
If parameter's value is not provided this value would be set and written into PB

### formatRegex
Is a regular expression that is matched during transformation of customer data into PB model. Data are written into PB if and only if the parameter value matches this regular expression. If formatRegex is not defined any data are accepted.

### mockFunction
Name of mock function from the table above

### mockFormat
Format for mock function from the table above

### Example of `transformation.yaml`

```yaml
manufacturer:
  parameterName: manufacturer
  formatRegex: BMW
  defaultValue: BMW
  mockFunction: EXACT
  mockFormat: BMW
productionCountryCodeManufacturer:
  parameterName: productionCountryCodeManufacturer
  formatRegex: DE
  mockFunction: EXACT
  mockFormat: DE
partNameManufacturer:
  parameterName: partNameManufacturer
  mockFunction: ENUM
  mockFormat: BMW 8er LG Gran Coupé,BMW 8er LG
partNumberManufacturer:
  parameterName: partNumberManufacturer
  mockFunction: EXACT
  mockFormat: G16
partNumberCustomer:
  parameterName: partNumberCustomer
  mockFunction: NULL
serialNumberManufacturer:
  parameterName: serialNumberManufacturer
  mockFunction: BOTH
  mockFormat: H37445#######B186A00059
serialNumberCustomer:
  parameterName: serialNumberCustomer
  mockFunction: NULL
qualityStatus:
  parameterName: qualityStatus
  mockFunction: EXACT
  mockFormat: OK
qualityHash:
  parameterName: qualityHash
  mockFunction: NULL
componentSerialNumber:
  parameterName: componentSerialNumber
  mockFunction: NULL
status:
  parameterName: status
  mockFunction: EXACT
  mockFormat: PRODUCED
productionDateGmt:
  parameterName: productionDateGmt
  formatRegex: BMW
  defaultValue: BMW
  mockFormat: '15'
  mockFunction: TIMESTAMP
```

## UI (frontend)

UI of DIS is written in [AngularJS 8](https://angular.io/).

### Angular commands

#### Start development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

#### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Configurtion

Configuration is defined in files `/frontend/src/environments/environment.ts` and `/frontend/src/environments/keycloak.json`

#### environment.ts
```typescript
export const environment = {
  production: false,
  organization: 'myOrganization',
  keycloakRole: 'user'
  urls: {
    LAAPI: 'https://svc.partchain.org.dev/api/',
    dis: 'https://dis-api.partchain.org.dev/api/'
  }
};
```
#### keycloak.json
```json
{
  "realm": "myOrganizationRealm",
  "auth-server-url": "https://auth.partchain.dev/auth",
  "ssl-required": "none",
  "resource": "dis",
  "credentials": {
    "secret": "cbaa2efa-e02b-4fd3-b228-c14438079e62"
  },
  "use-resource-role-mappings": true,
  "confidential-port": 0,
  "enable-cors": true
}
```

## API (backend)

Java [Spring framework](https://docs.spring.io/spring-framework/docs/current/javadoc-api/) is used as a server side solution.

### Build

Build tool is [maven](https://maven.apache.org/) so application can be built  with `mvn clean install`. For build of local instance for development purpose run `mvn clean install -Dspring.profiles.active=development`. For this option you need to have running postgres service.

### Run application

Application can be started by command `java -jar DIS-1.0.0.jar`.

### Configuration

General configuration is defined in `src/main/resources/application.properties` and customer specific configuration in `src/main/resources/application-orgname.properties`.

#### application.properties

```
#spring properties
spring.main.allow-bean-definition-overriding=true
spring.profiles.active=bmw,al,lion,tiger,wildebeest,wolf,zebra,antelope
spring.jpa.generate-ddl=true
spring.jpa.hibernate.ddl-auto=create

#server properties
server.port=8080
server.servlet.context-path=/api
server.http2.enabled=true

# keycloak properties
keycloak.bearer-only=true
keycloak.principal-attribute=preferred_username
keycloak.cors=false

# logging properties
logging.level.org.apache.http=debug
logging.level.org.keycloak=debug

```
#### application-orgname.properties
```
keycloak.realm=MyOrganizationRealm
keycloak.realm-key=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA+BxWTUgT66G1HFQOQlai56ZYTFzeGmNE2je9FX1EVgbctfNSK5+hUxIHi+g8LicpXhtPvXZybO9CdsDM0PWcyDDpzOmk811ka1elrb23Iz9SatW4dDCSdbwKfFw0XJvs07boWxPaFJ6mGr1UvNsfww2Eh+LkhYyXRd4Tr+Ikj3TxPBNjga00m8Olgn+q3b+Kr1de0HTcO/ST31rDkcb21DHPj3s7sArjol2AYM4O0I9h2xtmPO7V8sgLQVA6baKlBHD9A4ebU60foN0ZM0S30pkTOFqC0pbGRdHmQLzZDKPXbApdTGbOTN88AP4+M3vpY9LNf3W3WI30APGPtzoQoQIDAQAB
keycloak.resource=dis
keycloak.auth-server-url=https://auth.partchain.dev/auth

spring.datasource.url=jdbc:postgresql://dis-db.bmw.svc.cluster.local:5432/bmw-dis
spring.datasource.username=bmw-dis
spring.datasource.password=bmw-password
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true

abstractor.url=abstractor.bmw.svc.cluster.local
```
