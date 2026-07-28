# Design System - Framework .maestro

**Versão**: 1.0.0  
**Status**: ✅ Base Estabelecida

## 1. Princípios de Design

1. **Consistência**: Toda interface segue este padrão rigorosamente
2. **Acessibilidade**: WCAG 2.1 AA mínimo
3. **Performance**: Componentes otimizados para web e mobile
4. **Simplicidade**: Menos é mais. Apenas o necessário.

## 2. Paleta de Cores

### Cores Primárias
- **Primary**: `#0052CC` (Azul)
- **Secondary**: `#6B21A8` (Roxo)
- **Success**: `#22C55E` (Verde)
- **Warning**: `#F59E0B` (Laranja)
- **Danger**: `#EF4444` (Vermelho)

### Cores Neutras
- **Black**: `#000000`
- **Dark Gray**: `#1F2937`
- **Gray**: `#6B7280`
- **Light Gray**: `#E5E7EB`
- **White**: `#FFFFFF`

### Dark Mode (Automático)
Usar `@media (prefers-color-scheme: dark)` para suportar modo escuro.

## 3. Tipografia

### Fontes
- **Sistema**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Mono**: "Monaco", "Courier New", monospace

### Tamanhos e Pesos
- **Display (H1)**: 32px / 700 / line-height 1.2
- **Heading (H2)**: 24px / 600 / line-height 1.3
- **Subheading (H3)**: 18px / 600 / line-height 1.4
- **Body (p)**: 14px / 400 / line-height 1.6
- **Small**: 12px / 400 / line-height 1.5
- **Code**: 13px / 400 / mono / line-height 1.5

## 4. Espaçamento (Escala 4px)

- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px
- **4xl**: 64px

### Aplicação
- Padding interno: `p-md` (12px)
- Gap entre cards: `gap-lg` (16px)
- Margem bottom de seções: `mb-xl` (24px)

## 5. Componentes Base

### Button
```tsx
// Variantes: primary, secondary, danger
// Tamanhos: sm, md, lg
// Estados: default, hover, active, disabled
```

### Card
```tsx
// Padding: p-lg (16px)
// Border-radius: 8px
// Box-shadow: 0 1px 3px rgba(0,0,0,0.1)
// Gap entre cards: gap-lg (16px)
```

### Input
```tsx
// Altura: 40px
// Padding: 8px 12px
// Border: 1px solid #E5E7EB
// Radius: 6px
```

### Modal
```tsx
// Overlay: rgba(0,0,0,0.5)
// Max-width: 600px
// Padding: p-xl (24px)
```

## 6. Breakpoints (Tailwind Compatible)

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## 7. Validação de Componentes

Antes de mergear, todo componente deve:
- [ ] Passar lint (ESLint + Prettier)
- [ ] Renderizar em desktop (1440px+)
- [ ] Renderizar em tablet (768px)
- [ ] Renderizar em mobile (375px)
- [ ] Suportar dark mode
- [ ] Ter contraste WCAG AA

---

**Nota**: Qualquer desvio deste Design System deve ser aprovado por revisor e documentado em PR.
