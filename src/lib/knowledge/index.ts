// ============================================================
// Knowledge Retrieval — Fetch & cache official documentation
// ============================================================

/**
 * Tier 1 authoritative sources (priority order)
 */
export const AUTHORITATIVE_SOURCES: Record<string, string> = {
  python: "https://docs.python.org/3/",
  pandas: "https://pandas.pydata.org/docs/",
  polars: "https://docs.pola.rs/",
  duckdb: "https://duckdb.org/docs/",
  fastapi: "https://fastapi.tiangolo.com/",
  sqlalchemy: "https://docs.sqlalchemy.org/",
  pyarrow: "https://arrow.apache.org/docs/python/",
  docker: "https://docs.docker.com/",
  git: "https://git-scm.com/doc",
}

/**
 * Map mission topics to relevant doc URLs for knowledge retrieval.
 */
export function getRelevantSources(topics: string[]): string[] {
  const sources = new Set<string>()

  const topicMap: Record<string, string> = {
    print: "https://docs.python.org/3/library/functions.html#print",
    variable: "https://docs.python.org/3/tutorial/introduction.html",
    type: "https://docs.python.org/3/library/stdtypes.html",
    string: "https://docs.python.org/3/library/string.html",
    input: "https://docs.python.org/3/library/functions.html#input",
    fstring: "https://docs.python.org/3/tutorial/inputoutput.html",
    if: "https://docs.python.org/3/tutorial/controlflow.html#if-statements",
    loop: "https://docs.python.org/3/tutorial/controlflow.html#for-statements",
    for: "https://docs.python.org/3/tutorial/controlflow.html#for-statements",
    while: "https://docs.python.org/3/tutorial/controlflow.html#while-statements",
    list: "https://docs.python.org/3/tutorial/datastructures.html#more-on-lists",
    function: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions",
    "error handling": "https://docs.python.org/3/tutorial/errors.html",
    exception: "https://docs.python.org/3/tutorial/errors.html",
    tuple: "https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences",
    set: "https://docs.python.org/3/tutorial/datastructures.html#sets",
    dict: "https://docs.python.org/3/tutorial/datastructures.html#dictionaries",
    dictionary: "https://docs.python.org/3/tutorial/datastructures.html#dictionaries",
    comprehension: "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions",
    generator: "https://docs.python.org/3/tutorial/classes.html#iterators",
    iterator: "https://docs.python.org/3/tutorial/classes.html#iterators",
    file: "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files",
    csv: "https://docs.python.org/3/library/csv.html",
    json: "https://docs.python.org/3/library/json.html",
    api: "https://docs.python.org/3/library/json.html",
    requests: "https://docs.python.org/3/library/urllib.request.html",
    numpy: "https://numpy.org/doc/stable/user/quickstart.html",
    pandas: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/",
    dataframe: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/",
    duckdb: "https://duckdb.org/docs/",
    pyarrow: "https://arrow.apache.org/docs/python/",
    parquet: "https://arrow.apache.org/docs/python/parquet.html",
    fastapi: "https://fastapi.tiangolo.com/tutorial/first-steps/",
    docker: "https://docs.docker.com/language/python/",
    pytest: "https://docs.pytest.org/en/stable/",
    test: "https://docs.pytest.org/en/stable/",
  }

  for (const topic of topics) {
    const lower = topic.toLowerCase()
    for (const [key, url] of Object.entries(topicMap)) {
      if (lower.includes(key)) {
        sources.add(url)
      }
    }
  }

  // Default: Python tutorial
  if (sources.size === 0) {
    sources.add("https://docs.python.org/3/tutorial/index.html")
  }

  return Array.from(sources)
}

/**
 * Build a context package for the AI from mission + student data.
 * In production, this fetches from knowledge_cache table.
 */
export function buildContextPackage(
  mission: { officialSources: string[]; learningObjectives: string[]; title: string },
  student: { level: number; weakTopics: string[] }
): {
  sources: string[]
  snippets: string[]
  contextPrompt: string
} {
  const primarySources = mission.officialSources.length > 0
    ? mission.officialSources
    : getRelevantSources(mission.learningObjectives)

  const snippets = primarySources.map(
    (url) => `[Source: ${url}]\nUse the official documentation for "${mission.title}" and keep examples aligned to the learner's current objectives.`
  )

  const contextPrompt = `SOURCES TO USE (MANDATORY):
${primarySources.map((s) => `- ${s}`).join("\n")}

STUDENT LEVEL: ${student.level}
WEAK TOPICS: ${student.weakTopics.join(", ") || "None"}`

  return {
    sources: primarySources,
    snippets,
    contextPrompt,
  }
}
