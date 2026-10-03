export const CATEGORY_KEYS = {
    DNA_EXTRACTION: "dna_extraction",
    RNA_EXTRACTION: "rna_extraction",
    RAPID_TEST: "rapid_test",
    MASS_SPECTROMETRY: "mass_spectrometry",
    GENOMICS: "genomics",
    ANTIMICROBIAL_TESTING: "antimicrobial_testing",
    MOLECULAR_IDENTIFICATION: "molecular_identification",
    PROTEIN_ANALYSIS: "protein_analysis",
    BIOINFORMATICS: "bioinformatics",
    OTHER: "other"
} as const;

export type CategoryKey = typeof CATEGORY_KEYS[keyof typeof CATEGORY_KEYS];

export const CATEGORIES_MAP: Record<CategoryKey, string> = {
    [CATEGORY_KEYS.DNA_EXTRACTION]: "dna_extraction",
    [CATEGORY_KEYS.RNA_EXTRACTION]: "rna_extraction",
    [CATEGORY_KEYS.RAPID_TEST]: "rapid_test",
    [CATEGORY_KEYS.MASS_SPECTROMETRY]: "mass_spectrometry",
    [CATEGORY_KEYS.GENOMICS]: "genomics",
    [CATEGORY_KEYS.ANTIMICROBIAL_TESTING]: "antimicrobial_testing",
    [CATEGORY_KEYS.MOLECULAR_IDENTIFICATION]: "molecular_identification",
    [CATEGORY_KEYS.PROTEIN_ANALYSIS]: "protein_analysis",
    [CATEGORY_KEYS.BIOINFORMATICS]: "bioinformatics",
    [CATEGORY_KEYS.OTHER]: "other"
};


export const CATEGORY_KEYS_LIST = Object.values(CATEGORY_KEYS);


export const getCategoryLabel = (
    categoryKey: string,
    content: Record<string, any>
): string => {
    const keyToContentProperty: Record<string, string> = {
        [CATEGORY_KEYS.DNA_EXTRACTION]: "dnaExtraction",
        [CATEGORY_KEYS.RNA_EXTRACTION]: "rnaExtraction",
        [CATEGORY_KEYS.RAPID_TEST]: "rapidTest",
        [CATEGORY_KEYS.MASS_SPECTROMETRY]: "massSpectrometry",
        [CATEGORY_KEYS.GENOMICS]: "genomics",
        [CATEGORY_KEYS.ANTIMICROBIAL_TESTING]: "antimicrobialTesting",
        [CATEGORY_KEYS.MOLECULAR_IDENTIFICATION]: "molecularIdentification",
        [CATEGORY_KEYS.PROTEIN_ANALYSIS]: "proteinAnalysis",
        [CATEGORY_KEYS.BIOINFORMATICS]: "bioinformatics",
        [CATEGORY_KEYS.OTHER]: "other"
    };

    const contentProperty = keyToContentProperty[categoryKey];
    return contentProperty ? content[contentProperty] || categoryKey : categoryKey;
};


export const getCategoriesWithLabels = (
    content: Record<string, any>
): Array<{ key: CategoryKey; label: string }> => {
    return CATEGORY_KEYS_LIST.map((key) => ({
        key: key as CategoryKey,
        label: getCategoryLabel(key, content)
    }));
};
