# Build stage: compile the Spring Boot application into a runnable JAR
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src/main ./src/main
COPY src/test ./src/test
RUN mvn -B -DskipTests package

# Runtime stage: lightweight image to run the packaged JAR
FROM openjdk:17-jdk-slim AS runtime
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
RUN mkdir -p /app/src/frontend/public/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
