# Qualità Embalagens — Site Premium

Site reconstruído a partir do MVP em Lovable (`qualita-impacto-digital.lovable.app`) com identidade real extraída do **@qualitaembalagens**.

## Como rodar

```bash
# já configurado em ~/.claude/launch.json como "Qualita Preview"
npx serve . -l 5180
```

Acesso: `http://localhost:5180`

## Stack

- **HTML5** semântico, **CSS** puro com custom properties + container queries
- **Lenis** (smooth scroll)
- **GSAP + ScrollTrigger** (scrolltelling no processo)
- **IntersectionObserver** (reveal on scroll, count-up)
- **Fraunces** (display editorial) + **Inter** (UI) + **JetBrains Mono** (dados)

Sem build. Sem dependências locais. Tudo via CDN.

## Identidade aplicada

Extraída dos prints do Instagram:

| Item | Valor real |
|---|---|
| Nome | **Qualità** (com crase italiano) |
| Categoria | Fabricante de plástico |
| Bio | "Transformamos plástico reciclado em embalagens sustentáveis. Atacado com responsabilidade ♻️" |
| Cor primária | `#2D5F3F` (verde garrafa do logo) |
| Cor cream | `#F5F1E8` (fundo do logo) |
| Acento | `#B8841E` (dourado terroso) |
| Cobertura | Atendemos todo o Brasil |
| Produtos reais | Sacos de Lixo, Sacolas Camiseta, Personalizadas, Bobinas |
| Tom | Direto, B2B simples, "Solicite suas amostras" |
| Logo | Sacolinha plástica formato camiseta + símbolo reciclagem 3 setas |

## Seções (ordem)

1. **Hero** — recicle. transforme. impacte. (Fraunces) + lixeiras coleta seletiva
2. **Marquee** — público-alvo (Atacarejo · Hortifruti · Frigoríficos…)
3. **Manifesto** — "8.500 toneladas/hora" (count-up animado)
4. **Processo Scrollytelling** — Coleta → Transformação → Produção (GSAP pin)
5. **Stats Band** — 500t · 10M · 300+ · 18 anos
6. **Produtos** — 4 cards editoriais com tilt 3D (sacos, sacolas, personalizadas, bobinas)
7. **Decreto 2026** — Argumento regulatório (Lei 15.234/2025 — 32% reciclado obrigatório)
8. **Bento Diferenciais** — Atendemos Brasil todo + 5 pontos
9. **Impacto** — Números reais com count-up (500t · −72% CO₂ · 100%)
10. **Depoimento** — Quote editorial
11. **Contato/Orçamento** — Form completo + WhatsApp + Instagram + LinkedIn
12. **Footer** — Catálogo, empresa, certificações, contato

## Motion budget

- Smooth scroll global (Lenis)
- Hero: word-by-word reveal stagger
- Manifesto: count-up de 0→8500
- Processo: pinned scrollytelling com 3 imagens trocando
- Stats/Impact: count-up no scroll into view
- Cards: tilt 3D no hover
- Botões: magnetic effect
- Cursor custom (mix-blend-mode difference)
- Scroll progress bar topo
- `prefers-reduced-motion: reduce` respeitado em tudo

## Pendências / próximos passos

### Pra ficar 100% real
- [ ] **Substituir logo SVG** por logo oficial (vetorial enviado pelo cliente)
- [ ] **Trocar fotos Unsplash** por fotos reais do galpão da Qualità (extrusora EXTRUSATEC, sacos pretos empilhados, bobinas verdes em produção, operador com cachorro na empilhadeira)
- [ ] Validar **CNPJ, endereço, telefone** reais (atualmente placeholder)
- [ ] Pegar **link do site oficial** (se houver) na bio do Insta
- [ ] Confirmar **decreto 2026** com fonte legal exata (Lei 15.234/2025)

### Bugs conhecidos
- Tool `preview_screenshot` retorna branco em `scrollY > 1500` por conflito com Lenis (não afeta navegação real do usuário, só captura via MCP)

## Deploy

Site é estático puro — zero build. Pra deployar:

```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --dir .

# GitHub Pages
git push  # qualquer branch + Pages enabled
```

Domínio sugerido: `qualita.com.br` ou `qualitaembalagens.com.br`.
