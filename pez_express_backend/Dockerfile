# ─────────────────────────────────────────────
# STAGE 1: Build con Maven
# ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copiar pom.xml primero para aprovechar caché de dependencias
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─────────────────────────────────────────────
# STAGE 2: Imagen final ligera
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar el JAR generado
COPY --from=builder /app/target/*.jar app.jar

# Puerto que expone Spring Boot
EXPOSE 8080

# Arrancar la app
ENTRYPOINT ["java", "-jar", "app.jar"]
