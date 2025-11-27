# syntax=docker/dockerfile:1

# Imagem base com Bun
FROM oven/bun:1 AS base
WORKDIR /app

# Instalar dependências do sistema necessárias para sharp, ffmpeg e Prisma
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Etapa de instalação de dependências
FROM base AS install

# Copiar arquivos de dependências
COPY package.json bun.lockb* ./
COPY prisma ./prisma/

# Instalar todas as dependências (incluindo devDependencies para o Prisma)
RUN bun install --frozen-lockfile

# Gerar o cliente Prisma
RUN bunx prisma generate

# Etapa de produção
FROM base AS release

# Copiar node_modules da etapa de instalação
COPY --from=install /app/node_modules ./node_modules

# Copiar todo o código fonte
COPY . .

# Gerar cliente Prisma novamente para garantir compatibilidade
RUN bunx prisma generate

# Expor porta (ajuste conforme necessário)
EXPOSE 3000

# Definir variáveis de ambiente padrão
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["bun", "run", "start:prod"]
