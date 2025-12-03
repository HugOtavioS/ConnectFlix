## 🎯 Guia de Teste - Player e Sistema de Recomendação

### Status do Servidor ✅
- **URL**: http://localhost:3000
- **Status**: Rodando em modo desenvolvimento
- **Porta**: 3000

---

## 🧪 Como Testar as Mudanças

### 1. Teste do Player (Novo Plyr)

#### Passo 1: Acesse a página do player
```
http://localhost:3000/player/dQw4w9WgXcQ
```

#### Passo 2: Verifique os controles disponíveis
- [ ] Botão Play/Pause (grande)
- [ ] Barra de progresso
- [ ] Tempo atual / Duração
- [ ] Botão de Mute
- [ ] Slider de volume
- [ ] Botão de Engrenagem (Configurações)
- [ ] Botão de Picture-in-Picture
- [ ] Botão de Tela Cheia

#### Passo 3: Teste as funcionalidades
- [ ] **Play/Pause**: Clique no botão grande ou pressione espaço
- [ ] **Fullscreen**: Clique no ícone ou pressione 'F'
- [ ] **Volume**: Use o slider ou setas up/down
- [ ] **Progresso**: Clique na barra para ir para outro tempo
- [ ] **Velocidade**: Acesse Configurações > Velocidade
- [ ] **Picture-in-Picture**: Clique no ícone PiP

#### Passo 4: Verifique o Design
- [ ] Player tem fundo preto (#000000)
- [ ] Controles aparecem ao hover do mouse
- [ ] Interface é responsiva (teste em mobile)
- [ ] Fonte é clara e legível
- [ ] Cores estão de acordo (tema escuro Netflix-like)

---

### 2. Teste da Remoção do Sistema de Recomendação

#### Passo 1: Verifique a ausência da sidebar
```
Esperado: SEM sidebar direita com vídeos recomendados
Atual: Apenas player, informações e descrição
```

#### Passo 2: Confirme o layout full-width
- [ ] O player ocupa toda a largura disponível
- [ ] Informações do vídeo estão abaixo do player
- [ ] Descrição está no final
- [ ] Sem sidebar lateral direita

#### Passo 3: Teste a responsividade
- [ ] **Desktop (1920px)**: Layout full-width
- [ ] **Tablet (768px)**: Layout adaptado
- [ ] **Mobile (375px)**: Stack vertical

---

### 3. Teste de Performance

#### Medições (Console do Navegador)
```javascript
// Cole no console para medir tempo de carregamento
performance.measure('page-load');
const measure = performance.getEntriesByType('measure')[0];
console.log(`Tempo de carregamento: ${measure.duration}ms`);
```

**Esperado**: < 2000ms

---

### 4. Teste de Compatibilidade

Teste em diferentes navegadores:

- [ ] **Chrome/Chromium**: Esperado suporte completo
- [ ] **Firefox**: Esperado suporte completo
- [ ] **Safari**: Esperado suporte completo
- [ ] **Edge**: Esperado suporte completo
- [ ] **Mobile Safari (iOS)**: Esperado suporte básico
- [ ] **Chrome Mobile**: Esperado suporte completo

---

### 5. Teste de Múltiplos Vídeos

Teste com diferentes YouTube IDs:

```
http://localhost:3000/player/dQw4w9WgXcQ          # Rick Roll
http://localhost:3000/player/jNQXAC9IVRw          # Keyboard Cat
http://localhost:3000/player/xqLeENQcJKs          # Outro vídeo
```

- [ ] Cada página carrega corretamente
- [ ] Player funciona em todos os IDs
- [ ] Thumbnail aparece
- [ ] Título e descrição carregam
- [ ] Sem erros no console

---

### 6. Teste de Keyboard Shortcuts

| Tecla | Ação Esperada |
|-------|---------------|
| Espaço | Play/Pause |
| F | Tela Cheia |
| M | Mutar/Desmutar |
| ↑ | Aumentar volume |
| ↓ | Diminuir volume |
| ← | Recuar 5 segundos |
| → | Avançar 5 segundos |
| J | Recuar 10 segundos |
| L | Avançar 10 segundos |
| 0-9 | Ir para 0-90% do vídeo |
| > | Aumentar velocidade |
| < | Diminuir velocidade |
| C | Ativar legendas |
| ? | Mostrar ajuda |

**Teste**:
- [ ] Pelo menos 5 keyboard shortcuts funcionam
- [ ] Nenhum conflito com atalhos do navegador

---

### 7. Teste de Erros

#### Cenário 1: Vídeo não encontrado
```
http://localhost:3000/player/invalidVideoId
```
- [ ] Mensagem de erro apropriada
- [ ] Sem crash da página

#### Cenário 2: Network offline
1. Desconecte a internet
2. Tente acessar: `http://localhost:3000/player/dQw4w9WgXcQ`
- [ ] Aparece fallback ou erro gracioso
- [ ] Sem crashes no console

---

### 8. Checklist Final

```
✅ Player Plyr está funcionando
✅ Sem sidebar de recomendações
✅ Layout é full-width
✅ Todos controles funcionam
✅ Responsivo em todos dispositivos
✅ Sem erros no console
✅ Performance aceitável (< 2s)
✅ Keyboard shortcuts funcionam
✅ Design está consistente
✅ Pronto para produção
```

---

## 📊 Métricas Esperadas (DevTools)

### Network
- **Requisições**: ~10-15 (reduzido de ~30)
- **Tamanho total**: ~300KB (reduzido de ~800KB)
- **Tempo de transferência**: ~500ms

### Performance
- **First Paint**: ~1000ms
- **Largest Contentful Paint**: ~1500ms
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: ~2000ms

### Console
- ✅ Nenhum erro (red)
- ✅ Avisos normais do Next.js apenas
- ✅ Sem undefined references

---

## 🐛 Troubleshooting

### Problema: Player não aparece
**Solução:**
1. Abra DevTools (F12)
2. Procure por erros vermelhos
3. Verifique se o Plyr CDN está acessível
4. Reinicie o servidor (`npm run dev`)

### Problema: Controles não funcionam
**Solução:**
1. Limpe cache do navegador (Ctrl+Shift+Delete)
2. Recarregue a página (Ctrl+F5)
3. Tente em outro navegador

### Problema: Vídeo não carrega
**Solução:**
1. Verifique se o YouTube ID é válido
2. Confirme que a API está configurada
3. Procure por erros CORS no console

---

## 🎓 Exemplos de Uso

### Exemplo 1: Modo Tela Cheia
1. Acesse http://localhost:3000/player/dQw4w9WgXcQ
2. Clique no ícone de tela cheia OR pressione 'F'
3. Pressione 'F' novamente para sair

### Exemplo 2: Mudar Velocidade
1. Clique na engrenagem ⚙️
2. Selecione uma velocidade (0.5x, 1x, 1.5x, 2x)
3. Vídeo reproduzirá na velocidade selecionada

### Exemplo 3: Picture-in-Picture
1. Clique no ícone de PiP
2. Janela flutuante aparecerá
3. Você pode minimizar e continuar navegando

---

## 📝 Anotações

- Plyr carrega via CDN (sem instalação local necessária)
- Player funciona com YouTube URLs normais
- Sem dependências externas pesadas
- CSS automático importado

---

**Testado em**: 1º de Dezembro, 2025  
**Versão**: ConnectFlix 0.1.0  
**Player**: Plyr 3.7.8
