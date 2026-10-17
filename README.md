# Meu Livrinho de Colorir

Livrinhos de colorir com o nome da criança, prontos em minutos, para lembrancinha de festa ou presente.
Site: meulivrinhodecolorir.com.br

O documento de produto e marca (personas, jornada, LP, paleta, temas, metas) está em
[`docs/produto-e-marca.md`](docs/produto-e-marca.md). O mapa do código está em
[`docs/mapa-do-codigo.md`](docs/mapa-do-codigo.md).

## Rodar

```bash
npm install
cp .env.example .env.local   # preencha o que tiver
npm run dev
```

## Conferir antes de publicar

```bash
npm run conferir              # tipos, estilo, regras do nome, regras do pedido, travessão
npm run conferir:navegador    # LP e fluxo do pedido num Chromium de celular (veja o topo do script)
```
