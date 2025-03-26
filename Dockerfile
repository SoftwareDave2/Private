# Use openjdk 17 as base image for Spring Boot
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the JAR file built by Maven into the container
COPY target/it_projekt_tablohm-0.0.1-SNAPSHOT.jar app.jar

# Expose the port that Spring Boot is listening on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
