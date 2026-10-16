# Site Verax — v1

Site estático (HTML, CSS e JavaScript puros, sem build), feito a partir da página **Final** do Figma.

## Estrutura

Todos os arquivos ficam juntos na raiz, sem pastas. Assim, para atualizar o site, basta selecionar todos os arquivos desta pasta e enviar ao GitHub de uma vez.

- `index.html`: a página
- `style.css`: estilos e tokens do Verax Design System
- `main.js`: interações
- `.woff2`: fontes Manrope, IBM Plex Sans e IBM Plex Mono (licença OFL)
- `.svg`: logo, favicon e ícones exportados do Figma
- `.jpg`: fotos e quadros de vídeo
- `.mp4` / `.webm`: vídeos

## Vídeos

Vídeos:

- `globo.mp4` e `globo-1280.mp4`: a varredura do globo, controlada pela rolagem (a versão 1280 é usada em telas de até 900px). Foram codificados com um quadro-chave a cada 6 quadros, para a rolagem ficar suave — se trocar o vídeo, mantenha esse tipo de codificação.
- `missao.mp4/.webm` e `servicos.mp4/.webm`: tocam em loop.

## Antes de publicar para valer

- **E-mail de contato:** os botões "Vamos conversar" abrem o e-mail sem destinatário. Troque `mailto:?subject=...` por `mailto:seu-email@dominio?subject=...` no `index.html` (2 lugares).
- **Links do rodapé:** Privacidade, Termos, LGPD, Status e Cookies apontam para `#`.
- **Depoimentos:** os textos são ilustrativos. Substitua por depoimentos reais e autorizados.
- **Imagem de compartilhamento:** quando tiver o domínio final, troque `og.jpg` na tag `og:image` pelo endereço completo (ex.: `https://verax.com.br/og.jpg`).

## Testar no computador

Abra a pasta num terminal e rode `python3 -m http.server`. Depois acesse `http://localhost:8000`.

## Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub (Add file → Upload files).
2. Na Vercel: Add New → Project → importe o repositório.
3. Framework Preset: **Other**. Não precisa de comando de build.
4. Deploy.
