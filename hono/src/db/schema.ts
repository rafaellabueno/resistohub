import { desc, type InferSelectModel } from "drizzle-orm"
import {
  bigint,
  datetime,
  decimal,
  double,
  foreignKey,
  index,
  int,
  json,
  longtext,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core"

export type PipelineJSON = {
  pipelineCode?: string | null;
  pipelineGitLink?: string | null;
};

export type LocationJSON = {
  city: string | null;
  country: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
};

export const User = mysqlTable(
  "user",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", {
      length: 255,
    }),
    lastName: varchar("last_name", {
      length: 255,
    }),
    email: varchar("email", { length: 512 }).unique(),
    description: longtext("description"),
    status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
    hashedPassword: varchar("hashed_password", { length: 255 }),
    lang: mysqlEnum("lang", ["en-us", "pt-br", "es-es"]).default("en-us"),
    country: varchar("country", { length: 255 }),
    institution: varchar("institution", { length: 255 }),
    typeSpecialist: varchar("type_specialist", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
    position: varchar("position", { length: 255 }),
  },
  (table) => ({
    emailIndex: index("email_idx").on(table.email),
  }),
)

export const Session = mysqlTable("user_session", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  expiresAt: datetime("expires_at").notNull(),
})

export const Profile = mysqlTable(
  "profile",
  {
    id: serial("id").primaryKey(),
    idUser: bigint("id_user", { mode: "number", unsigned: true }).references(
      () => User.id,
    ),
    profile: mysqlEnum("profile", ["client", "admin"]).default(
      "client",
    ),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
  },
  (table) => ({
    profileIndex: index("profile_idx").on(table.profile),
  }),
)

export const Notification = mysqlTable("notification", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  status: mysqlEnum("status", ["read", "unread"]).default("unread"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  json: json("json"),
})

export const AuthenticatorNumber = mysqlTable("authenticator_number", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  email: varchar("email", { length: 255 }),
  authenticatorNumber: varchar("authenticator_number", { length: 255 }),
  status: mysqlEnum("status", ["utilized", "waiting"]).default("waiting"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const Tag = mysqlTable("tag", {
  id: serial("id").primaryKey(),
  tag: varchar("tag", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const Tool = mysqlTable("tool", {
  id: serial("id").primaryKey(),
  tool: varchar("tool", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "waiting"]).default("inactive"),
  description: longtext("description"),
  article: longtext("article"),
  articleLink: varchar("article_link", { length: 255 }),
  contact: varchar("contact", { length: 255 }),
  website: varchar("website", { length: 255 }),
  github: varchar("github", { length: 255 }),
  tutorial: longtext("tutorial"),
  install: longtext("install"),
  code: longtext("code"),
  siteDoc: varchar("site_doc", { length: 255 }),
  update: datetime("update"),
  version: varchar("version", { length: 255 }),
  stars: int("stars", { unsigned: true }),
  documentation: longtext("documentation"),
  development: varchar("development", { length: 255 }),
  type: mysqlEnum("type", ["analysis", "visualization", "prediction", "other"]).default("other"),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
  authors: longtext("authors"),
  doi: varchar("doi", { length: 255 }),
  datasetExamplesJson: json("dataset_examples_json"),
  outputExamplesJson: json("output_examples_json"),
  inputFormats: json("input_formats"),
  executionTime: mysqlEnum("execution_time", ["fast", "medium", "slow"]).default("medium"),
  computeRequirements: mysqlEnum("compute_requirements", ["light", "medium", "heavy"]).default("medium"),
  programmingLanguage: varchar("programming_language", { length: 255 }),
  database: mysqlEnum("database", ["yes", "no"]).default("no"),
})

export const SuggestionTool = mysqlTable("suggestion_tool", {
  id: serial("id").primaryKey(),
  tool: varchar("tool", { length: 255 }),
  description: longtext("description"),
  website: varchar("website", { length: 255 }),
  github: varchar("github", { length: 255 }),
  contact: varchar("contact", { length: 255 }),
  isDeveloper: varchar("is_developer", { length: 255 }),
})

export const ToolTag = mysqlTable("tool_tag", {
  id: serial("id").primaryKey(),
  idTool: bigint("id_tool", { mode: "number", unsigned: true }).references(() => Tool.id),
  idTag: bigint("id_tag", { mode: "number", unsigned: true }).references(() => Tag.id),
})

export const Pathogen = mysqlTable("pathogen", {
  id: serial("id").primaryKey(),
  pathogen: varchar("pathogen", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const ToolPathogen = mysqlTable("tool_pathogen", {
  id: serial("id").primaryKey(),
  idTool: bigint("id_tool", { mode: "number", unsigned: true }).references(() => Tool.id),
  idPathogen: bigint("id_pathogen", { mode: "number", unsigned: true }).references(() => Pathogen.id),
})

export const Star = mysqlTable("star", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  idTool: bigint("id_tool", { mode: "number", unsigned: true }).references(() => Tool.id),
  number: int("number", { unsigned: true }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const CommentTool = mysqlTable("comment_tool", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  idTool: bigint("id_tool", { mode: "number", unsigned: true }).references(() => Tool.id),
  comment: varchar("comment", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const Question = mysqlTable("question", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  question: varchar("question", { length: 255 }),
  description: longtext("description"),
  resolved: mysqlEnum("resolved", ["no", "yes"]).default("no"),
  relatedArticle: varchar("related_article", { length: 255 }),
  relatedTool: bigint("related_tool", { mode: "number", unsigned: true }).references(() => Tool.id),
  relatedProtocol: bigint("related_protocol", { mode: "number", unsigned: true }).references(() => Protocol.id),
  relatedWorkflow: bigint("related_workflow", { mode: "number", unsigned: true }).references(() => Workflow.id),
  relatedUseCase: bigint("related_use_case", { mode: "number", unsigned: true }).references(() => UseCase.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
  type: mysqlEnum("type", ["clinical", "negative-result", "publication", "general"]).default("general"),
  clinicalUnit: varchar("clinical_unit", { length: 255 }),
  region: varchar("region", { length: 255 }),
  additionalInfo: longtext("additional_info"),
  studyType: mysqlEnum("study_type", ["in-vitro", "in-vivo", "computational", "clinical"]).default("clinical"),
  sampleSize: int("sample_size", { unsigned: true }),
  workingHipothesis: longtext("working_hypothesis"),
  conclusions: longtext("conclusions"),
  authors: longtext("authors"),
  journal: varchar("journal", { length: 255 }),
  doi: varchar("doi", { length: 255 }),
  abstract: longtext("abstract"),
  year: int("year", { unsigned: true }),
  scope: longtext("scope"),
  targetAudience: longtext("target_audience"),
  graphicalAbstract: longtext("graphical_abstract"),
})

export const QuestionTag = mysqlTable("question_tag", {
  id: serial("id").primaryKey(),
  idQuestion: bigint("id_question", { mode: "number", unsigned: true }).references(() => Question.id),
  idTag: bigint("id_tag", { mode: "number", unsigned: true }).references(() => Tag.id),
})

export const VoteQuestion = mysqlTable("vote_question", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  idQuestion: bigint("id_question", { mode: "number", unsigned: true }).references(() => Question.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const CommentQuestion = mysqlTable("comment_question", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  idQuestion: bigint("id_question", { mode: "number", unsigned: true }).references(() => Question.id),
  comment: varchar("comment", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const VoteCommentQuestion = mysqlTable("vote_comment_question", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  idQuestion: bigint("id_question", { mode: "number", unsigned: true }).references(() => Question.id),
  idComment: bigint("id_comment", { mode: "number", unsigned: true }).references(() => CommentQuestion.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const StarTool = mysqlTable("star_tool", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  idTool: bigint("id_tool", { mode: "number", unsigned: true }).references(() => Tool.id),
  number: int("number", { unsigned: true }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const Protocol = mysqlTable("protocol", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  title: varchar("title", { length: 255 }),
  category: varchar("category", { length: 255 }),
  description: longtext("description"),
  doi: json("doi"),
  authors: longtext("authors"),
  institution: varchar("institution", { length: 255 }),
  date: datetime("date"),
  validation: varchar("validation", { length: 255 }),
  estimatedTime: varchar("estimated_time", { length: 255 }),
  document: longtext("document"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
  methodology: longtext("methodology"),
  materials: longtext("materials"),
  troubleshooting: longtext("troubleshooting"),
  protocolType: varchar("protocol_type", { length: 255 }),
})

export const ProtocolTag = mysqlTable("protocol_tag", {
  id: serial("id").primaryKey(),
  idProtocol: bigint("id_protocol", { mode: "number", unsigned: true }).references(() => Protocol.id),
  idTag: bigint("id_tag", { mode: "number", unsigned: true }).references(() => Tag.id),
})

export const Pipeline = mysqlTable("pipeline", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  name: varchar("name", { length: 255 }),
  description: longtext("description"),
  data: json("data"),
  pipeline: json("pipeline"),
  link: varchar("link", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const Surveillance = mysqlTable("surveillance", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  title: longtext("title"),
  description: longtext("description"),
  severity: mysqlEnum("severity", ["critical", "watch", "info"]).default("critical"),
  bacterium: varchar("bacterium", { length: 255 }),
  resistance: varchar("resistance", { length: 255 }),
  location: json("location"),
  facility: varchar("facility", { length: 255 }),
  date: datetime("date"),
  reportedBy: varchar("reported_by", { length: 255 }),
  isolatesCount: int("isolates_count", { unsigned: true }),
  antibiotics: json("antibiotics"),
  status: mysqlEnum("status", ["monitoring", "resolved", "closed"]).default("monitoring"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
  antibiogram: json("antibiogram"),
  eventType: mysqlEnum("event_type", ["isolated", "cluster", "suspected_outbreak", "confirmed_outbreak", "regional_emergency"]).default("isolated"),
  environment: mysqlEnum("environment", ["community", "hospital", "icu", "outpatient", "other"]).default("community"),
  sampleOrigin: mysqlEnum("sample_origin", ["blood_culture", "urine", "swab", "respiratory_secretion", "csf", "other"]).default("blood_culture"),
  detectionDate: datetime("detection_date"),
  eventStartDate: datetime("event_start_date"),
  eventEndDate: datetime("event_end_date"),
  detectionType: mysqlEnum("detection_type", ["phenotypic", "pcr", "wgs", "other"]).default("phenotypic"),
  certaintyDegree: mysqlEnum("certainty_degree", ["lab_confirmed", "preliminary_data", "clinical_report", "sequencing_in_progress"]).default("lab_confirmed"),
  useSuggestedSeverity: mysqlEnum("use_suggested_severity", ["yes", "no"]).default("yes"),
  manualSeverity: mysqlEnum("manual_severity", ["info", "watch", "critical"]).default("info"),
  institution: varchar("institution", { length: 255 }),
})

export const Workflow = mysqlTable("workflow", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  description: longtext("description"),
  toolSequence: json("tool_sequence"),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  rating: double("rating", { unsigned: true }),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
  pipeline: json("pipeline").$type<PipelineJSON>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const WorkflowTag = mysqlTable("workflow_tag", {
  id: serial("id").primaryKey(),
  idWorkflow: bigint("id_workflow", { mode: "number", unsigned: true }).references(() => Workflow.id),
  idTag: bigint("id_tag", { mode: "number", unsigned: true }).references(() => Tag.id),
})

export const WorkflowUser = mysqlTable("workflow_user", {
  id: serial("id").primaryKey(),
  idWorkflow: bigint("id_workflow", { mode: "number", unsigned: true }).references(() => Workflow.id),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  name: varchar("name", { length: 255 }),
  institution: varchar("institution", { length: 255 }),
  location: json("location").$type<LocationJSON>(),
  type: mysqlEnum("type", ["student", "researcher", "lab", "other"]).default("other"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const ToolUser = mysqlTable("tool_user", {
  id: serial("id").primaryKey(),
  idTool: bigint("id_tool", { mode: "number", unsigned: true }).references(() => Tool.id),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  name: varchar("name", { length: 255 }),
  institution: varchar("institution", { length: 255 }),
  location: json("location").$type<LocationJSON>(),
  type: mysqlEnum("type", ["student", "researcher", "lab", "other"]).default("other"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const UseCase = mysqlTable("use_case", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  description: longtext("description"),
  recommendedTools: json("recommended_tools"),
  stepByStepGuide: longtext("step_by_step_guide"),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
})

export const UseCaseUser = mysqlTable("use_case_user", {
  id: serial("id").primaryKey(),
  idUseCase: bigint("id_use_case", { mode: "number", unsigned: true }).references(() => UseCase.id),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  name: varchar("name", { length: 255 }),
  institution: varchar("institution", { length: 255 }),
  location: json("location").$type<LocationJSON>(),
  type: mysqlEnum("type", ["student", "researcher", "lab", "other"]).default("other"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const WorkflowRating = mysqlTable("workflow_rating", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  idWorkflow: bigint("id_workflow", { mode: "number", unsigned: true }).references(() => Workflow.id),
  rating: int("rating", { unsigned: true }),
  comment: longtext("comment"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const UseCaseRating = mysqlTable("use_case_rating", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  idUseCase: bigint("id_use_case", { mode: "number", unsigned: true }).references(() => UseCase.id),
  rating: int("rating", { unsigned: true }),
  comment: longtext("comment"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})

export const DeletionLog = mysqlTable("deletion_log", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 255 }),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  deletedBy: bigint("deleted_by", { mode: "number", unsigned: true }).references(() => User.id),
  payload: json("payload"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

export const ToolRating = mysqlTable("tool_rating", {
  id: serial("id").primaryKey(),
  idUser: bigint("id_user", { mode: "number", unsigned: true }).references(() => User.id),
  idTool: bigint("id_tool", { mode: "number", unsigned: true }).references(() => Tool.id),
  rating: int("rating", { unsigned: true }),
  comment: longtext("comment"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).onUpdateNow(),
})