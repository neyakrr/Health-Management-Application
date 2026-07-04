FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jre-focal
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN mkdir /app/data
EXPOSE 8080 8081 8082 8083 8084
ENTRYPOINT ["java","-jar","/app/app.jar"]
