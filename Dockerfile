# Stage 1
FROM node:20 as builder

WORKDIR /build

COPY package*.json .
RUN npm install

COPY src/ src/
COPY prisma/ prisma/
COPY tsconfig.json tsconfig.json

RUN npx prisma generate
RUN npm run build

# Stage 2
FROM node:20 as runner

WORKDIR /auth-server

COPY --from=builder build/package*.json .
COPY --from=builder build/node_modules node_modules/
COPY --from=builder build/dist dist/
COPY --from=builder build/prisma prisma/

CMD [ "npm", "start" ]