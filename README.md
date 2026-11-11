# ✦ Convida — Gerador de Convites

Aplicação web para criar convites de eventos. O usuário preenche os dados do evento, escolhe
a cor principal, um tema (ou uma imagem própria), o estilo claro ou escuro e gera um convite
pronto para imprimir ou salvar em PDF.

Desafio da formação Full Stack da Rocketseat.

🔗 **Acesse online:** https://lopesdz7.github.io/gerador-convites/

## ✨ Funcionalidades

**Formulário do evento**
- Título, data/hora de início e fim, tipo (presencial ou online), local e descrição;
- E-mail e telefone de contato (com máscara automática no telefone);
- Ao escolher "Online", o campo de local vira "Link ou plataforma";
- Contador de caracteres na descrição.

**Personalização do convite**
- **Estilo claro ou escuro** com um toggle;
- **Paleta de 8 cores** para a cor principal, com destaque na cor escolhida;
- **Grade de 5 temas** com imagens (Festa, Corporativo, Natureza, Elegante e Tech), com seleção única;
- **Imagem de capa personalizada**: o upload mostra o nome do arquivo, pode ser removido
  e seleciona automaticamente o tema "Minha imagem".

**Validação**
- Todos os campos obrigatórios são validados ao clicar em **Gerar convite**;
- Mensagem de erro em vermelho embaixo de cada campo, com destaque na borda;
- Aviso acima do botão dizendo quantos campos faltam, e foco no primeiro campo com erro;
- Depois da primeira tentativa, os erros somem conforme o usuário corrige os campos;
- Regras extras: e-mail válido, telefone com DDD (10 ou 11 dígitos), fim depois do início,
  imagem de até 5 MB e imagem obrigatória quando o tema é "Minha imagem".

**Convite**
- Gerado ao lado do formulário (ou abaixo, no celular) com animação de entrada;
- Botão **Imprimir / salvar PDF**, que imprime só o convite.

**Acessibilidade e responsividade**
- `label` em todos os campos, `aria-invalid` e `aria-describedby` ligando cada campo ao seu erro;
- Grupos de opções com `radiogroup` e navegação por teclado com foco visível;
- Layout em duas colunas no desktop e em uma coluna no tablet e no celular;
- Respeita `prefers-reduced-motion`.

## 🛠️ Tecnologias

- HTML5
- CSS3 (variáveis, Grid, Flexbox, `:has()`, media queries, animações)
- JavaScript (sem bibliotecas)

## ▶️ Como rodar

Não precisa instalar nada.

1. Clone o repositório:
   ```bash
   git clone https://github.com/lopesdz7/gerador-convites.git
   ```
2. Abra o `index.html` no navegador, ou use a extensão **Live Server** do VS Code.

## 📁 Estrutura

```
gerador-convites/
├── index.html            # formulário e convite
├── style.css             # reset, variáveis, layout, componentes e responsividade
├── script.js             # validação, máscara, upload e geração do convite
└── assets/themes/        # imagens dos temas (SVG)
```
