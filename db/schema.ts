import { sqliteTable, text, integer, primaryKey, index } from "drizzle-orm/sqlite-core";

export const mobileProfiles = sqliteTable("mobile_profiles", {
  userId:text("user_id").primaryKey(), nickname:text("nickname").notNull(),
  role:text("role").notNull(), city:text("city").notNull(), updatedAt:text("updated_at").notNull(),
});
export const mobileVisits = sqliteTable("mobile_visits", {
  userId:text("user_id").notNull(), scenicId:text("scenic_id").notNull(),
  listened:text("listened").notNull().default("[]"), checkedAt:text("checked_at"), journalAt:text("journal_at"),
  answers:text("answers").notNull().default("[]"), quizScore:integer("quiz_score"), updatedAt:text("updated_at").notNull(),
}, table=>[primaryKey({columns:[table.userId,table.scenicId]})]);
export const mobileMedia = sqliteTable("mobile_media", {
  id:text("id").primaryKey(), userId:text("user_id").notNull(), scenicId:text("scenic_id").notNull(),
  kind:text("kind").notNull(), style:text("style").notNull(), mime:text("mime").notNull(), createdAt:text("created_at").notNull(),
},table=>[index("idx_mobile_media_user").on(table.userId,table.createdAt)]);
