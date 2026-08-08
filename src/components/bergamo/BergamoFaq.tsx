import bergamoBrandLogo from "@/assets/bergamo/arsenal-de-prompts-logo.png";

const FAQ = [
  {
    q: "Funciona em qual gerador de imagem?",
    a: "Os prompts são escritos em inglês estruturado e funcionam em qualquer gerador que aceite imagem de referência — ChatGPT/GPT Image, Gemini, Midjourney, Flux, Seedream e similares.",
  },
  {
    q: "Preciso saber escrever prompt?",
    a: "Não. Cada cena vem completa: enquadramento, lente, abertura, luz, roupa, expressão, textura de pele e negative prompt. Você envia sua foto de referência, cola o prompt e gera.",
  },
  {
    q: "O rosto sai parecido comigo mesmo?",
    a: "Sim. Todos os prompts começam com um bloco de travamento de identidade que instrui o modelo a preservar estrutura facial, tom de pele e características únicas.",
  },
  {
    q: "Serve para mulheres e para qualquer tipo físico?",
    a: "Serve. As cenas são neutras quanto a gênero e etnia — o resultado sempre segue a sua foto de referência.",
  },
  {
    q: "Como recebo o acervo?",
    a: "Assim que o pagamento é confirmado você recebe o acesso por e-mail, com o acervo organizado por categoria e as imagens de referência de cada cena.",
  },
];

/** Perguntas frequentes + rodapé isolado do produto. */
export function BergamoFaq() {
  return (
    <>
      <section className="border-t border-border/60">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 lg:py-24">
          <h2 className="font-display text-[1.65rem] leading-tight tracking-tight text-balance text-foreground sm:text-4xl">
            Perguntas frequentes
          </h2>

          <dl className="mt-8 divide-y divide-border/60">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-5">
                <dt className="font-medium text-foreground">{q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 text-xs text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-start gap-4">
            <img
              src={bergamoBrandLogo}
              alt="Arsenal de Prompts — Bergamo Creators"
              className="h-auto w-44 object-contain sm:w-52"
            />
            <p>© {new Date().getFullYear()} Bergamo Creators. Todos os direitos reservados.</p>
          </div>
          <p className="max-w-xs leading-relaxed sm:text-right">
            Produto digital · Conteúdo protegido por direitos autorais
          </p>
        </div>
      </footer>
    </>
  );
}
