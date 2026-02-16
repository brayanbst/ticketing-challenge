# Ticketing Challenge – High Demand Ticket Sales (NestJS)

Este proyecto es una implementación de referencia (conceptual + real) para un sistema de venta de entradas de alta demanda (estilo Teleticket), diseñado para:

- Evitar sobreventa bajo alta concurrencia
- Reservar entradas temporalmente (HOLD con TTL)
- Confirmar compra tras pago exitoso
- Liberar automáticamente entradas no pagadas (expiración)
- Manejar pagos duplicados / tardíos (idempotencia)

---

## Stack
- Node.js + TypeScript
- NestJS
- Jest (unit tests)
- In-memory store (para simplificar el reto)

> Nota: En producción, la integridad (anti-sobreventa) se garantiza con PostgreSQL (transacciones + constraints), Redis para rate limit/locks y una cola (Kafka/Rabbit/SQS) para procesamiento async.

---

## Arquitectura
Arquitectura **modular por feature** (feature-based modules) + **arquitectura en capas**:

- Controller: API layer
- Service: Application / business logic
- Store/Repositories: persistencia (in-memory para demo)

Los módulos están organizados por dominio:

- Events
- Reservations (HOLD)
- Payments (confirmación e idempotencia)
- Jobs (liberación de expirados)

---

## Instalación
Requisitos:
- Node 18+

Instalar dependencias:
```bash
npm install

Ejecutar el proyecto

npm run start:dev