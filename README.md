# bullmq-simple-example

Простий приклад використання BullMQ з Redis.

## Інструкції

1. Встановіть залежності:
   `npm ci`
2. Відкрийте Docker.
3. Запустіть Redis у Docker-контейнері:
   `npm run setup-local-redis`
4. Запустіть прикладний скрипт:
   `npm start`
5. Для зупинки скрипту використовуйте комбінацію клавіш `Control + C`.
6. Після завершення тестування, видаліть Docker-контейнер з Redis:
   `npm run shutdown-local-redis`
