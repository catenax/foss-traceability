# our base build image
FROM maven:3.5-jdk-8 as build

# copy the project files
#COPY / /
COPY ./dis/backend/pom.xml /pom.xml

# build all dependencies
RUN mvn dependency:go-offline -B

# copy your other files
COPY ./dis/backend/src ./src

# build for release
RUN mvn package

# our final base image
FROM openjdk:11-oracle

# set deployment directory
WORKDIR /dis

# copy over the built artifact from the maven image
COPY --from=build target/*.jar ./app.jar

# set the startup command to run your binary
CMD ["java", "-jar", "./app.jar"]
