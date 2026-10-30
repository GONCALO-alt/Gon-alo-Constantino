/**
 * Acesso ao conteúdo do curso, servido como ficheiros estáticos (public/content).
 *
 *  - index.json é pequeno e carrega-se uma vez (estrutura + IDs das lições).
 *  - Cada unidade carrega-se só quando é aberta, e fica em cache em memória.
 *  - Os pedidos repetidos para a mesma unidade partilham a mesma promessa.
 *  - Os dados são validados com o esquema: um ficheiro corrompido dá um erro claro.
 */
import {
  CourseIndexSchema, UnitBundleSchema, VocabBundleSchema,
  type CourseIndex, type PublishedLesson, type UnitBundle, type VocabBundle,
} from '../domain/schemas.ts';

export type Fetcher = (url: string) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export class ContentError extends Error {
  readonly url: string;
  constructor(message: string, url: string) {
    super(message);
    this.name = 'ContentError';
    this.url = url;
  }
}

export class ContentRepository {
  private index: Promise<CourseIndex> | null = null;
  private units = new Map<string, Promise<UnitBundle>>();
  private vocab = new Map<string, Promise<VocabBundle | null>>();
  /** Número de pedidos feitos (útil para testes de carregamento progressivo). */
  requests = 0;

  private readonly baseUrl: string;
  private readonly fetcher: Fetcher;
  private readonly maxCachedUnits: number;

  constructor(baseUrl: string, fetcher: Fetcher = (u) => fetch(u), maxCachedUnits = 40) {
    this.baseUrl = baseUrl;
    this.fetcher = fetcher;
    this.maxCachedUnits = maxCachedUnits;
  }

  private async get<T>(path: string, parse: (x: unknown) => T): Promise<T> {
    const url = this.baseUrl + path;
    this.requests++;
    let res: Awaited<ReturnType<Fetcher>>;
    try {
      res = await this.fetcher(url);
    } catch {
      throw new ContentError('Não foi possível carregar o conteúdo. Verifique a ligação e tente de novo.', url);
    }
    if (!res.ok) throw new ContentError(`Conteúdo indisponível (${res.status}).`, url);
    try {
      return parse(await res.json());
    } catch (e) {
      throw new ContentError(`Conteúdo inválido em ${path}: ${(e as Error).message.slice(0, 200)}`, url);
    }
  }

  loadIndex(): Promise<CourseIndex> {
    if (!this.index) {
      this.index = this.get('index.json', (x) => CourseIndexSchema.parse(x));
      this.index.catch(() => (this.index = null));
    }
    return this.index;
  }

  loadUnit(unitId: string): Promise<UnitBundle> {
    let p = this.units.get(unitId);
    if (!p) {
      p = this.get(`units/${unitId}.json`, (x) => UnitBundleSchema.parse(x));
      p.catch(() => this.units.delete(unitId));
      this.units.set(unitId, p);
      // Limita a memória: remove as unidades mais antigas da cache.
      while (this.units.size > this.maxCachedUnits) this.units.delete(this.units.keys().next().value!);
    }
    return p;
  }

  async loadLesson(lessonId: string): Promise<PublishedLesson> {
    const unitId = lessonId.slice(0, lessonId.lastIndexOf('-'));
    const unit = await this.loadUnit(unitId);
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new ContentError('Esta lição já não existe ou foi movida.', lessonId);
    return lesson;
  }

  /** Vocabulário de uma secção (null se a secção ainda não tem conteúdo publicado). */
  loadVocab(sectionId: string): Promise<VocabBundle | null> {
    let p = this.vocab.get(sectionId);
    if (!p) {
      p = this.get(`vocab/${sectionId}.json`, (x) => VocabBundleSchema.parse(x)).catch((e: unknown) => {
        if (e instanceof ContentError && e.message.includes('(404)')) return null;
        this.vocab.delete(sectionId);
        throw e;
      });
      this.vocab.set(sectionId, p);
    }
    return p;
  }

  clear(): void {
    this.index = null;
    this.units.clear();
    this.vocab.clear();
  }
}

/**
 * Na versão de ficheiro único (dist-single/), o conteúdo vem embutido na página
 * em `window.__DUTCHPATH_CONTENT__` (caminho relativo → JSON), para funcionar sem servidor.
 */
const embedded = (globalThis as { __DUTCHPATH_CONTENT__?: Record<string, unknown> }).__DUTCHPATH_CONTENT__;
const embeddedFetcher: Fetcher = async (url) => {
  const key = url.replace(/^.*?content\//, '');
  const data = embedded?.[key];
  return { ok: data !== undefined, status: data !== undefined ? 200 : 404, json: async () => data };
};

export const contentRepo = embedded
  ? new ContentRepository('content/', embeddedFetcher)
  : new ContentRepository(`${import.meta.env?.BASE_URL ?? '/'}content/`);
