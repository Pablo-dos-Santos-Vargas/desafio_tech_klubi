# Desafio Klubi — Buscador de Carros

Aplicação web para buscar veículos usando o catálogo em `data/cars.json`.
Filtros por marca/modelo, cidade e teto de preço; tratamento de casos em que não há match exato (orçamento ou cidade).
Assistente de chat (Kris) com apoio à escolha e direcionamento ao consórcio Klubi; modal de detalhes por veículo.

---

## Host

Acesse a aplicação em produção pelo link abaixo:

**Link do projeto:**  
<a href="https://desafio-tech-klubi.vercel.app" target="_blank" rel="noopener noreferrer">https://desafio-tech-klubi.vercel.app</a>

### 1. Apresentação da tela inicial
![Demonstração da tela inicial](assets/gifs/pagina_desafio.gif)

---

## Como rodar o projeto

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Abra no navegador o endereço exibido no terminal (geralmente `http://localhost:5173`).

**Assistente com IA (opcional):** no `.env`, defina:
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

---

## Decisões técnicas e experiência do usuário

- Stack: Vite + React + TypeScript.
- Dados: fonte única `data/cars.json`; imagens com URLs públicas.
- Busca: normalização de texto (sem acentos/caixa), regras de “preço abaixo do disponível na cidade” e “modelo em outra localidade”, com mensagens de sugestão em vez de resultado vazio.
- Interface: fluxo em camadas. cards de resultado com preço/local em destaque e chips de cenários.
- Assistente Kris: interpreta texto com preço, marca, cidade ou modelo e orienta ao consórcio Klubi.

---

### 2. Apresentação da pesquisa de carros
![Demonstração da busca de carros](assets/gifs/pesquisa_desafio.gif)

---

### 3. Apresentação do chatbot Kris 
![Demonstração do chatbot](assets/gifs/chat_desafio.gif)

---

## Plano de negócios

### 1. Modelo de negócios
Marketplace B2C com receita principal em taxa administrativa do consórcio (linkando para Klubi).

### 2. Aquisição de primeiros usuários
- Parcerias com empresas e grupos de seminovos.
- Conteúdo em redes sociais (comparativos, vídeos curtos).
- Programa de indicação.
- Comunidades (WhatsApp, fóruns automotivos), micro-influencers locais.

### 3. Estimativa de CAC
Inicial: R$ 40–120 por lead (mídia paga + orgânico).

### 4. LTV e maximização
LTV por receita média de anunciante/usuário.
Maximizar com alertas de preço/modelo, leads qualificados, recomendações baseadas em dados.

### 5. Monetização
CPL/CPA para lojas; comissão em crédito/consórcio/seguro junto a parceiros (com LGPD).

### 6. Retenção
Fluxo para engajar usuário com metas de conquista do carro (avançar em etapas até fechar negócio), notificações e sugestões personalizadas.