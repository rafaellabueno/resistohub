import { authProcedure, publicProcedure, router } from "../trpc"
import { z } from "zod"
import axios from "axios"
import { db, dbSchema } from "../../db";
import { eq } from "drizzle-orm"
import { insertNotification } from "../controllers/notifications";
import { uploadImageMinIO } from "../../utils/upload";

function decodeHtmlEntities(text: string) {
  if (!text) return '';

  const entityMap = {
    // Caracteres especiais comuns em textos científicos
    '&alpha;': 'α', '&#x3b1;': 'α', '&#945;': 'α',
    '&beta;': 'β', '&#x3b2;': 'β', '&#946;': 'β',
    '&gamma;': 'γ', '&#x3b3;': 'γ', '&#947;': 'γ',
    '&delta;': 'δ', '&#x3b4;': 'δ', '&#948;': 'δ',
    '&epsilon;': 'ε', '&#x3b5;': 'ε', '&#949;': 'ε',
    '&mu;': 'μ', '&#x3bc;': 'μ', '&#956;': 'μ',
    '&sigma;': 'σ', '&#x3c3;': 'σ', '&#963;': 'σ',
    '&omega;': 'ω', '&#x3c9;': 'ω', '&#969;': 'ω',
    '&nbsp;': ' ', '&#160;': ' ',
    '&lt;': '<', '&#60;': '<', '&#x3c;': '<',
    '&gt;': '>', '&#62;': '>', '&#x3e;': '>',
    '&amp;': '&', '&#38;': '&', '&#x26;': '&',
    '&quot;': '"', '&#34;': '"', '&#x22;': '"',
    '&apos;': "'", '&#39;': "'", '&#x27;': "'",
    '&deg;': '°', '&#176;': '°', '&#xb0;': '°',
    '&plusmn;': '±', '&#177;': '±', '&#xb1;': '±'
  };

  return text.replace(/&[a-z]+;|&#\d+;|&#x[0-9a-f]+;/gi, function (match) {
    if (entityMap.hasOwnProperty(match)) {
      return entityMap[match as keyof typeof entityMap];
    }

    if (match.startsWith('&#')) {
      if (match.startsWith('&#') && match.endsWith(';')) {
        const decimal = match.substring(2, match.length - 1);
        if (!isNaN(parseInt(decimal, 10))) {
          return String.fromCharCode(parseInt(decimal, 10));
        }
      }

      if (match.startsWith('&#x') && match.endsWith(';')) {
        const hex = match.substring(3, match.length - 1);
        if (/^[0-9a-f]+$/i.test(hex)) {
          return String.fromCharCode(parseInt(hex, 16));
        }
      }
    }

    return match;
  });
}

export const educationalRouter = router({
  getArticles: publicProcedure.input(
    z.object({
      limit: z.number().max(20).default(10),
      offset: z.number().optional().default(0),
      searchQuery: z.string(),
      sortBy: z.enum(["relevance", "date"]).optional().default("date"),
      filters: z.object({
        fullText: z.boolean().optional().default(false),
        lastFiveYears: z.boolean().optional().default(false),
        lastTenYears: z.boolean().optional().default(false),
        freeFullText: z.boolean().optional().default(false),
      }).optional().default({})
    }),
  ).query(async ({ input }) => {
    try {
      let searchTerm = input.searchQuery.trim().toLowerCase();

      let query = input.searchQuery
        ? `("drug resistance, bacterial"[MeSH] OR antibiotic resistance OR AMR) AND (${input.searchQuery})`
        : '("drug resistance, bacterial"[MeSH] OR antimicrobial resistance OR antibiotic resistance OR multidrug resistance OR AMR) AND (bioinformatics OR "computational biology"[MeSH] OR "genome sequencing" OR "resistance gene detection" OR "in silico analysis" OR "bacterial genome analysis")';

      const sort = input.sortBy === 'relevance' ? 'relevance' : 'date'

      let term = query;

      if (input.filters?.freeFullText) {
        term += ' AND free full text[sb]';
      }
      if (input.filters?.fullText) {
        term += ' AND full text[sb]';
      }
      if (input.filters?.lastFiveYears) {
        const year = new Date().getFullYear() - 5;
        term += ` AND ${year}[dp]:3000[dp]`;
      }
      if (input.filters?.lastTenYears) {
        const year = new Date().getFullYear() - 10;
        term += ` AND ${year}[dp]:3000[dp]`;
      }

      let searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=${input.limit}&retstart=${input.offset}&sort=${sort}`;

      const searchResponse = await axios.get(searchUrl)
      const ids = searchResponse.data.esearchresult.idlist

      if (!ids || ids.length === 0) {
        return []
      }

      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
      const summaryResponse = await axios.get(summaryUrl)

      const efetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`
      const efetchResponse = await axios.get(efetchUrl)

      const abstracts: Record<string, string> = {}
      const isOpenAccess: Record<string, boolean> = {}
      const isPeerReviewed: Record<string, boolean> = {}
      const keywords: Record<string, string[]> = {}

      const xmlString = efetchResponse.data

      const articleRegex = /<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g
      let articleMatch

      while ((articleMatch = articleRegex.exec(xmlString)) !== null) {
        const articleXml = articleMatch[0]

        const pmidMatch = /<PMID[^>]*>([\d]+)<\/PMID>/i.exec(articleXml)
        if (!pmidMatch) continue

        const pmid = pmidMatch[1]

        isOpenAccess[pmid] = /<PublicationStatus>(?:epublish|ppublish)<\/PublicationStatus>/i.test(articleXml) &&
          /<PublicationType>(?:.*?Open Access.*?)<\/PublicationType>/i.test(articleXml)

        isPeerReviewed[pmid] = /<PublicationType>(?:.*?Journal Article.*?)<\/PublicationType>/i.test(articleXml)

        let abstractText = ""

        const fullAbstractMatch = /<Abstract>([\s\S]*?)<\/Abstract>/i.exec(articleXml)

        if (fullAbstractMatch) {
          const abstractContent = fullAbstractMatch[1]

          const abstractTextSections = abstractContent.match(/<AbstractText[^>]*>[\s\S]*?<\/AbstractText>/g) || []

          if (abstractTextSections.length > 0) {
            const hasLabels = abstractTextSections.some(section =>
              /<AbstractText[^>]*Label="[^"]*"[^>]*>/i.test(section)
            )

            if (hasLabels) {
              abstractText = abstractTextSections
                .map(section => {
                  const labelMatch = /<AbstractText[^>]*Label="([^"]*)"[^>]*>/i.exec(section)
                  const label = labelMatch ? `**${labelMatch[1]}:** ` : ''

                  const textMatch = /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/i.exec(section)
                  const text = textMatch ? decodeHtmlEntities(textMatch[1].replace(/<[^>]*>/g, '')) : ''

                  return label + text
                })
                .join(' ')
                .trim()
            } else {
              abstractText = abstractTextSections
                .map(section => {
                  const textMatch = /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/i.exec(section)
                  return textMatch ? decodeHtmlEntities(textMatch[1].replace(/<[^>]*>/g, '')) : ''
                })
                .join(' ')
                .trim()
            }
          }
        }

        if (!abstractText) {
          const allAbstractTexts = articleXml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)
          if (allAbstractTexts && allAbstractTexts.length > 0) {
            abstractText = allAbstractTexts
              .map(section => {
                const textMatch = /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/i.exec(section)
                return textMatch ? decodeHtmlEntities(textMatch[1].replace(/<[^>]*>/g, '')) : ''
              })
              .join(' ')
              .trim()
          }
        }

        if (abstractText) {
          abstracts[pmid] = abstractText
        }
      }

      const result = []
      for (const id of ids) {
        const article = summaryResponse.data.result[id]
        if (article) {
          const doiStrings = article.elocationid?.trim()?.split(" ") || []
          const doi = doiStrings.length > 0 ? doiStrings[doiStrings.length - 1] : ''

          const title = decodeHtmlEntities(article.title || 'No title available')
          const abstract = decodeHtmlEntities(abstracts[id]?.replace(/\*/g, '') ||
            article.abstracttext ||
            article.abstract ||
            'Abstract not available')

          result.push({
            id: id,
            title: article.title || 'No title available',
            authors: article.authors ? article.authors.map((a: any) => a.name).join(', ') : 'Unknown',
            journal: article.fulljournalname || article.source || 'Unknown Journal',
            year: article.pubdate ? article.pubdate.substring(0, 4) : 'Unknown',
            doi: doi || '',
            abstract: abstracts[id]?.replace(/\*/g, '') || article.abstracttext || article.abstract || 'Abstract not available',
            isOpenAccess: isOpenAccess[id] || false,
            isPeerReviewed: isPeerReviewed[id] || false,
          })
        }
      }

      return result
    } catch (error) {
      return []
    }
  }),

  saveForumPost: authProcedure.input(
    z.object({
      title: z.string().min(1, "Título é obrigatório"),
      message: z.string().min(1, "Descrição é obrigatória"),
      tags: z.string().optional().default(""),
      type: z.enum(['clinical', 'negative-result', 'publication', 'general']).optional().default('general'),
      clinicalUnit: z.string().optional(),
      region: z.string().optional(),
      additionalInfo: z.string().optional(),
      studyType: z.enum(['in-vitro', 'in-vivo', 'computational', 'clinical']).optional(),
      sampleSize: z.number().optional(),
      workingHypothesis: z.string().optional(),
      conclusions: z.string().optional(),
      authors: z.string().optional(),
      journal: z.string().optional(),
      year: z.number().optional(),
      doi: z.string().optional(),
      abstract: z.string().optional(),
      relatedArticle: z.string().optional(),
      relatedTool: z.string().optional(),
      relatedProtocol: z.string().optional(),
      scope: z.string().optional(),
      targetAudience: z.string().optional(),
      graphicalAbstract: z.string().optional(),
    }),
  ).mutation(async ({ input, ctx }) => {
    try {
      if (input.graphicalAbstract) {
        const result = await uploadImageMinIO({
          image: input.graphicalAbstract,
        })
        input.graphicalAbstract = result.fileName
      }
      const [{ insertId }] = await db.insert(dbSchema.Question).values({
        idUser: ctx.user.id,
        question: input.title,
        description: input.message,
        resolved: "no",
        type: input.type,
        clinicalUnit: input.clinicalUnit || null,
        region: input.region || null,
        additionalInfo: input.additionalInfo || null,
        studyType: input.studyType || null,
        sampleSize: input.sampleSize || null,
        workingHipothesis: input.workingHypothesis || null,
        conclusions: input.conclusions || null,
        authors: input.authors || null,
        journal: input.journal || null,
        year: input.year || null,
        doi: input.doi || null,
        abstract: input.abstract || null,
        relatedArticle: input.relatedArticle ?? null,
        relatedTool: input.relatedTool ? Number(input.relatedTool) : null,
        relatedProtocol: input.relatedProtocol ? Number(input.relatedProtocol) : null,
        scope: input.scope || null,
        targetAudience: input.targetAudience || null,
        graphicalAbstract: input.graphicalAbstract || null,
      });

      const tagsArray = input.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const insertedTagIds: number[] = [];

      for (const tag of tagsArray) {
        const existTag = await db
          .select()
          .from(dbSchema.Tag)
          .where(eq(dbSchema.Tag.tag, tag))
          .limit(1)
          .then((res) => res[0]);

        if (!existTag) {
          const [{ insertId: tagId }] = await db
            .insert(dbSchema.Tag)
            .values({ tag, createdAt: new Date() });
          insertedTagIds.push(tagId);
        } else {
          insertedTagIds.push(existTag.id);
        }
      }

      if (insertedTagIds.length > 0) {
        await db.insert(dbSchema.QuestionTag).values(
          insertedTagIds.map((idTag) => ({
            idQuestion: insertId,
            idTag,
            createdAt: new Date(),
          }))
        );
      }

      return {
        id: insertId,
        success: true,
        message: "Tópico criado com sucesso!",
      };
    } catch (error) {
      console.error("Erro ao salvar forum post:", error);
      throw new Error("Erro ao criar tópico. Tente novamente.");
    }
  }),
  getTags: publicProcedure.query(async ({ }) => {
    const tags = await db.select().from(dbSchema.Tag)
    return tags
  }),
})